const jwt = require("jsonwebtoken");
const { ethers } = require('ethers');
var getUid = require('get-uid');

const jwtSecret = 'superSecretKeySHHHHHHHHH';

async function getProductIngredients(req,res) { 
    let id = parseInt(req.query.id);
    if (id) {
        const ingredientDb = db.collection("batch-ingredient");
        ingredientDb.find({batchId: id}).toArray((err, tup) => {
            console.log(tup, id)
            if (err) throw err;
            if (tup) {
                const jsonTup = JSON.stringify(tup);
                res.json({status: "success", result: jsonTup})
            } else {
                res.json({status: "success", reason: "No batch with ingredients exists"})
            }
        })
    } else {
        res.status(400).json({"status":"Failed", "reason":"wrong input"})
    }
}

// Returns the user if the user is authorised to be a manufacturer/producer/retailer
// If they don't exist, returns null
// Input is an ethereum address
async function checkAddressIsAuthorised(db, address) {
    // Check that user's account address is in the database of our authorised users
    const userDb = db.collection("authorised-users");
    let userInDb = await userDb.findOne({
        address: address.toLowerCase()
    })
    return userInDb;
}

// Read for more info
// https://www.section.io/engineering-education/how-to-build-authentication-api-with-jwt-token-in-nodejs/
const verifyToken = (req, res, next) => {
    const token =
      req.body.token || req.query.token || req.headers['Authorisation'] || req.headers['authorisation'];
    if (!token) {
      return res.status(403).send("A token is required for authentication");
    }
    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.user = decoded;
    } catch (err) {
      return res.status(401).send("Invalid Token");
    }
    return next();
};

