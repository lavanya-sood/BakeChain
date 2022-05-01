// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Oracle {
    
    // do we need to verify that only the backend or client smart contract calls it
    struct Labels {
        uint batchId;
        bool isVegan;
        bool isVegetarian;
        bool isGlutenFree;
    }
    
    Labels[] labels;
    
    event request(uint data);
    
    function requestData(uint data) public {
        emit request(data);
    }
    
    function setData(uint id, bool isVegan, bool isVegetarian, bool isGlutenFree) public {
        for (uint i = 0; i < labels.length; i++) {
            if (labels[i].batchId == id) {
                labels[i].isVegan = isVegan;
                labels[i].isVegetarian = isVegetarian;
                labels[i].isGlutenFree = isGlutenFree;
                return;
            }
        }
        Labels memory l;
        l.batchId = id;
        l.isVegan = isVegan;
        l.isVegetarian = isVegetarian;
        l.isGlutenFree = isGlutenFree;
        labels.push(l);
    }
    
    function replyData(uint id) public view returns(uint, bool, bool, bool) {
        for (uint i = 0; i < labels.length; i++) {
            if (labels[i].batchId == id) {
                return (labels[i].batchId, labels[i].isVegan, labels[i].isVegetarian, labels[i].isGlutenFree);
            }
        }
        return (0, false, false, false);
    }
    
    function testConnection() public pure returns (bool) {
        return true;
    }

    function getAddress() public view returns (address) {
        return address(this);
    }
}