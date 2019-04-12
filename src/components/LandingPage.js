import React, { useState, useEffect, useContext } from "react";
import jwtDecode from 'jwt-decode';
import {Redirect} from 'react-router-dom';
import {API_BASE_URL} from '../config';
import {loadAuthToken, refreshAuthToken, storeAuthInfo} from '../local-storage';
import {normalizeResponseErrors} from '../utils';
import {UserContext} from "../context";
import Navbar from './Navbar';

export default function LandingPage(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [cell, setCell] = useState("");

  let user = useContext(UserContext);

  //when the component mounts, check if the user is logged in (based on local storage) - if they are, hydrate the token from local storage 
  useEffect(() => {
    const authToken = loadAuthToken();
    console.log(authToken)
    if (authToken) {
        user.loggedIn = true;
        refreshAuthToken()
        .then(token=>{
          console.log('hereeee')
          const decodedToken = jwtDecode(token);
          user.info = decodedToken.user;
          console.log('hereeee', decodedToken.user)
        })
        setRedirect(true);
    }}, 
  []);

  /*Logs in user*/
  const loginUser = (email, password) => {
    console.log('logging in')
    fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          email,
          password
      })
    })
    .then(res => normalizeResponseErrors(res))
    .then(res => res.json())
    .then(({authToken}) => {
      storeAuthInfo(authToken);
      return authToken;
    })
    .then((authToken)=>{
      user.loggedIn = true;
      const decodedToken = jwtDecode(authToken);
      user.info = (decodedToken.user);
      setAuthError(null);
      setRedirect(true);
    })
    .catch(err => {
      const {status} = err;
      const message =
          status === 401
              ? 'Incorrect username or password'
              : 'Unable to login at this time, please try again soon';
      setAuthError(message);
  })
  };

  const handleSubmit = e => {
    e.preventDefault();
    loginUser(username, password);
  };

  const handleSignUp = e => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          email,
          firstName,
          lastName,
          cell,
          password: newPassword
      })
    })
    .then(res => normalizeResponseErrors(res))
    .then(res => res.json())
    .then((user) => {
      loginUser(email, newPassword);
    })
    .catch(err => {
      setAuthError(err.message);
  })
  };

  if(user.loggedIn){
    return <Redirect to="/dashboard" />;
  }

  return (
    <React.Fragment>
    <Navbar/>
    <main>
      <form onSubmit={handleSubmit}>
        <h2>Log In</h2>
        <input
          required
          type="text"
          onChange={e => setUsername(e.target.value)}
          placeholder="username"
        />
        <input
          required
          type="password"
          onChange={e => setPassword(e.target.value)}
          placeholder="password"
        />
        <button type="submit">Log In</button>
      </form>
      <form onSubmit={handleSignUp}>
        <h2>Sign Up</h2>
        <input
          required
          type="text"
          onChange={e => setFirstName(e.target.value)}
          placeholder="First Name"
        />
        <input
          required
          type="text"
          onChange={e => setLastName(e.target.value)}
          placeholder="Last Name"
        />
        <input
          required
          type="email"
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          required
          type="tel"
          onChange={e => setCell(e.target.value)}
          placeholder="Cell Phone Number"
        />
        <input
          required
          type="password"
          onChange={e => setNewPassword(e.target.value)}
          placeholder="Password"
        />
        <input
          required
          type="password"
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
        />
        <button 
          disabled={newPassword===confirmPassword ? false : true}
          type="submit">
          Sign Up
        </button>
      </form>
      {authError && <span>{authError}</span>}
    </main>
    </React.Fragment>
  );
}
