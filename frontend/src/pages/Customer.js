import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Toolbar, AppBar, Typography, Paper } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import bakechainLogo2 from '../bakechain2.png';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import ResTable from './ResTable';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(3),
      width: '25ch',
    },
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  paper: {
    width: '60%',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '20vh',
    padding: '10px',
  },
  mainPage: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '30px',
  },
  tableStyle: {
    border: '1px solid black',
    width: '80%',
    borderCollapse: 'collapse',
    marginBottom: '10px',
  },
  tableRow: {
    border: '1px solid black',
  },
  tableBox: {
    border: '1px solid black',
    padding: '5px',
  }
}));

const theme = createTheme({
  palette: {
    primary: {
      main: '#7dabea',
    },
    secondary: {
      main: '#ffd0da',
    },
  },
});

export default function BasicTextFields() {
  const [error, setError] = useState(false);
  const [results, setResults] = useState('');
  const classes = useStyles();
  const [rows, setRows] = useState([]);

  const getViewProduct = (event) => {
    event.preventDefault();
    const form = document.forms['product-form'];
    const product = form.productId.value;

    if (!product) {
      setError(true);
      return;
    } else {
      setError(false);
    }
    getProduct(product);
  }

  function createData(name, value) {
    return { name, value};
  }

  async function getProduct(productId) {
    const manufacturer = 'Manufacturer';
    const url = 'http://127.0.0.1:8082/product?id=' + productId;
    let res = await fetch(url);
    res = await res.json();
    if (res.status === 'Failed') {
      setResults('This Product does not exist');
      console.log("here");
      return;
    }
    console.log(res);
    const jsonres = JSON.parse(res.result);
    //details = details.concat(JSON.stringify(res.product));
    setResults(jsonres[0]);
    const result2 = jsonres[0];
    const rowBox = [];

    rowBox.push(createData('Frozen yoghurt', result2.id));
    return res;
  }

  const res = (results == "This Product does not exist")? <p> The product with this id does not exist. </p> :<ResTable results={results}/>;

  return (
    <ThemeProvider theme={theme}>
      
      <AppBar position="static">
        <Toolbar>
          <Link to="/"><img class="header-Logo" src={bakechainLogo2} /></Link>
        </Toolbar>
      </AppBar>
      <div className={classes.mainPage}>
        { error && 
          <Alert severity="error">
            All inputs must be non-empty. Product was not submitted!
          </Alert>
        }
        <Typography variant="h3"> View Product Details </Typography> 
        <form id='product-form' className={classes.root} noValidate autoComplete="off">
          <TextField
            id="productId"
            label="Product ID"
            name="productId"
            placeholder="1234567"
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
          />
          <Button variant='contained' color="secondary" onClick={getViewProduct}>View Product</Button>
        </form>
        <Paper elevation={3} className={classes.paper}>
          <Typography variant="h4"> API/Blockchain Response </Typography> 
          <br/>
          {res}

        </Paper>
      </div>
    </ThemeProvider>
  );
}