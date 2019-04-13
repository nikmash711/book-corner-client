import React, {useContext} from 'react';
import Onboarding from './Onboarding';
import {UserContext} from "../context";
import Navbar from './Navbar';

import './about.scss';

export default function About(props){
  let arrow= <i className="fas fa-arrow-right"></i>
  let user = useContext(UserContext);

  return(
    <React.Fragment>
    {!user.loggedIn && <Navbar/>}
    <section className='about'>
      <h1 className="about-title">Welcome To Jewish Book Corner!</h1>
      <p className="intro">If you live in the valley and are looking for a good Jewish book to read, you've come to the right place! Jewish Book Corner is designed to operate very similarly to a standard library system.</p>
      {!user.loggedIn && <Onboarding form="login"/>}
      <section className="rules-section">
        <h3 className="rules-title">How It Works</h3>
        <p className="rule">{arrow} After signing up for an account, you can check out two types of media at a time. It can be two books, two dvds, or one of each.</p>
        <p className="rule">{arrow} After checking out, the media is <strong>not</strong> yet ready for pickup. Please wait until you receive an email stating the book is ready for pickup. This will typically happen within 24 hours. <strong>Please note that if you check out anything after 2:00pm on a Thursday, your media will not be ready until the following Monday.</strong> </p>
        <p className="rule">{arrow} After the media is declared ready for pickup, you will have two days to pick it up from ___. If you do not, it will go back on the shelf. Please be considerate when checking out media and pick them up in a timely fashion.</p>
        <p className="rule">{arrow} You have two weeks (starting from when it's declared ready for pickup) to keep the media.</p>
        <p className="rule">{arrow} You are permitted one renewal per media. Renewals add an additional 7 days to the current due date.</p>
        <p className="rule">{arrow} You may place a hold on any media that is not currently available. When it's your turn, you will receive an email to pick up the book.</p>      
        <p className="rule">{arrow} You will be charged $1 a day for each day the media is overdue. Please note that you will not be reminded when your media is due, but you can always check on your account.</p>
        <p className="rule">{arrow} You will owe $25 for any lost or damaged media</p>
        <p className="rule">{arrow} We do not operate on Shabbats or Yom Tovim</p>
        <p className="rule">{arrow} If you have any Jewish books or dvds you'd like to donate, please contact us <a href="mailto:jewishbookcorner@gmail.com">via email</a> </p>
        {!user.loggedIn && <Onboarding form="signup"/>}
      </section>
    </section>
    </React.Fragment>
  )
}