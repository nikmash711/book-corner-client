import React, { useState, useEffect, useContext }  from 'react';
import {UserContext} from "../context";
import {Redirect} from 'react-router-dom';
import SidebarNav from './SidebarNav';
import { clearAuthToken, loadAuthToken, refreshAuthToken } from '../local-storage';
import {API_BASE_URL} from '../config';
import {normalizeResponseErrors} from '../utils';
import Book from './Book';
import './dashboard.scss';
import jwtDecode from 'jwt-decode';
import moment from 'moment';

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
  // const [newMediaImg, setNewMediaImg] = useState();
  // const [showForm, setShowForm] = useState(false);

  let admin=false;
  if(user.info)
  {
    if(user.info.email==='jewishbookcorner@gmail.com'){
      admin=true;
    }
  }

  let titleKey = {
    'allMedia': 'Catalog',
    'myCheckedOutMedia': 'Checked Out', 
    'myCheckoutHistory': 'Checkout History',
    'myMediaOnHold': 'On Hold',
    'myOverdueMedia': 'Overdue',
    'allUsers': 'User Directory',
    'allRequests': 'Requests',
    'allCheckedOutMedia': 'Currently Checked Out Media',
    'allOverdueMedia': 'All Overdue Media',
  }

  let eyes = <i className="fas fa-eye"></i>;

  const logOut = () => {
    clearAuthToken();
    user.loggedIn=false;
    setRedirect(true);
  }

  const refresh = () => {
    refreshAuthToken()
    .then(token=>{
      const decodedToken = jwtDecode(token);
      user.info = decodedToken.user;
      console.log('refreshing'); 
      if(user.info.currentlyCheckedOut.length===2){
        setExceededCheckOuts(true);
      }
      else if(user.info.mediaOnHold.length===2){
        setExceededHolds(true);
      }
      //so that the page refreshes: 
      // else {
        console.log('here');
        changeCategory(category || 'allMedia')
      // }
    })
  }

  useEffect(() => {
    if(!user.loggedIn || redirect){
      setRedirect(true);
    }
    else{
      refresh();
      changeCategory('allMedia')
    }
  }, 
  []);

  // useEffect(()=>{
  //   const path = props.match.path.slice(1);
  //   console.log('PATH', path);
  //   changeCategory(path);
  // }, [props.match.path])

  const changeCategory = (category) => { 
    setMediaFilter('');
    setUserFilter('');
    setTypeFilter('');
    if(category==='allUsers'){
      const authToken = loadAuthToken();
      fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${authToken}`
        },
    })
        .then(res => normalizeResponseErrors(res))
        .then(res => res.json())
        .then(users => {
          setCategory(category);
          setUsers(users);
        })
        .catch(error => {
          console.log(error);
        });
    }
    else{
      const authToken = loadAuthToken();
      fetch(`${API_BASE_URL}/media/${category}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${authToken}`
        },
    })
        .then(res => normalizeResponseErrors(res))
        .then(res => res.json())
        .then(media => {
          if(category==='myOverdueMedia'){
            setBalance(media.balance!==0 ? media.balance : null);
            media = media.overdueMedia;
          }
          else{
            setBalance(null);
          }
          setCategory(category);
          setMedia(media);
          console.log('balance is', balance);
  
          //this seems to happen more than once:
          // console.log('HISTORY', props.history);
          // props.history.push(`/${category}`)
        })
        .catch(error => {
          console.log(error);
        });
    }
  }

  const generateBooks = (medias) => {
    let filteredMedia = medias;
    if(category==='allMedia'){
      filteredMedia = medias.filter(media=>media.title.toLowerCase().includes(mediaFilter) && media.type.includes(typeFilter))
    }
    return filteredMedia.sort(function(a, b){
      if(a.title < b.title) { 
        return -1; 
      }
      else if(a.title > b.title) {
        return 1; 
      }
      else{
        return 0;
      }
    })
    .map((media, index)=>{
      return <Book 
        user={user.info}
        key={index}
        exceededCheckOuts={exceededCheckOuts} 
        exceededHolds={exceededHolds}
        media={media} 
        category={category} 
        refresh={refresh}/>
    })
  }

  const dayNow =  
  moment().calendar(null, {
    sameDay: 'MM/DD/YYYY',
    nextDay: 'MM/DD/YYYY',
    nextWeek: 'MM/DD/YYYY',
    lastDay: 'MM/DD/YYYY',
    lastWeek:'MM/DD/YYYY',
    sameElse: 'MM/DD/YYYY'
  });

  const calculateBalance = (overdueMedia) => {
    let sum = 0;

    for(let media of overdueMedia){
      let now = moment(dayNow, 'MM/DD/YYYY');
      let due = moment(media.dueDate, 'MM/DD/YYYY');
      //Difference in number of days
      let diff = moment.duration(now.diff(due)).asDays();
      sum+=diff;
    }
    return sum;
  };

  const generateDirectory = (users) => {
    return users
    .filter(user=>user.firstName.toLowerCase().includes(userFilter) || user.lastName.toLowerCase().includes(userFilter))
    .sort(function(a, b){
      if(a.firstName < b.firstName) { 
        return -1; 
      }
      else if(a.firstName > b.firstName) {
        return 1; 
      }
      else{
        return 0;
      }
    })
    .map((user, index)=>{
      let userBalance = calculateBalance(user.currentlyCheckedOut);
      return (
        <article key={index} className='user'>
          <h3>{user.firstName + ' ' + user.lastName}</h3>
          <p>{user.email}</p>
          <p>{user.cell}</p>
          {
            userBalance>0 &&
            <p>Balance: ${userBalance}.00</p>
          }
        </article>
      )
    })
  }

  if(!user.loggedIn || redirect){
    return <Redirect to="/" />;
  }

  else if(category==='addMedia'){
    return (
      <React.Fragment>
        <SidebarNav user={user} logOut={logOut} changeCategory={changeCategory}/>
        <main className="dashboard">
          <section className="add-media">
          {/* <MediaForm/> */}
          </section>
        </main>
      </React.Fragment>
    );
  }

  else if (category==='allUsers' && users && user.info){
    return (
      <React.Fragment>
        <SidebarNav user={user} logOut={logOut} changeCategory={changeCategory}/>
        <main className="dashboard">
          {category && <h1 className="page-title">{titleKey[category]}</h1>}
          <section className="user-directory">
            <input
              type="search"
              onChange={(e)=>setUserFilter(e.target.value)}
            />
            {generateDirectory(users)}
          </section>
        </main>
      </React.Fragment>
    );
  }

  else if (media && user.info){
    return (
      <React.Fragment>
        <SidebarNav user={user} logOut={logOut} changeCategory={changeCategory}/>
        <main className="dashboard">
          {category && <h1 className="page-title">{titleKey[category]}</h1>}
          {balance && <h2>Balance: ${balance}.00</h2>}
          <section className="booklist">
            { category==='allMedia' && 
            <div className="filter-options">
              <input
                className="search-media"
                type="search"
                placeholder="Search Here"
                onChange={(e)=>setMediaFilter(e.target.value)}
              />
              <select 
                className="select-media"
                onChange={(e)=>setTypeFilter(e.target.value)}>
                <option defaultValue value="">All Media</option>
                <option value="book">Books</option>
                <option value="dvd">DVDs</option>
              </select>
            </div>
            }
            {media.length ? generateBooks(media) : 
            <p className="nothing-here">{eyes}{eyes} Nothing To See Here For Now {eyes}{eyes}</p>}
          </section>
        </main>
      </React.Fragment>
    );
  }

  else{
    return null;
  }
}