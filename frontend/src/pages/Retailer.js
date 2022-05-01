import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Toolbar, AppBar, Typography, FormControlLabel, Checkbox } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Alert from '@material-ui/lab/Alert';
import { Link } from "react-router-dom";
import bakechainLogo2 from '../bakechain2.png';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import MetamaskIntegration from '../metamask-integration';
import getAuthToken from '../auth';

const useStyles = makeStyles( ( theme ) => ( {
  root: {
    '& > *': {
      margin: theme.spacing( 5 ),
      width: '25ch',
      display: 'flex',
      flexDirection: 'column',
    }
  },
  products: {
    '& > *': {
      margin: theme.spacing( 4 ),
      width: '25ch',
    }
  }
} ) );

var locationFound = false;
var selectedProduct = '';

var location = function ( position )
{
  location = position.coords.latitude + ", " + position.coords.longitude;
  locationFound = true;
};

export default function BasicTextFields ()
{
  const [ error, setError ] = useState( '' );
  const [ retailerError, setRetailerError ] = useState( '' );
  const [ retailPriceError, setRetailPriceError ] = useState( '' );
  const [ products, setProducts ] = useState( [] );
  const [ productError, setProductError ] = useState( '' );
  const classes = useStyles();

  useEffect( async () =>
  {
    const url = 'http://127.0.0.1:8082/allproducts';
    const data = {
      headers: { 
        'Authorisation': getAuthToken()
      }
    }
    let res = await fetch( url, data );
    res = await res.json();
    const prod = JSON.parse( res.products );
    let copyDetails = [];
    for ( let i = 0; i < prod.length; i++ )
    {
      const el = <FormControlLabel
        key={ i }
        style={ listProducts }
        control={ <Checkbox id={ prod[ i ].id } onChange={ addProduct } color='secondary' /> }
        label={ prod[ i ].name + ' (' + prod[ i ].id + ')' + '[$' + prod[i].price + ']'}
      />;
      copyDetails.push( el );
    }
    setProducts(copyDetails);
  }, [] );

  const addProduct = ( event ) =>
  {
    if (selectedProduct !== '' && selectedProduct !== event.target.id) {
      document.getElementById(event.target.id).click();
      console.log(selectedProduct);
      return;
    }
    
    console.log( event.target.id );
    if (event.target.checked) {
      selectedProduct = event.target.id;
    } else {
      selectedProduct = '';
    }

    console.log( selectedProduct );
    if (selectedProduct && selectedProduct !== '')
    {
      setProductError( '' );
    } else
    {
      setProductError( 'Need to select a single product' );
    }
  };

  const submitBatch = ( event ) =>
  {
    event.preventDefault();
    const form = document.forms['product-form'];
    const retailer = form.retailer.value;
    const retail_price = form.retail_price.value;
    console.log( selectedProduct );

    let check = true;
    if ( !selectedProduct )
    {
      check = false;
      setError( 'A product must be selected. Product was not submitted!' );
      setProductError( 'Need to select a product' );
    }
    if ( !retailer )
    {
      setError( 'All inputs must be non-empty. Retailer was not submitted!' );
      setRetailerError( 'Retailer name cannot be empty' );
      check = false;
    }
    if ( !retail_price )
    {
      setError( 'All inputs must be non-empty. Sale price was not submitted!' );
      setRetailPriceError( 'Sale price cannot be empty' );
      check = false;
    }
    if ( check && retailer)
    {
      addBatch(retailer, retail_price);
      setError( '' );
      window.alert( 'Successfully retailed a product batch' );
      window.location.reload();
    }
  };

  async function addBatch (retailer, retail_price)
  {
    const data = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorisation': getAuthToken() },
      body: JSON.stringify( {
        retailer: retailer,
        retail_price: retail_price,
        retail_location: location,
        product_id: selectedProduct,
      } )
    };
    let res = await fetch( 'http://127.0.0.1:8082/addRetailProduct', data );
    res = await res.json();
    // view the console to see the response
    console.log( res );
  }

  const changingRetailer = ( event ) =>
  {
    if ( event.target.value === '' )
    {
      setRetailerError( 'Retailer name cannot be empty' );
    } else
    {
      setRetailerError( '' );
    }
  };

  const changingRetailPrice = ( event ) =>
  {
    if ( event.target.value === '' )
    {
      setRetailPriceError( 'Retail price cannot be empty' );
    } else if ( isNaN( event.target.value ) )
    {
      setRetailPriceError( 'Retail price must be a number' );
    } else
    {
      setRetailPriceError( '' );
    }
  };

  function validForm ()
  {
    if ( retailPriceError == '' && retailerError == '' && productError === '' )
    {
      return true;
    }
    return false;
  }

  function callLocation ()
  {
    if ( !locationFound )
    {
      navigator.geolocation.getCurrentPosition( location );
    }
  }

  callLocation();

  const listProducts = {
    marginLeft: '32px'
  };

  return (

    <div>
      <AppBar position="static">
        <Toolbar>
          <Link to="/"><img className='header-Logo' alt='logo' src={ bakechainLogo2 } /></Link>
          <div className={ classes.alignRight }>
            <Link to="/retailer">
              <Button color="inherit">Retail A Product</Button>
            </Link>
            <Link to="/retailer/view-batches">
              <Button color="inherit">View Retailed Products</Button>
            </Link>
            <Button color="inherit"><ExitToAppIcon /></Button>
          </div>
          <MetamaskIntegration className="mt-1" />
        </Toolbar>
      </AppBar>
      { error &&
        <Alert severity="error">
          { error }
        </Alert>
      }
      <form className='center-form' id='product-form' noValidate autoComplete="off">
        <Typography color='secondary' className='add-products-title' variant="h2" component="h2" gutterBottom>
          Retail A Product
        </Typography>
        <div className='add-products-flex'>
          <div className={ classes.root }>
            <TextField
              error={ retailerError != '' }
              helperText={ retailerError }
              onChange={ changingRetailer }
              id="retailer"
              label="Retailer"
              placeholder="Coles"
              InputLabelProps={ {
                shrink: true,
              } }
              variant="outlined"
            />
            <TextField
              error={ retailPriceError != '' }
              helperText={ retailPriceError }
              onChange={ changingRetailPrice }
              id="retail_price"
              label="Retail Price ($)"
              placeholder="15.50"
              InputLabelProps={ {
                shrink: true,
              } }
              variant="outlined"
            />
          </div>
          <div className='products-ing-list'>
            <Typography className='add-products-ing' variant="caption" component="h2" gutterBottom>
              Choose Product (Select Only 1)
            </Typography>
            { productError != '' && <p className='error-ing'>{ productError }</p> }
            <div className='list-ing'>
              { products }
            </div>
          </div>
        </div>
        <Button disabled={ !validForm() } color='primary' variant='contained' onClick={ submitBatch }>Submit</Button>
      </form>
    </div>
  );
}