// function is called by the server when api calls are made
function routes(app, db, fc, accounts){

    // AUTHENTICATION FUNCTIONS
    app.get('/getLoginNonce', async (req, res) => {
        let receivedAddress = req.query.account;

        let userInDb = await checkAddressIsAuthorised(db, receivedAddress);
        if (!userInDb) {
            res.status(401).json({"status": "Failed", "reason": "User address " + receivedAddress + " is not in the list of authorised users!"});
            return;
        }

        // Return the user's nonce from the database
        res.json({"status": "success", "auth_nonce": userInDb.auth_nonce});
    })

    app.post('/login', async (req, res) => {
        let receivedAddress = req.body.account;
        let receivedSignature = req.body.signed;

        // Check that user's account address is in the database of our authorised users
        let userInDb = await checkAddressIsAuthorised(db, receivedAddress);
        if (!userInDb) {
            res.status(401).json({"status": "Failed", "reason": "User address " + receivedAddress + " is not in the list of authorised users!"});
            return;
        }

        // Retrieve the actual address that signed the signature we received
        // We use a nonce that changes after each login that's associated with the user
        const message = "Sign into bakechain! Code: " + userInDb.auth_nonce.toString();
        const actualAddress = ethers.utils.verifyMessage(message, receivedSignature);

        // Compare frontend signature to backend
        if (actualAddress.toLowerCase() == receivedAddress.toLowerCase()) {
            // Success! This user is authenticated
            console.log("Success! User " + receivedAddress + " successfully authenticated")
            // Return JWT for the user to store
            // Create token
            const token = jwt.sign(
                { account: receivedAddress }, jwtSecret,
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );

            // Change the nonce for the user in the database
            const userDb = db.collection("authorised-users");
            await userDb.updateOne({address: receivedAddress}, {
                $set: {
                    auth_nonce: Math.floor((Math.random()*10000) + 1),
                    token: token
                }
            })
            res.json({status: "success", token: token})
        }
        else {
            res.status(401).json({"status": "Failed", "reason":"Incorrect user signed this message. Expected: " + receivedAddress + ", actual address: " + actualAddress})
        }
    })

    // CUSTOMER
    // get the information related to the product
    app.get('/product', async (req, res) => {
        let id = parseInt(req.query.id);
        if (id) {
            // check if the product exists in blockchain
            let productCheck = await fc.viewProduct(id, {from: accounts[0]});
            console.log(productCheck);
            if (productCheck) {
                //find product information from database
                const productDb = db.collection("baking-products");
                productDb.find({id: id}).toArray((err, tup) => {
                    if (err) throw err;
                    if (tup) {
                        const jsonTup = JSON.stringify(tup);
                        console.log(jsonTup);
                        res.json({status: "success", result: jsonTup})
                    } else {
                        res.json({status: "success", reason: "No product information exists"})
                    }
                })
            } else {
                res.status(404).json({"status":"Failed", "reason":"Product does not exist on Blockchain"})
            }
        }
    })

    // SMART CONTRACT FUNCTIONS
    
    // ADD INGREDIENT
    app.post('/addIngredient', verifyToken, async ( req, res ) =>
    {
        // Products are for the manufacturer
        let farmer = "Farmer";
        // ADD TO THE ACTUAL MANUFACTURER LOCATION
        let location = req.body.location;
        // gets the details from the fetch in frontend code 'Manufacturer.js'
        let company = req.body.company; // ADD IN FIELD FOR MANUFACTURER COMPANY NAME
        let name = req.body.name;
        let weight = req.body.weight;
        let price = req.body.price;
        let productionDate = req.body.produced;
        let expiryDate = req.body.expiry;
        let recallStatus = false;
        let quantity = req.body.quantity;

        // generate a id/barcode
        let id = getUid() + getUid();
         
        let hash = await fc.addIngredientBatch( id, { from: accounts[ 0 ] } );
        if ( hash ) {
            // get the product db to add details to
            const ingredientDb = db.collection("ingredients");
            // insert the product
            ingredientDb.insertOne( { id, company, name, farmer, location, weight, price, productionDate, expiryDate, recallStatus, quantity } );
            // give response to frontend
            res.json( { "status": "success", id: id } );
        } else {
            // give response to frontend
            res.status( 500 ).json( { "status": "Failed", "reason": "Upload error occured" } );
        }
    } )

    // ADD PRODUCT
    app.post('/addProduct', verifyToken, async (req,res)=>{
        // Products are for the manufacturer
        let manufacturer = "Manufacturer";
        // ADD TO THE ACTUAL MANUFACTURER LOCATION
        let location = req.body.location;
        // gets the details from the fetch in frontend code 'Manufacturer.js'
        let company = req.body.company // ADD IN FIELD FOR MANUFACTURER COMPANY NAME
        let name = req.body.name;
        let weight = req.body.weight
        let price = req.body.price;
        let productionDate = req.body.produced;
        let expiryDate = req.body.expiry;
        let recallStatus = false;
        let quantity = req.body.quantity;
        let ingredients = req.body.ingredients;
        let retail_price = "0.00";
        let retailer = "";
        let retail_location = "";

        // generate a id/barcode
        let id = getUid() + getUid();
        
        let hash = await fc.addProductBatch(id, ingredients, {from: accounts[0]});
        if (hash) {
            // get the product db to add details to
            const productDb = db.collection("baking-products");
            // insert the product
            productDb.insertOne({id, company, name, manufacturer, location, weight, price, productionDate, expiryDate, recallStatus, quantity, retail_price, retailer, retail_location})
            // add ingredients and batches relationship to db
            // MAY CHANGE TO INCLUDE
            const batchIngredients = db.collection('batch-ingredient');
            for (let i = 0; i < ingredients.length; i++) {
                console.log(ingredients[i])
                const ingredientId = ingredients[i]; 
                // insert the relationship into the db
                // add batchId: id so that the column name is batchId, otherwise it defaults to the parameter name
                batchIngredients.insertOne({batchId: id, ingredientId});
            }
            // give response to frontend
            res.json({"status":"success", id: id})
        } else {
            // give response to frontend
            res.status(500).json({"status":"Failed", "reason":"Upload error occured"})
        }
    })

    // ADD RETAIL PRODUCT
    app.post( '/addRetailProduct', verifyToken, async ( req, res ) =>
    {
        // Get retail details
        let retail_price = req.body.retail_price;
        let retailer = req.body.retailer;
        let retail_location = req.body.retail_location;

        console.log("ADDING RETAIL DETAILS");
        console.log(retailer);

        let id = parseInt(req.body.product_id);
        if ( id ) {
            await fc.retailProduct( id, { from: accounts[ 0 ] } );
            const productDb = db.collection( "baking-products" );
            productDb.findOneAndUpdate(
                { id: id },
                { $set: { retail_price : retail_price, retailer: retailer, retail_location: retail_location}},
                { returnOriginal: false },
                ( err, tup ) =>
                {
                    console.log( tup, id );
                    if ( err ) throw err;
                    if ( tup )
                    {
                        const jsonTup = JSON.stringify( tup );
                        res.json( { status: "success", result: jsonTup } );
                    } else
                    {
                        res.json( { status: "success", reason: "No product with this id exists" } );
                    }
                }
            );
        } else {
            res.status( 400 ).json( { "status": "Failed", "reason": "wrong input" } );
        }
    } )

    // LIST OF INGREDIENTS/ PRODUCTS BASED ON CERTAIN CRITERIA
    // gets all the products with their details (for the producer page)
    app.get('/allproductbatches', verifyToken, async (req,res)=>{
        let manufacturer= req.query.manufacturer;
        if (manufacturer) {
            const productDb = db.collection("baking-products");
            // find all batches the manufacturer owns
            productDb.find({manufacturer: manufacturer}).toArray((err, tup) => {
                if (err) throw err;
                if (tup) {
                    const jsonTup = JSON.stringify(tup);
                    // returns details of the products to the frontend
                    res.json({status: "success", product: jsonTup})
                } else {
                    // message when no products exist
                    res.json({status: "success", reason: manufacturer + " has no batches"})
                }
            })
        // insufficient queries provided
        } else {
            res.status(400).json({"status":"Failed", "reason":"wrong input"})
        }
    })

    // gets all the retailed products with their details (for the producer page)
    app.get( '/allretailbatches', verifyToken, async ( req, res ) =>
    {
        console.log("GETTING RETAIL PRODUCTS");
        let manufacturer = req.query.manufacturer;
        if ( manufacturer )
        {
            const productDb = db.collection( "baking-products" );
            // find all batches the manufacturer owns
            productDb.find( { retailer: { $ne: ""} } ).toArray( ( err, tup ) =>
            {
                if ( err ) throw err;
                if ( tup )
                {
                    const jsonTup = JSON.stringify( tup );
                    // returns details of the products to the frontend
                    res.json( { status: "success", product: jsonTup } );
                } else
                {
                    // message when no products exist
                    res.json( { status: "success", reason: manufacturer + " has no batches" } );
                }
            } );
            // insufficient queries provided
        } else
        {
            res.status( 400 ).json( { "status": "Failed", "reason": "wrong input" } );
        }
    } )

    // gets all ingredient batches with deets
    app.get( '/allingredientbatches', verifyToken, async ( req, res ) =>{
        let farmer = req.query.farmer;
        if ( farmer ) {
            const productDb = db.collection( "ingredients" );
            // find all ingredients the farmer owns
            productDb.find().toArray( ( err, tup ) =>
            {
                if ( err ) throw err;
                if ( tup )
                {
                    const jsonTup = JSON.stringify( tup );
                    // returns details of the products to the frontend
                    res.json( { status: "success", product: jsonTup } );
                } else
                {
                    // message when no products exist
                    res.json( { status: "success", reason: farmer + " has no batches" } );
                }
            } );
            // insufficient queries provided
        } else {
            res.status( 400 ).json( { "status": "Failed", "reason": "wrong input" } );
        }
    } )

    // LIST OF PRODUCTS/ INGREDIENTS REGARDLESS OF CREATOR
    // gets all ingredients
    app.get('/allingredients', verifyToken, async (req,res)=>{
        const productDb = db.collection("ingredients");
        // find all ingredients
        productDb.find().toArray((err, tup) => {
            if (err) throw err;
            if (tup) {
                const jsonTup = JSON.stringify(tup);
                // returns details of the products to the frontend
                res.json({status: "success", ingredients: jsonTup})
            } else {
                res.status(400).json({"status":"Failed", "reason":"db returned nothing"})
            }
        })
    })

    // gets all products
    app.get( '/allproducts', verifyToken, async ( req, res ) =>
    {
        const productDb = db.collection( "baking-products" );
        // find all ingredients
        productDb.find().toArray( ( err, tup ) =>
        {
            if ( err ) throw err;
            if ( tup )
            {
                const jsonTup = JSON.stringify( tup );
                // returns details of the products to the frontend
                res.json( { status: "success", products: jsonTup } );
            } else
            {
                res.status( 400 ).json( { "status": "Failed", "reason": "db returned nothing" } );
            }
        } );
    } )

    // GET STORED DETAILS
    // gets ingredient details 
    app.get('/getIngredientDetails', async (req,res)=>{
        let id = parseInt(req.query.id);
        if (id) {
            const ingredientDb = db.collection("ingredients");
            ingredientDb.find({id: id}).toArray((err, tup) => {
                if (err) throw err;
                if (tup) {
                    const jsonTup = JSON.stringify(tup);
                    console.log("JSON TUPLE!!!")
                    console.log(jsonTup);
                    res.json({status: "success", result: jsonTup})
                } else {
                    res.json({status: "success", reason: "No ingredient exists"})
                }
            })
        } else {
            res.status(400).json({"status":"Failed", "reason":"wrong input"})
        }
    })

    // gets product details 
    app.get( '/getProductDetails', verifyToken, async ( req, res ) =>
    {
        let id = parseInt( req.query.id );
        if ( id )
        {
            const productDb = db.collection( "baking-products" );
            productDb.find( { id: id } ).toArray( ( err, tup ) =>
            {
                if ( err ) throw err;
                if ( tup )
                {
                    const jsonTup = JSON.stringify( tup );
                    res.json( { status: "success", result: jsonTup } );
                } else
                {
                    res.json( { status: "success", reason: "No ingredient exists" } );
                }
            } );
        } else
        {
            res.status( 400 ).json( { "status": "Failed", "reason": "wrong input" } );
        }
    } )

    // PRODUCT TO INGREDIENT RELATION FUNCTIONS
    // gets ingredients that belong to a product (also used for producer)
    app.get('/getProductIngredients', async (req,res)=>{
        let id = parseInt(req.query.id);
        if (id) {
            const ingredientDb = db.collection("batch-ingredient");
            ingredientDb.find({batchId: id}).toArray((err, tup) => {
                console.log(tup, id)
                if (err) throw err;
                if (tup) {
                    const jsonTup = JSON.stringify(tup);
                    res.json({status: "success", result: jsonTup})
                } else {
                    res.json({status: "success", reason: "No batch with ingredients exists"})
                }
            })
        } else {
            res.status(400).json({"status":"Failed", "reason":"wrong input"})
        }
    })

    // ORACLE FUNCTIONS
    // oracle contract function to request data
    app.get('/loadNutrition', verifyToken, async (req, res) => {
        let id = parseInt(req.query.id);
        if (id) {
            // smart contract function that emits an event from the oracle contract
            await fc.requestBakingLabels(id, {from: accounts[0]});
        }
        res.json({"status":"success"})
    })

    // oracle contract function to send data
    app.get('/getNutrition', verifyToken, async (req, res) => {
        let id = parseInt(req.query.id);
        if (id) {
                fc.getBakingLabels(id, {from: accounts[0]}, function(err, result) {
                    console.log(result)
                    if (result['0'] == '0') {
                        res.status(400).json({"status":"Failed", "reason":"loading"})
                    } else {
                        res.json({status: "success", vegan: result['1'], vege: result['2'], gf: result['3']})
                    }
                });
        }
    })

    // RECALL FUNCTIONS
    // Recall product
    app.get( '/recallProduct', verifyToken, async ( req, res ) =>
    {
        let id = parseInt( req.query.id );
        if ( id )
        {
            // Update the blockchain first
            console.log("RECALLING PRODUCT");
            await fc.recallProduct( id, { from: accounts[ 0 ] } );
            // Update the database and return new product
            const productDb = db.collection( "baking-products" );
            productDb.findOneAndUpdate(
                { id: id },
                { $set: {recallStatus: true }},
                { returnOriginal: false },
                ( err, tup ) =>
                {
                    console.log( tup, id );
                    if ( err ) throw err;
                    if ( tup )
                    {
                        const jsonTup = JSON.stringify( tup );
                        res.json( { status: "success", result: jsonTup } );
                    } else
                    {
                        res.json( { status: "success", reason: "No batch with ingredients exists" } );
                    }
                }
            );
        } else {
            res.status( 400 ).json( { "status": "Failed", "reason": "wrong input" } );
        }
    } )

    // Recall ingredient
    app.get( '/recallIngredient', verifyToken, async ( req, res ) =>
    {
        let id = parseInt( req.query.id );
        if ( id )
        {
            // Update the blockchain first
            console.log( "RECALLING INGREDIENT" );
            await fc.recallIngredient( id, { from: accounts[ 0 ] } );
            // Update the database and return new ingredient.
            const ingredientDb = db.collection( "ingredients" );
            ingredientDb.findOneAndUpdate( 
                { id: id }, 
                { $set: {recallStatus: true }}, 
                {returnOriginal: false},
                (err, tup) => {
                    console.log( tup, id );
                    if ( err ) throw err;
                    if ( tup )
                    {
                        const jsonTup = JSON.stringify( tup );
                        res.json( { status: "success", result: jsonTup } );
                    } else
                    {
                        res.json( { status: "success", reason: "No batch with ingredients exists" } );
                    }
                } 
            );
        } else {
            res.status( 400 ).json( { "status": "Failed", "reason": "wrong input" } );
        }
    } )
}

module.exports = routes