import React, { useState, useEffect, useContext } from 'react';
import jwtDecode from 'jwt-decode';
import { API_BASE_URL } from '../config';
import {
  loadAuthToken,
  refreshAuthToken,
  storeAuthInfo
} from '../local-storage';
import { normalizeResponseErrors } from '../utils';
import './onboarding.scss';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export default function Onboarding(props) {
  const [firstName, setFirstName] = useState(props.user.info.firstName);
  const [lastName, setLastName] = useState(props.user.info.lastName);
  const [email, setEmail] = useState(props.user.info.email);
  const [cell, setCell] = useState(props.user.info.cell);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [updateAccountError, setUpdateAccountError] = useState(null);
  const [updatePasswordError, setUpdatePasswordError] = useState(null);
  const [successfulAccountUpdate, setSuccessfulAccountUpdate] = useState(false);
  const [successfulPasswordUpdate, setSuccessfulPasswordUpdate] = useState(
    false
  );

  const handleUpdateAccount = e => {
    e.preventDefault();

    const formattedNumber = parsePhoneNumberFromString(cell, 'US');
    if (formattedNumber && formattedNumber.isValid()) {
      setCell(formattedNumber.number);
    } else {
      setUpdateAccountError(
        'Phone number is invalid. Please make sure you included an area code.'
      );
      return;
    }

    const authToken = loadAuthToken();
    fetch(`${API_BASE_URL}/users/account/${props.user.info.id}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        email,
        firstName,
        lastName,
        cell: formattedNumber.number
      })
    })
      .then(res => normalizeResponseErrors(res))
      .then(res => res.json())
      .then(user => {
        setSuccessfulAccountUpdate(true);
        setTimeout(() => {
          setSuccessfulAccountUpdate(false);
        }, 3000);
        setUpdateAccountError(null);
        props.refresh();
      })
      .catch(err => {
        setSuccessfulAccountUpdate(false);
        setUpdateAccountError(err.message);
      });
  };

  const handleUpdatePassword = e => {
    e.preventDefault();
    const authToken = loadAuthToken();
    fetch(`${API_BASE_URL}/users/password/${props.user.info.id}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        oldPassword,
        newPassword
      })
    })
      .then(res => normalizeResponseErrors(res))
      .then(res => res.json())
      .then(user => {
        setSuccessfulPasswordUpdate(true);
        setTimeout(() => {
          setSuccessfulPasswordUpdate(false);
        }, 3000);
        setUpdatePasswordError(null);
        setConfirmPassword('');
        setNewPassword('');
        setOldPassword('');
        props.refresh();
      })
      .catch(err => {
        setSuccessfulPasswordUpdate(false);
        setUpdatePasswordError(err.message);
      });
  };

  return (
    <>
      <form className="onboarding-form" onSubmit={handleUpdateAccount}>
        <h2 className="onboarding-form-title">Update Account</h2>
        {updateAccountError && (
          <h5 className="onboarding-error">{updateAccountError}</h5>
        )}
        <section className="field">
          <label htmlFor="first">First</label>
          <input
            required
            type="text"
            onChange={e => setFirstName(e.target.value)}
            placeholder="First Name"
            value={firstName}
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
            value={lastName}
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
            value={email}
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
            value={cell}
          />
        </section>
        <button className="onboarding-form-button" type="submit">
          {successfulAccountUpdate && (
            <i className="fas fa-check update-successful-check" />
          )}
          Update Account
        </button>
      </form>

      <form className="onboarding-form" onSubmit={handleUpdatePassword}>
        <h2 className="onboarding-form-title">Update Password</h2>
        {updatePasswordError && (
          <h5 className="onboarding-error">{updatePasswordError}</h5>
        )}
        <section className="field">
          <label htmlFor="oldPassword">Old Password</label>
          <input
            required
            type="password"
            onChange={e => setOldPassword(e.target.value)}
            placeholder="Old Password"
            id="oldPassword"
            value={oldPassword}
          />
        </section>
        <section className="field">
          <label htmlFor="newPassword">New Password</label>
          <input
            required
            type="password"
            id="newPassword"
            onChange={e => setNewPassword(e.target.value)}
            placeholder="New Password"
            value={newPassword}
          />
        </section>
        <section className="field">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            required
            id="confirmPassword"
            type="password"
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            value={confirmPassword}
          />
        </section>
        <button
          disabled={newPassword === confirmPassword ? false : true}
          className="onboarding-form-button"
          type="submit"
        >
          {successfulPasswordUpdate && <i className="fas fa-check" />}
          Update Password
        </button>
      </form>
    </>
  );
}
