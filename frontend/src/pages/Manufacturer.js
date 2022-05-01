import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Toolbar, AppBar, Typography, FormControlLabel, Checkbox } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Alert from '@material-ui/lab/Alert';
import { Link } from "react-router-dom";
import bakechainLogo2 from '../bakechain2.png';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import getAuthToken from '../auth';
import MetamaskIntegration from '../metamask-integration';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(5),
      width: '25ch',
      display: 'flex',
      flexDirection: 'column',
    }
  },
  ingredients: {
    '& > *': {
      margin: theme.spacing(4),
      width: '25ch',
    }
  }
}));

var locationFound = false;

var location = function ( position )
{
  location = position.coords.latitude + ", " + position.coords.longitude;
  locationFound = true;
}

export default function BasicTextFields() {
  const [error, setError] = useState('');
  const [companyError, setCompanyError] = useState('');
  const [nameError, setNameError] = useState('');
  const [weightError, setWeightError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [producedError, setProducedError] = useState('');
  const [producedInput, setProducedInput] = useState('');
  const [expiryError, setExpiryError] = useState('');
  const [expiryInput, setExpiryInput] = useState('');
  const [quantityError, setQuantityError] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [selectedIng, setSelectedIng] = useState([]);
  const [ingError, setIngError] = useState('');
  const classes = useStyles();

  useEffect(async () => {
    const url = 'http://127.0.0.1:8082/allingredients';
    const data = {
      headers: { 
        'Authorisation': getAuthToken()
      }
    }
    let res = await fetch(url, data);
    res = await res.json();
    const ing = JSON.parse(res.ingredients);
    let copyDetails = [];
    for (let i = 0; i < ing.length; i++) {
      const el = <FormControlLabel 
                    key={i}
                    style={listIngredients}
                    control={<Checkbox id={ing[i].id} onChange={addIngredients}color='secondary'/>}
                    label={ing[i].name + ' (' + ing[i].id + ')'}
                  />;
      copyDetails.push(el);
    }
    setIngredients(copyDetails);
  }, [])

  const addIngredients = (event) => {
    console.log(event.target.id);
    if (event.target.checked) {
      selectedIng.push(event.target.id);
      setSelectedIng(selectedIng)
    } else {
      const i = selectedIng.indexOf(event.target.id);
      const newList = selectedIng.splice(i);
      setSelectedIng(newList)
    }
    
    console.log(selectedIng)
    if (selectedIng.length !== 0) {
      setIngError('')
    } else {
      setIngError('Need to select ingredients')
    }
  }

  const submitBatch = (event) => {
    event.preventDefault();
    const form = document.forms['product-form'];
    const company = form.company.value;
    const product = form.name.value;
    const weight = form.weight.value;
    const price = form.price.value;
    const produced = form.produced.value;
    const expiry = form.expiry.value;
    const quantity = form.quantity.value;
    console.log(selectedIng)

    let check = true;
    if (selectedIng.length === 0) {
      check = false;
      setError('All inputs must be non-empty. Product was not submitted!');
      setIngError('Need to select ingredients');
    }
    if (!company) {
      setError( 'All inputs must be non-empty. Company was not submitted!' );
      setNameError('Company name cannot be empty');
      check = false;
    }
    if (!product) {
      setError('All inputs must be non-empty. Product was not submitted!');
      setNameError('Product name cannot be empty');
      check = false;
    }
    if (!weight) {
      setError('All inputs must be non-empty. Product was not submitted!');
      setWeightError('Product weight cannot be empty');
      check = false;
    }
    if (!price) {
      setError('All inputs must be non-empty. Product was not submitted!');
      setPriceError('Product price cannot be empty');
      check = false;
    }
    if (!produced) {
      setError('All inputs must be non-empty. Product was not submitted!');
      setProducedError('Produced date cannot be empty');
      check = false;
    }
    if (!expiry) {
      setError('All inputs must be non-empty. Product was not submitted!');
      setExpiryError('Expiry date cannot be empty');
      check = false;
    }
    if (!quantity) {
      setError('All inputs must be non-empty. Product was not submitted!');
      setQuantityError('Batch quantity cannot be empty');
      check = false;
    }
    if (check) {
      addBatch(company, product, weight, price, produced, expiry, quantity);
      setError('');
      window.alert('Successfully added a product batch');
      window.location.reload();
    }
  }

  async function addBatch(company, product, weight, price, produced, expiry, quantity) {
    const data = {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorisation': getAuthToken()
        },
        body: JSON.stringify({ 
          company: company,
          name: product,
          weight: weight,
          price: price,
          produced: produced,
          expiry: expiry,
          quantity: quantity,
          location: location,
          ingredients: selectedIng,
        })
    };
    let res = await fetch('http://127.0.0.1:8082/addProduct', data);
    res = await res.json();
    // view the console to see the response
    console.log(res);
  }

  const changingCompany = ( event ) => {
    if ( event.target.value === '' )
    {
      setCompanyError( 'Company name cannot be empty' );
    } else
    {
      setCompanyError('');
    }
  }

  const changingTitle = (event) => {
    if (event.target.value === '') {
      setNameError('Product name cannot be empty');
    } else {
      setNameError('');
    }
  }

  const changingWeight = (event) => {
    if (event.target.value === '') {
      setWeightError('Product weight cannot be empty');
    } else if (isNaN(event.target.value)) {
      setWeightError('Product weight must be a number');
    } else {
      setWeightError('');
    }
  }

  const changingPrice= (event) => {
    if (event.target.value === '') {
      setPriceError('Product price cannot be empty');
    } else if (isNaN(event.target.value)) {
      setPriceError('Product price must be a number');
    } else {
      setPriceError('');
    }
  }

  const changingQuantity = (event) => {
    if (event.target.value === '') {
      setQuantityError('Batch quantity cannot be empty');
    } else if (isNaN(event.target.value)) {
      setQuantityError('Batch quantity must be a number');
    } else {
      setQuantityError('');
    }
  }

  const changingExpiry = (event) => {
    setExpiryInput(event.target.value)
    if (producedInput === '') {
      setProducedError('Produced date cannot be empty');
      return;
    }
    const producedDate = new Date(producedInput);
    const expiryDate = new Date(event.target.value);
    if (producedDate >= expiryDate) {
      setExpiryError('Expiry must be after production')
    } else {
      setExpiryError('');
    }
  }

  const changingProduced = (event) => {
    setProducedInput(event.target.value)
    if (event.target.value === '') {
      setProducedError('Produced date cannot be empty');
      return;
    }
    if (expiryInput === '') {
      setProducedError('')
      return;
    }
    const producedDate = new Date(event.target.value);
    const expiryDate = new Date(expiryInput);
    if (producedDate >= expiryDate) {
      setExpiryError('Expiry must be after production')
    } else {
      setExpiryError('');
    }
  }

  function validForm() {
    if (nameError === '' && weightError === '' && priceError === '' && producedError === '' && expiryError === '' && quantityError === '' && ingError === '') {
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

  const listIngredients = {
    marginLeft: '32px'
  }

  return (
      
      <div>
      <AppBar position="static">
        <Toolbar>
          <Link to="/"><img className='header-Logo' alt='logo' src={bakechainLogo2} /></Link>
          <div className={classes.alignRight}>
            <Link to="/producer">
              <Button color="inherit">Add Products</Button>
            </Link>
            <Link to="/producer/view-batches">
              <Button color="inherit">View Products</Button>
            </Link>
            <Button color="inherit"><ExitToAppIcon/></Button>
          </div>
          <MetamaskIntegration className="mt-1" />
        </Toolbar>
      </AppBar>
      { error && 
        <Alert severity="error">
         {error}
        </Alert>
      }
      <form className='center-form' id='product-form' noValidate autoComplete="off">
        <Typography color='secondary' className='add-products-title' variant="h2" component="h2" gutterBottom>
          Add Products
        </Typography>
        <div className='add-products-flex'>
          <div className={classes.root}>
            <TextField
              error={ companyError != '' }
              helperText={ companyError }
              onChange={ changingCompany }
              id="company"
              label="Company"
              placeholder="Baking and Co."
              InputLabelProps={ {
                shrink: true,
              } }
              variant="outlined"
            />
            <TextField
              error={nameError != ''}
              helperText={nameError}
              onChange={changingTitle}
              id="name"
              label="Product Name"
              placeholder="Cupcakes"
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
            />
            <TextField
              error={weightError != ''}
              helperText={weightError}
              onChange={changingWeight}
              id="weight"
              label="Product Weight (g)"
              placeholder="50"
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
            />
            <TextField
              error={priceError != ''}
              helperText={priceError}
              onChange={changingPrice}
              id="price"
              label="Product Price ($)"
              placeholder="3.20"
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
            />
            <TextField
              error={producedError != ''}
              helperText={producedError}
              onChange={changingProduced}
              id="produced"
              label="Production Date"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
            />
            <TextField
              error={expiryError != ''}
              helperText={expiryError}
              onChange={changingExpiry}
              id="expiry"
              label="Expiry Date"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
            />
            <TextField
              error={quantityError != ''}
              helperText={quantityError}
              onChange={changingQuantity}
              id="quantity"
              label="Batch Quantity"
              placeholder="100"
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
            />
          </div>
          <div className='products-ing-list'>
            <Typography className='add-products-ing' variant="caption" component="h2" gutterBottom>
              Add Ingredients
            </Typography>
            {ingError != '' && <p className='error-ing'>{ingError}</p>}
            <div className='list-ing'>
            {ingredients}
            </div>
          </div>
        </div>
        <Button disabled={!validForm()} color='primary' variant='contained' onClick={submitBatch}>Submit</Button>
      </form>
      </div>
  );
}