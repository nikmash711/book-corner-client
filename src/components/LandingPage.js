import React, { useState, useEffect, useContext } from "react";
import jwtDecode from 'jwt-decode';
import {Redirect} from 'react-router-dom';
import {API_BASE_URL} from '../config';
import {loadAuthToken, clearAuthToken} from '../local-storage';
import {normalizeResponseErrors} from '../utils';
import {UserContext} from "../context";

export default function LandingPage(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(null);
  const [redirect, setRedirect] = useState(false);
  let user = useContext(UserContext);

  //when the component mounts, check if the user is logged in (based on local storage) - if they are, hydrate the token from local storage 
  useEffect(() => {
    const authToken = loadAuthToken();
    if (authToken) {
        user.loggedIn = true;
        refreshAuthToken();
    }}, 
  []);

  /*Logs in user*/
  const loginUser = (email, password) => {
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
    .then(({authToken}) => storeAuthInfo(authToken))
    .catch(err => {
      const {status} = err;
      const message =
          status === 401
              ? 'Incorrect username or password'
              : 'Unable to login at this time, please try again soon';
      setAuthError(message);
  })
  };

  /*Refreshes auth token*/
  const refreshAuthToken = () => {
    const authToken = loadAuthToken();
    return fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
    })
    .then(res => normalizeResponseErrors(res))
    .then(res => res.json())
    .then(({authToken}) => storeAuthInfo(authToken))
    .catch(err => {
        // We couldn't get a refresh token because our current credentials are invalid or expired, or something else went wrong, so clear them and sign us out
        setAuthError(err);
        clearAuthToken(authToken);
    });
  }; 

  // Stores the auth token in localStorage, and decodes and stores the user data stored in the token
  const storeAuthInfo = (authToken) => {
    console.log('in store auth info')
    const decodedToken = jwtDecode(authToken);
    user.info = (decodedToken.user);
    try {
      localStorage.setItem('authToken', authToken);
      setAuthError(null);
      user.loggedIn = true;
      setRedirect(true);
    } 
    catch (e) {
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    loginUser(username, password);
  };

  if(redirect){
    console.log('here')
    return <Redirect to="/dashboard" />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        onChange={e => setUsername(e.target.value)}
        placeholder="username"
      />
      <input
        type="password"
        onChange={e => setPassword(e.target.value)}
        placeholder="password"
      />
      <input type="submit" />
    </form>
  );
}
