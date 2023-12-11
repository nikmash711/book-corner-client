import React, { useState, useEffect, useContext } from 'react';
import jwtDecode from 'jwt-decode';
import { Redirect } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import {
  loadAuthToken,
  refreshAuthToken,
  storeAuthInfo,
} from '../local-storage';
import { normalizeResponseErrors } from '../utils';
import { UserContext } from '../context';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

import './onboarding.scss';

export default function Onboarding(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [signupError, setSignupError] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [cell, setCell] = useState('');
  const [location, setLocation] = useState('');

  let user = useContext(UserContext);

  //when the component mounts, check if the user is logged in (based on local storage) - if they are, hydrate the token from local storage
  useEffect(() => {
    const authToken = loadAuthToken();
    if (authToken) {
      user.loggedIn = true;
      refreshAuthToken().then((token) => {
        const decodedToken = jwtDecode(token);
        user.info = decodedToken.user;
      });
      setRedirect(true);
    }
  }, []);

  /*Logs in user*/
  const loginUser = (email, password) => {
    fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((res) => normalizeResponseErrors(res))
      .then((res) => res.json())
      .then(({ authToken }) => {
        storeAuthInfo(authToken);
        return authToken;
      })
      .then((authToken) => {
        user.loggedIn = true;
        const decodedToken = jwtDecode(authToken);
        user.info = decodedToken.user;
        setLoginError(null);
        setRedirect(true);
      })
      .catch((err) => {
        const { status } = err;
        const message =
          status === 401
            ? 'Incorrect username or password'
            : 'Unable to login, please try again soon!';
        setLoginError(message);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser(username, password);
  };

  const handleSignUp = (e) => {
    e.preventDefault();

    if (
      location.toLowerCase() !== 'tarzana' &&
      location.toLowerCase() !== 'north hollywood'
    ) {
      setSignupError(
        'Please type Tarzana or North Hollywood for your pickup location.'
      );
      return;
    }

    const formattedNumber = parsePhoneNumberFromString(cell, 'US');
    if (formattedNumber && formattedNumber.isValid()) {
      setCell(formattedNumber.number);
    } else {
      setSignupError(
        'Phone number is invalid. Please make sure you included an area code.'
      );
      return;
    }

    fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        firstName,
        lastName,
        cell: formattedNumber.number,
        password: newPassword,
        location,
      }),
    })
      .then((res) => normalizeResponseErrors(res))
      .then((res) => res.json())
      .then((user) => {
        loginUser(email, newPassword);
        setSignupError(null);
      })
      .catch((err) => {
        setSignupError(err.message);
      });
  };

  if (user.loggedIn) {
    return <Redirect to="/dashboard" />;
  }

  if (props.form === 'login') {
    return (
      <form className="onboarding-form" onSubmit={handleSubmit}>
        <h1 className="onboarding-form-title">Log In</h1>
        {loginError && <h5 className="onboarding-error">{loginError}</h5>}
        <section className="field">
          <label htmlFor="email">Email</label>
          <input
            required
            id="email"
            type="text"
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Email"
          />
        </section>
        <section className="field">
          <label htmlFor="password">Password</label>
          <input
            required
            id="password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </section>
        <a
          className="login-trouble"
          href="mailto:jewishbookcorner@gmail.com?subject=Unable%20To%20Login&body=~Please%20include%20your%20name%20and%20cellphone%20number.%20Thank%20you!~"
          target="_blank"
        >
          Trouble logging in?
        </a>

        <button className="onboarding-form-button" type="submit">
          Log In
        </button>

        <a className="sign-up-link" href="#signup">
          Don't have an account? Sign up here!
        </a>
      </form>
    );
  } else {
    return (
      <>
        <span id="signup" className="sign-up-anchor" />
        <form className="onboarding-form" onSubmit={handleSignUp}>
          <h1 className="onboarding-form-title">Sign Up</h1>
          {signupError && <h5 className="onboarding-error">{signupError}</h5>}
          <section className="field">
            <label htmlFor="first">First</label>
            <input
              required
              type="text"
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
            />
          </section>
          <section className="field">
            <label htmlFor="last">Last</label>
            <input
              required
              type="text"
              id="last"
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
            />
          </section>
          <section className="field">
            <label htmlFor="new-email">Email</label>
            <input
              required
              id="new-email"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </section>
          <section className="field">
            <label htmlFor="tel">Cell</label>
            <input
              required
              id="tel"
              type="tel"
              onChange={(e) => setCell(e.target.value)}
              placeholder="Cell Phone Number"
            />
          </section>
          <section className="field">
            <label htmlFor="location">Pickup Location</label>
            <input
              required
              id="location"
              type="location"
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Tarzana or North Hollywood"
            />
          </section>
          <section className="field" style={{ fontSize: 12, paddingTop: 0 }}>
            By entering your number, you agree to receive text messages at the
            phone number provided when your media is ready for pickup or
            overdue.
            <br />
            Message frequency varies. Message and data rates may apply.
          </section>
          <section className="field">
            <label htmlFor="new-password">Password</label>
            <input
              required
              id="new-password"
              type="password"
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Password"
            />
          </section>
          <section className="field">
            <label htmlFor="confirm">Confirm</label>
            <input
              required
              id="confirm"
              type="password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
            />
          </section>
          <button
            className="onboarding-form-button"
            disabled={newPassword === confirmPassword ? false : true}
            type="submit"
          >
            Sign Up
          </button>
        </form>
      </>
    );
  }
}
