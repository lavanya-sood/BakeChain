//require('dotenv').config();
const Web3 = require('web3');
const contract = require('truffle-contract');
const oracle = require('./build/Oracle.json');
const fs = require('fs');
const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const puppeteer = require("puppeteer");
// set up web3
if (typeof web3 !== 'undefined') {
    	
} else {
  var web3 = new Web3(new Web3.providers.WebsocketProvider('http://localhost:8545'))
}

// set up the contracts
async function setup() {
	const ORC = contract(oracle)
	ORC.setProvider(web3.currentProvider);
	const orc = await ORC.deployed();
	const address = await orc.getAddress();
	console.log(address);
	writeAddress(address);
	const oracleEvent = orc.request()
	  .on('data', async (event) => {
	  	let batchId = event.returnValues.data;
	  	console.log(batchId);
	  	// call blockchain and get the ingredients ids
	    let url = 'http://127.0.0.1:8082/getProductIngredients?id=' + batchId;
	    let res = await fetch(url);
		console.log("RESULT FROM GETPRODUCTINGREDITENST: " + res);
	    res = await res.json();
	    
	    const ingredientIds = JSON.parse(res.result);
	    let ingredients = [];
	    for(let i = 0; i < ingredientIds.length; i++) {
	    	url = 'http://127.0.0.1:8082/getIngredientDetails?id=' + ingredientIds[i].ingredientId;
	    	res = await fetch(url);
	    	res = await res.json();
	    	const tmp = JSON.parse(res.result);
	    	console.log(tmp)
	    	ingredients.push(tmp[0].name);
	    }
	    console.log(ingredients);
	  	// call scraper and call the function in a loop
	  	let isVegan = true;
	  	let isVegetarian = true;
	  	let isGlutenFree = true;
	  	for (let i = 0; i < ingredients.length; i++) {
	  		let vegan = await checkIngredient('https://chompthis.com/ingredient/guide.php', ingredients[i], 'Vegan');
	  		console.log(vegan, ingredients[i])
				let vege = await checkIngredient('https://chompthis.com/ingredient/guide.php', ingredients[i], 'Vegetarian');
				let gluten = await checkIngredient('https://chompthis.com/ingredient/guide.php', ingredients[i], 'Gluten-Free');
				if (ingredients[i].includes('flour')) {
					gluten = false;
				}
				if (!vegan) {
					isVegan = false;
				}
				if (!vege) {
					isVegetarian = false;
				}
				if (!gluten) {
					isGlutenFree = false;
				}
				if (!isVegan && !isVegetarian && !isGlutenFree) break;
	  	}
	  	console.log(isVegan, isVegetarian, isGlutenFree)
	  	const accounts = await web3.eth.getAccounts();
	  	await orc.setData(batchId, isVegan, isVegetarian, isGlutenFree, {from: accounts[0]});
	  })
	  .on('error', (err) => {
	  	throw(err);
	  })
	console.log(orc.request)

}

setup();

function writeAddress (address) {
	const data = {
		"oracle_address": address
	}
	const jsonData = JSON.stringify(data);
	fs.writeFile('../addresses.json', jsonData, (err) => {
		if (err) {
			throw (err);
		}
		console.log('saved');
	});
}




async function getText(website, type) {
	const res = await fetch(website);
	const text = await res.text();
  const dom = await new JSDOM(text);
  const tbody = dom.window.document.querySelector("tbody.filterableTable."+type);
  const rows = tbody.querySelectorAll('tr th');
  const ingredients = [];
  rows.forEach((td) => {
  	ingredients.push(td.textContent);
  });
  return ingredients;
}

async function checkIngredient(website, ingredient, type) {
	const ingredients = await getText(website, type);
	for (let i = 0; i < ingredients.length; i++) {
		if (ingredient.toLowerCase().includes(ingredients[i].toLowerCase())) {
			return false;
		}
	}
	return true;
}

checkIngredient('https://chompthis.com/ingredient/guide.php', 'abalone', 'Vegan');
checkIngredient('https://chompthis.com/ingredient/guide.php', 'abalone', 'Vegetarian');
checkIngredient('https://chompthis.com/ingredient/guide.php', 'abalone', 'Gluten-Free');
checkIngredient('https://chompthis.com/ingredient/guide.php', 'italian seasoning', 'Gluten-Free');