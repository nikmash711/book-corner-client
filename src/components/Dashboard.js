import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context';
import { Redirect } from 'react-router-dom';
import SidebarNav from './SidebarNav';
import {
  clearAuthToken,
  loadAuthToken,
  refreshAuthToken
} from '../local-storage';
import { API_BASE_URL } from '../config';
import { calculateBalance } from '../helpers';
import { normalizeResponseErrors } from '../utils';
import Book from './Book';
import './dashboard.scss';
import jwtDecode from 'jwt-decode';
import Navbar from './Navbar';
import About from './About';
import MediaForm from './MediaForm';
import UpdateAccount from './UpdateAccount';

export default function Dashboard(props) {
  //make sure user is logged in before being able to see this page (context?)
  let user = useContext(UserContext);
  const [redirect, setRedirect] = useState(false);
  const [category, setCategory] = useState();
  const [media, setMedia] = useState();
  const [balance, setBalance] = useState();
  const [exceededHolds, setExceededHolds] = useState(false);
  const [exceededCheckOuts, setExceededCheckOuts] = useState(false);
  const [users, setUsers] = useState();
  const [userFilter, setUserFilter] = useState('');
  const [mediaFilter, setMediaFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showMediaForm, setShowMediaForm] = useState(false);
  const [currentMedia, setCurrentMedia] = useState('');
  const [error, setError] = useState('');

  let admin = false;
  if (user.info) {
    if (user.info.email === 'jewishbookcorner@gmail.com') {
      admin = true;
    }
  }

  let titleKey = {
    allMedia: 'Catalog',
    myCheckedOutMedia: 'Checked Out',
    myCheckoutHistory: 'Checkout History',
    myMediaOnHold: 'On Hold',
    myOverdueMedia: 'Overdue',
    allUsers: 'User Directory',
    allRequests: 'Requests',
    allCheckedOutMedia: 'Currently Checked Out Media',
    allOverdueMedia: 'All Overdue Media'
  };

  let eyes = <i className="fas fa-eye" />;

  const logOut = () => {
    clearAuthToken();
    user.loggedIn = false;
    setRedirect(true);
  };

  const refresh = () => {
    refreshAuthToken()
      .then(token => {
        const decodedToken = jwtDecode(token);
        user.info = decodedToken.user;
        // console.log("refreshing");
        if (user.info.currentlyCheckedOut.length === 2) {
          setExceededCheckOuts(true);
        } else if (user.info.mediaOnHold.length === 2) {
          setExceededHolds(true);
        }
        //so that the page refreshes:
        changeCategory(category || 'allMedia');
      })
      .catch(error => {
        // If there's an error, it's most likely an invalid token. This needs a long term solution but for the time being just force refresh the page.
        window.location.reload();
      });
  };

  useEffect(() => {
    if (!user.loggedIn || redirect) {
      setRedirect(true);
    } else {
      refresh();
      changeCategory('allMedia');
    }
  }, []);

  const changeCategory = category => {
    setMediaFilter('');
    setUserFilter('');
    setTypeFilter('');
    if (category === 'About' || category === 'Account') {
      setCategory(category);
      return null;
    } else if (category === 'allUsers') {
      const authToken = loadAuthToken();
      fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
        .then(res => normalizeResponseErrors(res))
        .then(res => res.json())
        .then(users => {
          setCategory(category);
          setUsers(users);
        })
        .catch(error => {
          // console.log(error);
        });
    } else {
      const authToken = loadAuthToken();
      fetch(`${API_BASE_URL}/media/${category}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
        .then(res => normalizeResponseErrors(res))
        .then(res => res.json())
        .then(media => {
          if (category === 'myOverdueMedia') {
            setBalance(media.balance !== 0 ? media.balance : null);
            media = media.overdueMedia;
          } else {
            setBalance(null);
          }
          setCategory(category);
          setMedia(media);
        })
        .catch(error => {
          // console.log(error);
        });
    }
  };

  const generateBooks = medias => {
    let filteredMedia = medias;
    if (category === 'allMedia') {
      filteredMedia = medias.filter(
        media =>
          (media.title.toLowerCase().includes(mediaFilter) ||
            media.author.toLowerCase().includes(mediaFilter)) &&
          (typeFilter.includes(media.type) || media.type.includes(typeFilter))
      );
    }
    return filteredMedia.length ? (
      filteredMedia
        .sort(function(a, b) {
          if (a.author < b.author) {
            return -1;
          } else if (a.author > b.author) {
            return 1;
          } else {
            return 0;
          }
        })
        .map(media => {
          return (
            <Book
              setShowMediaForm={e => setShowMediaForm(true)}
              setCurrentMedia={e => setCurrentMedia(media)}
              setError={error => {
                setError(error.message);
                window.scrollTo(0, 0);
              }}
              user={user.info}
              key={media.title}
              exceededCheckOuts={exceededCheckOuts}
              exceededHolds={exceededHolds}
              media={media}
              category={category}
              refresh={refresh}
            />
          );
        })
    ) : (
      <h3 className="no-results">Sorry, no media matches your search</h3>
    );
  };

  const generateDirectory = users => {
    return users
      .filter(
        user =>
          user.firstName.toLowerCase().includes(userFilter) ||
          user.lastName.toLowerCase().includes(userFilter)
      )
      .sort(function(a, b) {
        if (a.firstName < b.firstName) {
          return -1;
        } else if (a.firstName > b.firstName) {
          return 1;
        } else {
          return 0;
        }
      })
      .map((user, index) => {
        let userBalance = calculateBalance(user.currentlyCheckedOut);
        return (
          <article key={index} className="user-card">
            <h2>{user.firstName + ' ' + user.lastName}</h2>
            <h4>{user.email}</h4>
            <h4>{user.cell}</h4>
            {userBalance > 0 && (
              <h4 className="unavailable">Balance: ${userBalance}.00</h4>
            )}
          </article>
        );
      });
  };

  const saveMedia = () => {
    setShowMediaForm(false);
    changeCategory('allMedia');
  };

  const cancelMedia = () => {
    setShowMediaForm(false);
    changeCategory('allMedia');
  };

  const addNewMedia = () => {
    setCurrentMedia(null);
    setShowMediaForm(true);
  };

  if (!user.loggedIn || redirect) {
    return <Redirect to="/" />;
  } else if (category === 'allUsers' && users && user.info) {
    return (
      <React.Fragment>
        <SidebarNav
          user={user}
          logOut={logOut}
          changeCategory={changeCategory}
        />
        <Navbar />
        <main className="dashboard">
          {category && <h1 className="page-title">{titleKey[category]}</h1>}
          <section className="user-directory">
            <input
              type="search"
              placeholder="Search Here"
              className="search"
              onChange={e => setUserFilter(e.target.value.toLowerCase())}
            />
            {generateDirectory(users)}
          </section>
        </main>
      </React.Fragment>
    );
  } else if (category === 'About') {
    return (
      <React.Fragment>
        <SidebarNav
          user={user}
          logOut={logOut}
          changeCategory={changeCategory}
        />
        <Navbar />
        <main className="dashboard">
          <About />
        </main>
      </React.Fragment>
    );
  } else if (category === 'Account') {
    return (
      <React.Fragment>
        <SidebarNav
          user={user}
          logOut={logOut}
          changeCategory={changeCategory}
        />
        <Navbar />
        <main className="dashboard">
          <UpdateAccount refresh={refresh} user={user} />
        </main>
      </React.Fragment>
    );
  } else if (media && user.info) {
    const authToken = loadAuthToken();
    return (
      <React.Fragment>
        <SidebarNav
          user={user}
          logOut={logOut}
          changeCategory={changeCategory}
        />
        <Navbar />
        <main className="dashboard">
          {category && <h1 className="page-title">{titleKey[category]}</h1>}
          {balance && (
            <h2 className="unavailable total-balance">
              Total Balance: ${balance}.00
            </h2>
          )}
          {admin && category === 'allMedia' && (
            <button className="add-new-media-btn" onClick={() => addNewMedia()}>
              Add New Media
            </button>
          )}
          {error && <h5 className="onboarding-error">{error}</h5>}
          <MediaForm
            show={showMediaForm}
            authToken={authToken}
            currentMedia={currentMedia}
            saveMedia={() => saveMedia()}
            cancelMedia={() => cancelMedia()}
          />
          <section className="booklist">
            {category === 'allMedia' && (
              <div className="filter-options">
                <input
                  className="search"
                  type="search"
                  placeholder="Search Here"
                  onChange={e => setMediaFilter(e.target.value.toLowerCase())}
                />
                <select
                  className="select-media"
                  onChange={e => setTypeFilter(e.target.value)}
                >
                  <option defaultValue value="">
                    All Media
                  </option>
                  <option value="kid-book">Kid Books</option>
                  <option value="adult-book">Adult Books</option>
                  <option value="dvd">DVDs/CDs</option>
                </select>
              </div>
            )}
            {media.length ? (
              generateBooks(media)
            ) : (
              <h4 className="nothing-here">
                {eyes} Nothing To See Here For Now {eyes}
              </h4>
            )}
          </section>
        </main>
        <footer className="footer">
          <a href="https://nikmash.com" target="_blank">
            <i className="fas fa-paint-brush" /> Website by NikMash Creations
          </a>
          <a
            href="mailto:jewishbookcorner@gmail.com?subject=Jewish%20Book%20Corner%20Inquiry"
            target="_blank"
          >
            <i className="fas fa-envelope" /> Questions? Contact Us
          </a>
        </footer>
      </React.Fragment>
    );
  } else {
    return <i className="fas fa-spinner fa-spin loading-spinner" />;
  }
}
