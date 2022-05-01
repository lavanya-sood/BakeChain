// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import './OracleInterface.sol';

contract FoodChain {
    
    // Struct to store product information
    struct ProductBatch {
        uint barcode;
        uint hash;
        uint[] ingredients;
        bool exists;
        bool recall;
        bool retail;
    }

    // Struct to store ingredient information
    struct IngredientBatch {
        uint barcode;
        uint hash;

        bool recall;
    }
    
    // Store owner address
    address owner;
    
    // Store products and ingredients
    mapping(uint => ProductBatch) private products;
    uint numberOfProducts;
    mapping(uint => IngredientBatch) private ingredients;
    uint numberOfIngredients;

    // Store authorised users
    address[] public farmer;
    uint numberOfFarmers;
    
    address[] public producer;
    uint numberOfProducers;
    
    address[] public retailer;
    uint numberOfRetailers;
    
    // Oracle address
    address internal oracleAd;
    OracleInterface internal oracle;
    
    // Modifier which restricts access to functions (only for server access)
    modifier onlyOwner () {
        require (msg.sender == owner);
        _;
    }
    
    // Constructor
    constructor() {
        owner = msg.sender;
    }
    
    // Set up oracle
    function setOracle(address ad) external onlyOwner {
        oracleAd = ad;
        oracle = OracleInterface(ad);
    }

    function testOracle() public view returns (bool) {
        return oracle.testConnection();
    }
    
    // Function that produces unique hash for products/ ingredients
    function getHash(uint id) private pure returns (uint) {
        // convert string into bytes
        bytes memory idBytes = abi.encodePacked(id);
        // used Keccak hashing as this is what ethereum uses
        uint longHash = uint(keccak256(idBytes));
        // gets 8 digits at most
        uint hash = longHash % (10**8);
        return hash;
    }

    // DIETARY INFORMATION LABELS FOR PRODUCTS
    // Emits event that backend listens for - does web scraping (only works for a product)
    function requestBakingLabels (uint batchId) public {
        oracle.requestData(batchId);
    }

    function getBakingLabels (uint batchId) public view returns (uint, bool, bool, bool) {
        /*for (uint i = 0; i < batches.length; i++) {
            if (batches[i].hash == requestId) {
                batches[i].labels.isVegan = _isVegan;
                batches[i].labels.isVegetarian = _isVegetarian;
                batches[i].labels.isGlutenFree = _isGlutenFree;
            }
        }*/
        return oracle.replyData(batchId);
    }
    
    // FUNCTIONS FOR PRODUCTS
    // Takes in product batch and adds it to the list
    function addProductBatch(uint productId, uint[] memory ingredientIds) public onlyOwner returns (bool) {
        numberOfProducts++;
        uint hash = getHash(productId);
        
        // Create new product batch
        ProductBatch memory b;
        b.hash = hash;
        b.exists = true;
        b.barcode = productId;
        b.ingredients = ingredientIds;
        b.recall = false;
        
        // Add to list of batches
        products[productId] = b;
        return true;
    }
    
    // View the batches of a manufacturer - just for checking
    function viewProductBatchesCount() public view returns (uint) {
        return numberOfIngredients;
    }

    // Retail a product
    function retailProduct(uint productId) public onlyOwner returns (bool) {
        products[productId].retail = true;
        return true;
    }

    // FUNCTIONS FOR INGREDIENTS
    // Takes in product batch and adds it to the list
    function addIngredientBatch(uint productId) public onlyOwner returns (bool) {
        numberOfIngredients++;
        uint hash = getHash(productId);
        
        // Create new ingredient batch
        IngredientBatch memory b;
        b.hash = hash;
        b.barcode = productId;
        b.recall = false;
        
        // Add to list of batches
        ingredients[productId] = b;
        return true;
    }
    
    // View the batches of a primary producer - just for checking
    function viewIngredientBatchesCount() public view returns (uint) {
        return numberOfIngredients;
    }

    // RECALL FUNCTIONS
    // Recall an ingredient
    function recallIngredient(uint productId) public onlyOwner returns (bool) {
        ingredients[productId].recall = true;
        return true;
    }

    // Recall a product
    function recallProduct(uint productId) public onlyOwner returns (bool) {
        products[productId].recall = true;
        return true;
    }

    // VIEW A PRODUCT (AS A CUSTOMER)
    function viewProduct(uint productId) public view returns (bool) {
        if (products[productId].exists == true ) {
            return true;
        }
        return false;
    }

}
