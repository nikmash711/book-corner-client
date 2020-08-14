import React, { useContext } from 'react';
import Onboarding from './Onboarding';
import { UserContext } from '../context';
import Navbar from './Navbar';

import './about.scss';

export default function About(props) {
  let arrow = <i className="fas fa-arrow-right" />;
  let user = useContext(UserContext);

  return (
    <React.Fragment>
      {!user.loggedIn && (
        <div className="home-navbar">
          <Navbar />
        </div>
      )}
      <section className={`about ${user.loggedIn ? 'about-loggedin' : ''}`}>
        <h1 className="about-title">Welcome To Jewish Book Corner!</h1>
        <p className="intro">
          If you're looking for great Jewish books to read in Los Angeles,
          you've come to the right place! Jewish Book Corner is designed to
          operate very similarly to a classic library. Read the the rules below!
        </p>
        {!user.loggedIn && <Onboarding form="login" />}
        <section className="rules-section">
          <h3 className="rules-title">How It Works</h3>
          <p className="rule">
            {arrow} You can check out two types of media at a time. It can be
            two books, two DVDs, or one of each.
          </p>
          <p className="rule">
            {arrow} After clicking "check out", the media will{' '}
            <strong>not</strong> be immedietely ready for pickup. Please wait
            until you receive a text message stating that the book is ready for
            pickup. This will typically happen within 24 hours.{' '}
            <strong>
              Please note that if you check out anything after 2:00pm on a
              Thursday, your media will not be ready until the following Monday.
            </strong>{' '}
          </p>
          <p className="rule">
            {arrow} We do not operate on Shabbats or Yom Tovim. Plan
            accordingly!
          </p>
          <p className="rule">
            {arrow} After you have received a text message that it is ready for
            pick up, you will have one day to pick it up from the location
            specified in the text you received. Please be considerate when
            checking out media and pick them up in a timely fashion.
          </p>
          <p className="rule">
            {arrow} Media can be checked out for a maximum of 14 days.
          </p>
          <p className="rule">
            {arrow} You are permitted one renewal per media. Renewals add an
            additional 14 days <strong>from the day you renewed.</strong>
          </p>
          <p className="rule">
            {arrow} Media should be returned in the same mailbox as it is picked
            up in.
          </p>
          <p className="rule">
            {arrow} You may place a hold on any media that is not currently
            available. When it is your turn in the queue, you will receive a
            text message to pick up the media.
          </p>
          <p className="rule">
            {arrow} You will be charged $1 a day for each day the media is
            overdue. Payment is due upon returning the book in the mailbox.
            Please note that you will not be reminded when your media is due,
            but you can always check this information on your account.
          </p>
          <p className="rule">
            {arrow} Please be respectful and careful with the media you check
            out.{' '}
            <strong>You will owe $25 for any lost or damaged media.</strong>
          </p>
          <p className="rule">
            {arrow} If you have any questions, or any Jewish books or DVDs you'd
            like to donate to the Jewish Book Corner, please contact us{' '}
            <a href="mailto:jewishbookcorner@gmail.com">via email</a> - we'd
            love to hear from you!
          </p>
          <p className="rule">
            {arrow} Any type of donation is welcome -- whether it's in honor of
            someone's birthday, in memory of a loved one, or any other occasion.
            Please feel free
            <a href="mailto:jewishbookcorner@gmail.com"> to reach out to us!</a>
          </p>
          {!user.loggedIn && <Onboarding form="signup" />}
        </section>
      </section>
      <footer className="footer no-margin-left">
        {/* <a href="https://nikmash.com" target="_blank">
          <i className="fas fa-paint-brush" /> Website by NikMash Creations
        </a> */}
        <a
          href="mailto:jewishbookcorner@gmail.com?subject=Jewish%20Book%20Corner%20Inquiry"
          target="_blank"
        >
          <i className="fas fa-envelope" /> Questions? Contact Us
        </a>
      </footer>
    </React.Fragment>
  );
}
