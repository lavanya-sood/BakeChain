import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Manufacturer from './pages/Manufacturer';
import ViewBatches from './pages/ViewBatches';
import Home from './pages/Home';
import Farmer from './pages/Farmer';
import ViewIngredients from './pages/ViewIngredients';
import Customer from './pages/Customer';
import Retailer from './pages/Retailer';
import ViewRetailed from './pages/ViewRetailed';
import './App.css';
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import themes from './styles.js';

export default function App() {
  return (
    <ThemeProvider theme={themes}>
      <Router>
        <div>
          {/* A <Switch> looks through its children <Route>s and
              renders the first one that matches the current URL. */}
          <Switch>
            <Route path="/retailer/view-batches">
              <ViewRetailed />
            </Route>
            <Route path="/retailer">
              <Retailer />
            </Route>
            <Route path="/customer">
              <Customer />
            </Route>
            <Route path="/producer/view-batches">
              <ViewBatches />
            </Route>
            <Route path="/producer">
              <Manufacturer />
            </Route>
            <Route path="/farmer/view-batches">
              <ViewIngredients />
            </Route>
            <Route path="/farmer">
              <Farmer />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </div>
      </Router>
    </ThemeProvider>
  );
}