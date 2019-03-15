import React, { useState, useEffect, useContext } from "react";
import jwtDecode from 'jwt-decode';
import {Redirect} from 'react-router-dom';
import {API_BASE_URL} from '../config';
import {loadAuthToken, refreshAuthToken, storeAuthInfo} from '../local-storage';
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

  if(user.loggedIn){
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
