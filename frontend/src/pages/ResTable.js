import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

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
  
export default function ResTable(results) {
  const classes = useStyles();

  const results2 = results.results;

  if (results2.recallStatus === true) {
    results2['recall'] = 'True';
  } else if (results2.recallStatus === false) {
      results2['recall'] = 'False';
  }
  console.log(results);

  return (
    <table className={classes.tableStyle}>
    <tr className={classes.tableRow}>
      <td className={classes.tableBox}> <b>Product ID</b> </td>
      <td className={classes.tableBox}> {results2.id}</td>
    </tr>
    <tr className={classes.tableRow}>
      <td className={classes.tableBox}> <b>Name</b> </td>
      <td className={classes.tableBox}> {results2.name}</td>
    </tr>
    <tr className={classes.tableRow}>
      <td className={classes.tableBox}> <b>Weight</b> </td>
      <td className={classes.tableBox}> {results2.weight}</td>
    </tr>
    <tr className={classes.tableRow}>
      <td className={classes.tableBox}> <b>Location</b> </td>
      <td className={classes.tableBox}> {results2.location}</td>
    </tr>
    <tr className={classes.tableRow}>
      <td className={classes.tableBox}> <b>Company</b></td>
      <td className={classes.tableBox}> {results2.company}</td>
    </tr>
    <tr className={classes.tableRow}>
      <td className={classes.tableBox}> <b>Production Date</b> </td>
      <td className={classes.tableBox}> {results2.productionDate}</td>
    </tr>
    <tr className={classes.tableRow}>
      <td className={classes.tableBox}> <b>Expiry Date</b> </td>
      <td className={classes.tableBox}> {results2.expiryDate}</td>
    </tr>
    <tr className={classes.tableRow}>
      <td className={classes.tableBox}> <b>Retailer</b> </td>
      <td className={classes.tableBox}> {results2.retailer}</td>
    </tr>
    <tr className={classes.tableRow}>
      <td className={classes.tableBox}> <b>Retail Location</b> </td>
      <td className={classes.tableBox}> {results2.retail_location}</td>
    </tr>
    <tr className={classes.tableRow}>
      <td className={classes.tableBox}> <b>Retail Price</b> </td>
      <td className={classes.tableBox}> ${results2.retail_price}</td>
    </tr>
    <tr className={classes.tableRow}>
      <td className={classes.tableBox}> <b>Recall Status </b></td>
      <td className={classes.tableBox}> {results2.recall}</td>
    </tr>
    
  </table>
  )
}