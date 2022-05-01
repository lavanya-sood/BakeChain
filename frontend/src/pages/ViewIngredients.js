import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { FormControl, InputLabel, OutlinedInput, Divider, Button, Toolbar, AppBar, Drawer, List, ListItem, ListItemText, Typography, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';
import { Link } from "react-router-dom";
import bakechainLogo2 from '../bakechain2.png';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import PropTypes from 'prop-types';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
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
        allIngredientBatches();
    }, [] );

    async function allIngredientBatches ()
    {
        // NEED TO GET CURRENT FARMER
        const farmer = 'Farmer';
        const url = 'http://127.0.0.1:8082/allingredientbatches?farmer=' + farmer;
        const data = {
            headers: { 
              'Authorisation': getAuthToken()
            }
        }
        let res = await fetch( url, data );
        res = await res.json();
        const ingredients = JSON.parse( res.product );
        let copyBatches = [];
        let copyDetails = [];
        console.log(ingredients.length);
        for ( let i = 0; i < ingredients.length; i++ )
        {
            const el = createBatch( ingredients[ i ], i );
            copyBatches.push( el );
            copyDetails.push( ingredients[ i ] );
        }
        if ( ingredients.length !== 0 )
        {
            setCurrent( 0 );
        }
        if ( copyDetails.length === ingredients.length )
        {
            setBatches( copyBatches );
            setDetails( copyDetails );
            setLoaded( true );
        }
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
        if ( b.recallStatus ) {
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
                        <Link to="/farmer">
                            <Button color="inherit">Add Ingredients</Button>
                        </Link>
                        <Link to="/farmer/view-batches">
                            <Button color="inherit">View Ingredients</Button>
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
                                Ingredient Inventory
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

    const recallIngredient = async () =>
    {
        // Recall the ingredient
        console.log( props );
        const url = 'http://127.0.0.1:8082/recallIngredient?id=' + props.id;
        const data = {
            headers: { 
              'Authorisation': getAuthToken()
            }
        }
        let det = await fetch( url, data );
        det = await det.json();
        const res = JSON.parse( det.result );
        console.log( res );

    }

    return (
        <div>
            { props.recallStatus &&
                <Alert severity="error">
                    Ingredient has been recalled
                </Alert>
            }
            <Typography variant="h2" component="h2" gutterBottom>
                Ingredient Details
            </Typography>
            <div className='view-products-root'>
                <div className={ classes.root }>
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
                        <InputLabel htmlFor="component-outlined">Price($)</InputLabel>
                        <OutlinedInput disabled id="price" value={ props.price } label="Price($)" />
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
                <div className={ classes.buttons }>
                    <Button className={ classes.recall } disabled={ props.recallStatus } color='primary' onClick={recallIngredient} variant='contained'>Recall Product</Button>
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
        } ),
    classes: PropTypes.object,
    loaded: PropTypes.bool,
    setLoaded: PropTypes.func,
    response: PropTypes.array,
    setResponse: PropTypes.func,
};