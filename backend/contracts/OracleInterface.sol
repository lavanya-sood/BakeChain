// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

interface OracleInterface {
    
    // do we need to verify that only the backend or client smart contract calls it
    struct Labels {
        uint batchId;
        bool isVegan;
        bool isVegetarian;
        bool isGlutenFree;
    }
    
    event request(uint data);
    
    function requestData(uint data) external;
    
    function setData(uint id, bool isVegan, bool isVegetarian, bool isGlutenFree) external;
    
    function replyData(uint id) external view returns(uint, bool, bool, bool);
    
    function testConnection() external pure returns (bool);
    
    function getAddress() external view returns (address);
}
