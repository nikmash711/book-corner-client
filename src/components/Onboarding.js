import React, { useState, useEffect, useContext } from "react";
import jwtDecode from 'jwt-decode';
import {Redirect} from 'react-router-dom';
import {API_BASE_URL} from '../config';
import {loadAuthToken, refreshAuthToken, storeAuthInfo} from '../local-storage';
import {normalizeResponseErrors} from '../utils';
import {UserContext} from "../context";
import './onboarding.scss';

export default function Onboarding(props) {
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
    <main className="onboarding-page">
      <form className="onboarding-form" onSubmit={handleSubmit}>
        <h1 className="onboarding-form-title">Log In</h1>
        <section className="field">
          <label htmlFor="email">Email</label>
          <input
            required
            id="email"
            type="text"
            onChange={e => setUsername(e.target.value)}
            placeholder="Email"
          />
        </section>
        <section className="field">
          <label htmlFor="password">Password</label>
          <input
            required
            id="password"
            type="password"
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
          />
        </section>
        <button className="onboarding-form-button" type="submit">Log In</button>
      </form>
      <form className="onboarding-form" onSubmit={handleSignUp}>
        <h1 className="onboarding-form-title">Sign Up</h1>
        <section className="field">
          <label htmlFor="first">First</label>
          <input
          required
          type="text"
          onChange={e => setFirstName(e.target.value)}
          placeholder="First Name"
          />
        </section>
        <section className="field">
          <label htmlFor="last">Last</label>
          <input
          required
          type="text"
          id="last"
          onChange={e => setLastName(e.target.value)}
          placeholder="Last Name"
          />
        </section>
        <section className="field">
          <label htmlFor="new-email">Email</label>
          <input
          required
          id="new-email"
          type="email"
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          />
        </section>
        <section className="field">
          <label htmlFor="tel">Cell</label>
          <input
          required
          id="tel"
          type="tel"
          onChange={e => setCell(e.target.value)}
          placeholder="Cell Phone Number"
          />
        </section>
        <section className="field">
          <label htmlFor="new-password">Password</label>
          <input
          required
          id="new-password"
          type="password"
          onChange={e => setNewPassword(e.target.value)}
          placeholder="Password"
          />
        </section>
        <section className="field">
          <label htmlFor="confirm">Confirm</label>
          <input
          required
          id="confirm"
          type="password"
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          />
        </section>
        <button           
          className="onboarding-form-button"
          disabled={newPassword===confirmPassword ? false : true}
          type="submit">
          Sign Up</button> 
      </form>
      {authError && <span>{authError}</span>}
    </main>
  );
}
