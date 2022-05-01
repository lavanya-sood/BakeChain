# COMP6452-Project2

This is the repository for the Bakechain smart contract code, as well as the backend/frontend for it's web interface

## Developers

* Lavanya Sood
* Sarah Oakman
* Tara Andresson
* Bridget McCarthy

## First time setup instructions

Clone the repository via git

In the Backend folder:
    
    npm install
    npm install nodemon truffle-contract dotenv mongodb shortid express web3 --save && npm install truffle -g
    npm install ganache-cli -g
(In another terminal leave this running as our ETH emulator) 
    
    ganache-cli
Backend:

    truffle compile
    truffle migrate
Frontend:

    npm install
    
## Running the server
Terminal one
    
    ganache-cli

Terminal two (Backend folder):
    
    truffle compile ~(if smart contract modified)~
    truffle migrate ~(each time ganache-cli reopened)~
    node index.js

Terminal three (Backend folder):

    npm run build

Terminal four (Frontend folder):

    npm run start


For running the functions, we have it limited to a list of authorized metamask users. 

You can now navigate to the webpage on whichever port it has been allocated and you should see the frontend
![image](https://user-images.githubusercontent.com/17445184/126595499-02afb250-4552-4ac7-89ad-58cf95eab0d7.png)
