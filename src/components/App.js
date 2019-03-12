import React, { Component } from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom'
import {Redirect, Switch} from 'react-router-dom';
import LandingPage from './LandingPage';

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={LandingPage}></Route>
        </Switch>
      </Router>
    );
  }
}

export default App;
