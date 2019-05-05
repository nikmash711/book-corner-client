import React, { useState, useEffect, useContext } from "react";
import jwtDecode from 'jwt-decode';
import { API_BASE_URL } from '../config';
import { loadAuthToken, refreshAuthToken, storeAuthInfo } from '../local-storage';
import { normalizeResponseErrors } from '../utils';
import { UserContext } from "../context";
import './onboarding.scss';

export default function Onboarding(props) {
  const [updateAccountError, setUpdateAccountError] = useState(null);
  const [updatePasswordError, setUpdatePasswordError] = useState(null);
  const [firstName, setFirstName] = useState(props.user.info.firstName);
  const [lastName, setLastName] = useState(props.user.info.lastName);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState(props.user.info.email);
  const [cell, setCell] = useState(props.user.info.cell);

  const handleUpdateAccount = e => {
    e.preventDefault();
    const authToken = loadAuthToken();
    fetch(`${API_BASE_URL}/users/account/${props.user.info.id}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        email,
        firstName,
        lastName,
        cell,
      })
    })
      .then(res => normalizeResponseErrors(res))
      .then(res => res.json())
      .then((user) => {
        setUpdateAccountError(null);
        props.refresh();
      })
      .catch(err => {
        setUpdateAccountError(err.message);
      })
  };

  const handleUpdatePassword = e => {
    e.preventDefault();
    const authToken = loadAuthToken();
    fetch(`${API_BASE_URL}/users/password/${props.user.info.id}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
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
      .then((user) => {
        setUpdatePasswordError(null);
        props.refresh();
      })
      .catch(err => {
        setUpdatePasswordError(err.message);
      })
  };

  return (
    <>
    <form className="onboarding-form" onSubmit={handleUpdateAccount}>
      <h1 className="onboarding-form-title">Update Account</h1>
      {updateAccountError && <h5 className="onboarding-error">{updateAccountError}</h5>}
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
      <button
        className="onboarding-form-button"
        type="submit">
        Update
      </button>
    </form>
    
    <form className="onboarding-form" onSubmit={handleUpdatePassword}>
      <h1 className="onboarding-form-title">Update Password</h1>
      {updatePasswordError && <h5 className="onboarding-error">{updatePasswordError}</h5>}
      <section className="field">
        <label htmlFor="oldPassword">Old Password</label>
        <input
          required
          type="password"
          onChange={e => setOldPassword(e.target.value)}
          placeholder="Old Password"
          id="oldPassword"
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
        />
      </section>
      <button
        className="onboarding-form-button"
        type="submit">
        Update Password
      </button>
    </form>
    </>
  )
}
