import React from "react";
import { Button } from '@material-ui/core';
import StoreIcon from '@material-ui/icons/Store';
import FaceIcon from '@material-ui/icons/Face';
import { Link } from "react-router-dom";
import MetamaskIntegration from "../metamask-integration";
import bakechainLogo from '../Bakechain.png';
import Cupcakes from '../Cupcakes.png';

export default function Home () {
  return (
    <div className='home'>
      {/* <div className='home-row'>
        <MetamaskIntegration />
      </div> */}
      <div className='home-heading'>
        <img class="headingClass" src={bakechainLogo}/>
      </div>
      <div className='home-row'>
        <Link to="/farmer" className="button-Link"> 
          <Button className='home-button' variant="contained" color="primary" >
            <div>
              <img height='90px' alt='farmer image' src='https://flaticons.net/icon.php?slug_category=food&slug_icon=cereal-wheat'/>
              <p className='home-button-title'>Farmer</p>
            </div>
          </Button>
        </Link>
        <Link to="/producer" className="button-Link">
          <Button className='home-button' variant="contained" color="primary" >
            <div>
              <img height='90px' alt='producer image' src={Cupcakes}/>
              <p className='home-button-title'>Producer</p>
            </div>
          </Button>
        </Link>
      </div>
      <div className='home-row'>
        <Link to="/retailer" className="button-Link"> 
          <Button className='home-button' variant="contained" color="primary" >
            <div>
              <StoreIcon style={{ fontSize: 100 }}/>
              <p className='home-button-title'>Retailer</p>
            </div>
          </Button>
        </Link>
        <Link to="/customer" className="button-Link">   
          <Button className='home-button' variant="contained" color="primary" >
            <div>
              <FaceIcon style={{ fontSize: 100 }}/>
              <p className='home-button-title'>Customer</p>
            </div>
          </Button>
        </Link>
      </div>
    </div>
  )

}