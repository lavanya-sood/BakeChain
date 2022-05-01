import React from 'react'
import MetaMaskOnboarding from '@metamask/onboarding'
import './metamask-integration.css';
import MetamaskIcon from './metamask-fox.png'
import { ethers } from "ethers";
import { Button, Icon } from '@material-ui/core';
import getAuthToken from './auth';

// Code is taken from metamasks getting started guide here
// https://docs.metamask.io/guide/create-dapp.html#basic-action-part-1
const forwarderOrigin = 'http://127.0.0.1:8082';

class MetamaskIntegration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ethereum: ""
    }
  }
  
  initialize() {
    // Basic actions
    const onboardButton = document.getElementById('connectButton');
    let ethereum = null;
    let userAccounts = null; 

    let provider = null;
    let signer = null;

    //Created check function to see if the MetaMask extension is installed
    const isMetaMaskInstalled = () => {
      //Have to check the ethereum binding on the window object to see if it's installed
      ethereum = window.ethereum
      this.setState({
        ethereum: window
      });
      return Boolean(ethereum && ethereum.isMetaMask)
    }

    //We create a new MetaMask onboarding object to use in our app
    const onboarding = new MetaMaskOnboarding({ forwarderOrigin });

    //This will start the onboarding proccess
    const onClickInstall = () => {
      onboardButton.innerText = 'Onboarding in progress';
      onboardButton.disabled = true;
      //On this object we have startOnboarding which will start the onboarding process for our end user
      onboarding.startOnboarding();
    };

    async function postLogin(account, signed) {
      const data = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account: account,
          signed: signed,
        })
      };
      let res = await fetch(forwarderOrigin + '/login', data);
      res = await res.json();
      return res;
    }
    
    async function getLoginNonce(account) {
      const data = {
        method: 'GET',
      };
      let res = await fetch(forwarderOrigin + '/getLoginNonce?account=' + account, data);
      res = await res.json();
      console.log(res);
      return res;
    }

    const onClickConnect = async () => {
      try {
        // Will open the MetaMask UI to connect
        await window.ethereum.enable();
        // This gets the currently selected user in metamask as [0] - NOTE just eth_accounts returns all accounts
        userAccounts = await ethereum.request({ method: 'eth_requestAccounts' });
        // Metamask has deprecated Web3 support as of January 2021
        // This breaks just about everything
        // Instead, we use their recommended ethers API
        signer = provider.getSigner(userAccounts[0]);
        // Connected with metamask, now need to actually sign an authentication message which grants the permissions
        const nonceResult = await getLoginNonce(userAccounts[0]);
        if (nonceResult.status != "success") {
          onboardButton.innerText = "You're not in the authorised list!";
          return;
        }
        const authNonce = nonceResult.auth_nonce;
        const message = "Sign into bakechain! Code: " + authNonce.toString();
        console.log(message);
        console.log(message.length);
        let signature = await signer.signMessage(message);
        postLogin(userAccounts[0], signature)
        .then(res => {
          console.log(res)
          if (res.status == "success") {
            onboardButton.innerText = "Connected Successfully!"
            onboardButton.disabled = true;
            onboardButton.color = "secondary"

            // Now add the authentication token to our browser
            localStorage.setItem('_auth', res.token.toString());
            console.log(res.token);
          }
          else {
            onboardButton.innerText = "You're not in the authorised list!"
          }
        })
        
      } catch (error) {
        console.error(error);
        onboardButton.innerText = "Cancelled Connection!"
      }
    };

    const isMetaMaskConnected = async () => {
      const accounts = await provider.listAccounts();
      return accounts.length > 0;
    }

    const MetaMaskClientCheck = () => {
      //Now we check to see if Metmask is installed
      if (!isMetaMaskInstalled()) {
        //If it isn't installed we ask the user to click to install it
        onboardButton.innerText = 'Click here to install MetaMask!';
        onboardButton.onclick = onClickInstall;
        onboardButton.disabled = false;
      } else {
        //If MetaMask is installed we ask the user to connect to their wallet
        onboardButton.innerText = 'Connect';
        onboardButton.onclick = onClickConnect;
        onboardButton.disabled = false;
        provider = new ethers.providers.Web3Provider(window.ethereum);
        isMetaMaskConnected().then((connected) => {
          if (connected && getAuthToken() != null) {
            // metamask is connected
              onboardButton.innerText = 'Connected Successfully!';
          } else {
            // metamask is not connected
          }
        })
      }
    };
    MetaMaskClientCheck();
  }

  componentDidMount() {
    this.initialize();
  }

  render() {

    return (
      <div>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.4.1/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/mdbootstrap/4.14.1/css/mdb.min.css"
          rel="stylesheet"
        />
        
        <img id="mm-logo" alt="metamask logo"  src={MetamaskIcon} style={{width: "30px", "margin-right": "0.5em"}}/>
        <Button
          id="connectButton"
          color='primary' variant='contained'
        >
          Connect
        </Button>
      </div>
    )
  }
}

export default MetamaskIntegration;