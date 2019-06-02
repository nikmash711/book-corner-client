import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Switch } from "react-router-dom";
import About from "./About";
import Dashboard from "./Dashboard";

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={About} />
          <Route exact path="/dashboard" component={Dashboard} />
        </Switch>
      </Router>
    );
  }
}

export default App;
