import React, { Component } from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom'
import {Switch} from 'react-router-dom';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          
          <Route exact path="/" component={LandingPage}></Route>
          <Route exact path="/dashboard" component={Dashboard}></Route>
          {/* <Route exact path="/catalog" component={Dashboard}></Route>
          <Route exact path="/myOverdueMedia" component={Dashboard}></Route>
          <Route exact path="/allMedia" component={Dashboard}></Route>
          <Route exact path="/myCheckedOutMedia" component={Dashboard}></Route>
          <Route exact path="/myMediaOnHold" component={Dashboard}></Route>
          <Route exact path="/myCheckoutHistory" component={Dashboard}></Route> */}
        </Switch>
      </Router>
    );
  }
}

export default App;
