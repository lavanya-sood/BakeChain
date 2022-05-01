//require('dotenv').config();
const express= require('express')
const app =express()
const routes = require('./routes')
const Web3 = require('web3');
const { MongoClient } = require('mongodb');
const contract = require('truffle-contract');
const foodchain = require('./build/FoodChain.json');
const addresses = require('../addresses.json');

// set up the app 
app.use(express.json());
app.use((req, res, next) => {
		// ensure cors access 
		// allows calls from frontend
  	res.header('Access-Control-Allow-Origin', '*');
  	res.header('Access-Control-Allow-Headers', '*');
  	next();
});
// set up web3
if (typeof web3 !== 'undefined') {
    var web3 = new Web3(web3.currentProvider)
  } else {
    var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
}
// set up the contracts
const FC = contract(foodchain)
FC.setProvider(web3.currentProvider)
// set up the mongo db
const uri = "mongodb+srv://user-1:YLZT4WtcJIpo5Bew@bakechain.shgfv.mongodb.net/BakeChain?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// connect the db
client.connect(async err => {
		// get one db collection (may move to routes.js so that multiple collections can be opened)
	  const db = client.db("BakeChain");
	  // set up the accounts for the transactions
	  const accounts = await web3.eth.getAccounts();
	  // deploy the contracts
	  const fc = await FC.deployed();
	  await fc.setOracle(addresses.oracle_address, {from: accounts[0]});
	  // call the routes function to handle api calls and communicate with blockchain and the db
	  routes(app, db, fc, accounts)
	  // listen for calls to the app
	  app.listen(process.env.PORT || 8082, () => {
	     console.log('listening on port '+ (process.env.PORT || 8082));
	  })
	  //client.close();
});

