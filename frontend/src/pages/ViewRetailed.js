import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { FormControl, InputLabel, OutlinedInput, Divider, Button, Toolbar, AppBar, Drawer, List, ListItem, ListItemText, Typography, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';
import { Link } from "react-router-dom";
import bakechainLogo2 from '../bakechain2.png';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import PropTypes from 'prop-types';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Alert from '@material-ui/lab/Alert';
import getAuthToken from '../auth';

const useStyles = makeStyles( ( theme ) => ( {
    root: {
        '& > *': {
            margin: theme.spacing( 5 ),
            width: '250px',
            display: 'flex',
            flexDirection: 'column',
        },
    },
    alignRight: {
        marginLeft: 'auto',
    },
    drawer: {
        width: '300px',
        flexShrink: 0,
        top: '100px'
    },
    drawerPaper: {
        width: '300px',
        top: 'auto',
        paddingTop: '10px'
    },
    drawerContainer: {
        overflow: 'auto'
    },
    padding: {
        paddingLeft: '15px'
    },
    heading: {
        fontSize: theme.typography.pxToRem( 15 ),
        flexBasis: '33.33%',
        flexShrink: 0,
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem( 15 ),
        color: theme.palette.text.secondary,
    },
    accordion: {
        margin: theme.spacing( 1 ),
        width: '600px',
        display: 'flex',
        flexDirection: 'column',
    },
    buttons: {
        margin: theme.spacing( 5 ),
        width: '200px',
        display: 'flex',
        flexDirection: 'column',
    },
    recall: {
        marginBottom: theme.spacing( 3 ),
    }
} ) );

export default function ViewBatches ()
{
    const [ details, setDetails ] = useState( [] );
    const [ batches, setBatches ] = useState( [] );
    const [ loaded, setLoaded ] = useState( false );
    const [ current, setCurrent ] = useState( null );
    const [ nutrition, setNutrition ] = useState( false );
    const [ nutritionRes, setNutritionRes ] = useState( [] );
    const classes = useStyles();

    useEffect( () =>
    {
        allProductBatches();
    }, [] );

    async function allProductBatches ()
    {
        // NEED TO GET CURRENT MANUFACTURER
        const manufacturer = 'Manufacturer';
        const url = 'http://127.0.0.1:8082/allretailbatches?manufacturer=' + manufacturer;
        const data = {
            headers: { 
              'Authorisation': getAuthToken()
            }
        }
        let res = await fetch( url, data );
        res = await res.json();
        const products = JSON.parse( res.product );
        let copyBatches = [];
        let copyDetails = [];
        for ( let i = 0; i < products.length; i++ )
        {
            const el = createBatch( products[ i ], i );
            products[ i ].ingredients = await getIngredients( products[ i ].id );
            copyBatches.push( el );
            copyDetails.push( products[ i ] );
        }
        if ( products.length !== 0 )
        {
            setCurrent( 0 );
        }
        if ( copyDetails.length === products.length )
        {
            setBatches( copyBatches );
            setDetails( copyDetails );
            setLoaded( true );
        }
    }

    async function getIngredients ( id )
    {
        let url = 'http://127.0.0.1:8082/getProductIngredients?id=' + id;
        const data = {
            headers: { 
              'Authorisation': getAuthToken()
            }
        }
        let res = await fetch( url, data );
        res = await res.json();
        const ing = JSON.parse( res.result );
        let ingredientsList = [];
        for ( let i = 0; i < ing.length; i++ )
        {
            const ingUrl = 'http://127.0.0.1:8082/getIngredientDetails?id=' + ing[ i ].ingredientId;
            let ingdet = await fetch( ingUrl, data );
            ingdet = await ingdet.json();
            const ingres = JSON.parse( ingdet.result );
            ingredientsList.push( ingres[ 0 ] );
        }
        return ingredientsList;
    }

    const updateCurrent = ( id ) =>
    {
        setCurrent( id );
        setNutrition( false );
        setNutritionRes( [] );
    };

    function createBatch ( b, i )
    {
        let name = b.name;
        if ( b.recallStatus )
        {
            name = name + ' [RECALLED]';
        }
        let el = <div key={ i }>
            <ListItem onClick={ () => updateCurrent( i ) } button>
                <ListItemText id={ i } primary={ name } />
            </ListItem>
            <Divider />
        </div>;
        return el;
    }

    if ( !loaded ) return null;
    return (
        <div>
            <AppBar position="static">
                <Toolbar>
                    <Link to="/"><img className="header-Logo" alt='logo' src={ bakechainLogo2 } /></Link>
                    <div className={ classes.alignRight }>
                        <Link to="/retailer">
                            <Button color="inherit">Retail A Product</Button>
                        </Link>
                        <Link to="/retailer/view-batches">
                            <Button color="inherit">View Retailed Products</Button>
                        </Link>
                        <Button color="inherit"><ExitToAppIcon /></Button>
                    </div>
                </Toolbar>
            </AppBar>


            <div className='view-batches-row'>
                <Drawer
                    className={ classes.drawer }
                    variant="permanent"
                    classes={ {
                        paper: classes.drawerPaper,
                    } }
                >
                    <div className={ classes.drawerContainer }>
                        <List>
                            <Typography className={ classes.padding } variant="h6" component="h2" gutterBottom>
                                Product Inventory
                            </Typography>
                            <Divider />
                            { batches }
                        </List>
                    </div>
                </Drawer>
                <div className='view-batches-content'>
                    { current === null &&
                        <Typography className={ classes.padding } variant="caption" component="h2" gutterBottom>
                            You do not have any products :(
                        </Typography>
                    }
                    { current !== null &&
                        <Content
                            props={ details[ current ] }
                            classes={ classes }
                            loaded={ nutrition }
                            setLoaded={ setNutrition }
                            response={ nutritionRes }
                            setResponse={ setNutritionRes }
                        />
                    }
                </div>
            </div>
        </div>
    );
}


function Content ( { props, classes, loaded, setLoaded, response, setResponse } )
{


    const loadLabels = async () =>
    {
        const url = 'http://127.0.0.1:8082/loadNutrition?id=' + props.id;
        const data = {
            headers: { 
              'Authorisation': getAuthToken()
            }
        }
        const res = await fetch( url, data );
        setLoaded( true );
    };

    const getLabels = async () =>
    {
        const url = 'http://127.0.0.1:8082/getNutrition?id=' + props.id;
        const data = {
            headers: { 
              'Authorisation': getAuthToken()
            }
        }
        let res = await fetch( url, data );
        res = await res.json();
        if ( res.status === 'Failed' )
        {
            const wait = <Typography className='view-products-ing' variant="caption" component="h2" gutterBottom>
                Loading... Click again in a sec!
            </Typography>;
            setResponse( [ wait ] );
        } else
        {
            let vegan = <div className='label-style' key='vegan'><div><CancelIcon /></div><span className='label-text'>Vegan</span></div>;
            let vege = <div className='label-style' key='vege'><div><CancelIcon /></div><span className='label-text'>Vegetarian</span></div>;
            let gf = <div className='label-style' key='gf'><div><CancelIcon /></div><span className='label-text'>Gluten Free</span></div>;
            if ( res.vegan )
            {
                vegan = <div className='label-style' key='vegan'><div><CheckCircleIcon /></div><span className='label-text'>Vegan</span></div>;
            }
            if ( res.vege )
            {
                vege = <div className='label-style' key='vege'><div><CheckCircleIcon /></div><span className='label-text'>Vegetarian</span></div>;
            }
            if ( res.gf )
            {
                gf = <div className='label-style' key='gf'><div><CheckCircleIcon /></div><span className='label-text'>Gluten Free</span></div>;
            }
            setResponse( [ vegan, vege, gf ] );
        }
    };

    function getIngredients ()
    {
        let ingredientsList = [];
        for ( let i = 0; i < props.ingredients.length; i++ )
        {
            if ( props.ingredients[ i ] && props.ingredients[ i ].name )
            {
                let ac = <Accordion key={ i }>
                    <AccordionSummary
                        expandIcon={ <ExpandMoreIcon /> }
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <div>
                            { props.ingredients[ i ].recallStatus &&
                                <Alert severity="error">
                                    Ingredient has been recalled
                                </Alert>
                            }
                        </div>
                        <div className={ classes.padding }>
                            <Typography className={ classes.heading }>{ props.ingredients[ i ].name }</Typography>
                            <Typography className={ classes.secondaryHeading }>ID/Barcode: { props.ingredients[ i ].id }</Typography>
                        </div>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography>
                            <div className={ classes.root }>
                                <FormControl className='view-batch-padding' variant="outlined">
                                    <InputLabel htmlFor="component-outlined">CompanyName</InputLabel>
                                    <OutlinedInput disabled id="company" value={ props.ingredients[ i ].company } label="CompanyName" />
                                </FormControl>
                                <FormControl className='view-batch-padding' variant="outlined">
                                    <InputLabel htmlFor="component-outlined">Production Price($)</InputLabel>
                                    <OutlinedInput disabled id="price" value={ props.ingredients[ i ].price } label="Production Price($)" />
                                </FormControl>
                                <FormControl className='view-batch-padding' variant="outlined">
                                    <InputLabel htmlFor="component-outlined">Location Created</InputLabel>
                                    <OutlinedInput disabled id="location" value={ props.ingredients[ i ].location } label="Location Created" />
                                </FormControl>
                                <FormControl className='view-batch-padding' variant="outlined">
                                    <InputLabel htmlFor="component-outlined">Production Date</InputLabel>
                                    <OutlinedInput disabled id="produced" value={ props.ingredients[ i ].productionDate } label="Production Date" />
                                </FormControl>
                                <FormControl className='view-batch-padding' variant="outlined">
                                    <InputLabel htmlFor="component-outlined">Expiry Date</InputLabel>
                                    <OutlinedInput disabled id="expiry" value={ props.ingredients[ i ].expiryDate } label="ExpiryDate" />
                                </FormControl>
                                <FormControl className='view-batch-padding' variant="outlined">
                                    <InputLabel htmlFor="component-outlined">Recall Status</InputLabel>
                                    <OutlinedInput disabled id="recallStatus" value={ props.ingredients[ i ].recallStatus } label="Recall Status" />
                                </FormControl>
                            </div>
                        </Typography>
                    </AccordionDetails>
                </Accordion>;
                ingredientsList.push( ac );
            }
        }
        return ingredientsList;
    }

    return (
        <div>
            { props.recallStatus &&
                <Alert severity="error">
                    Product has been recalled
                </Alert>
            }
            <Typography variant="h2" component="h2" gutterBottom>
                Retailed Product Details
            </Typography>
            <div className='view-products-root'>
                <div className={ classes.root }>
                    <FormControl className='view-batch-padding' variant="outlined">
                        <InputLabel htmlFor="component-outlined">Retailer</InputLabel>
                        <OutlinedInput disabled id="retailer" value={ props.retailer } label="Retailer" />
                    </FormControl>
                    <FormControl className='view-batch-padding' variant="outlined">
                        <InputLabel htmlFor="component-outlined">Retail Price($)</InputLabel>
                        <OutlinedInput disabled id="retail_price" value={ props.retail_price } label="Retail Price($)" />
                    </FormControl>
                    <FormControl className='view-batch-padding' variant="outlined">
                        <InputLabel htmlFor="component-outlined">Retail Location</InputLabel>
                        <OutlinedInput disabled id="retail_location" value={ props.retail_location } label="Retail Location" />
                    </FormControl>
                    <Divider />
                    <FormControl className='view-batch-padding' variant="outlined">
                        <InputLabel htmlFor="component-outlined">ID/Barcode</InputLabel>
                        <OutlinedInput disabled id="id" value={ props.id } label="ID/Barcode" />
                    </FormControl>
                    <FormControl className='view-batch-padding' variant="outlined">
                        <InputLabel htmlFor="component-outlined">CompanyName</InputLabel>
                        <OutlinedInput disabled id="company" value={ props.company } label="CompanyName" />
                    </FormControl>
                    <FormControl className='view-batch-padding' variant="outlined">
                        <InputLabel htmlFor="component-outlined">Name</InputLabel>
                        <OutlinedInput disabled id="name" value={ props.name } label="Name" />
                    </FormControl>
                    <FormControl className='view-batch-padding' variant="outlined">
                        <InputLabel htmlFor="component-outlined">Production Price($)</InputLabel>
                        <OutlinedInput disabled id="price" value={ props.price } label="Production Price($)" />
                    </FormControl>
                    <FormControl className='view-batch-padding' variant="outlined">
                        <InputLabel htmlFor="component-outlined">Weight(g)</InputLabel>
                        <OutlinedInput disabled id="weight" value={ props.weight } label="Weight($)" />
                    </FormControl>
                    <FormControl className='view-batch-padding' variant="outlined">
                        <InputLabel htmlFor="component-outlined">Location</InputLabel>
                        <OutlinedInput disabled id="location" value={ props.location } label="Location" />
                    </FormControl>
                    <FormControl className='view-batch-padding' variant="outlined">
                        <InputLabel htmlFor="component-outlined">Production Date</InputLabel>
                        <OutlinedInput disabled id="produced" value={ props.productionDate } label="Production Date" />
                    </FormControl>
                    <FormControl className='view-batch-padding' variant="outlined">
                        <InputLabel htmlFor="component-outlined">Expiry Date</InputLabel>
                        <OutlinedInput disabled id="expiry" value={ props.expiryDate } label="ExpiryDate" />
                    </FormControl>
                    <FormControl className='view-batch-padding' variant="outlined">
                        <InputLabel htmlFor="component-outlined">Quantity</InputLabel>
                        <OutlinedInput disabled id="quantity" value={ props.quantity } label="Quantity" />
                    </FormControl>
                    <FormControl className='view-batch-padding' variant="outlined">
                        <InputLabel htmlFor="component-outlined">Recall Status</InputLabel>
                        <OutlinedInput disabled id="recallStatus" value={ props.recallStatus } label="Recall Status" />
                    </FormControl>
                </div>
                <div className={ classes.accordion }>
                    <Typography className='view-products-ing' variant="caption" component="h2" gutterBottom>
                        Ingredients
                    </Typography>
                    { getIngredients() }
                </div>
                <div className={ classes.buttons }>
                    { !loaded && <Button disabled={ props.recallStatus } className={ classes.recall } color='primary' onClick={ loadLabels } variant='contained'>Load Nutrition</Button> }
                    { loaded && <Button disabled={ props.recallStatus } className={ classes.recall } color='secondary' onClick={ getLabels } variant='contained'>Get Nutrition</Button> }
                    { response }
                </div>
            </div>
        </div>
    );
}

Content.propTypes = {
    props: PropTypes.
        shape( {
            id: PropTypes.number,
            company: PropTypes.string,
            name: PropTypes.string,
            quantity: PropTypes.string,
            price: PropTypes.string,
            weight: PropTypes.string,
            productionDate: PropTypes.string,
            expiryDate: PropTypes.string,
            location: PropTypes.string,
            ingredients: PropTypes.array,
        } ),
    classes: PropTypes.object,
    loaded: PropTypes.bool,
    setLoaded: PropTypes.func,
    response: PropTypes.array,
    setResponse: PropTypes.func,
    ingredients: PropTypes.array,
    setIngredients: PropTypes.func,
};