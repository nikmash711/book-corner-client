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

export default function Dashboard(props) {
  //make sure user is logged in before being able to see this page (context?)
  let user = useContext(UserContext);
  const [redirect, setRedirect] = useState(false);
  const [category, setCategory] = useState();
  const [media, setMedia] = useState();
  const [balance, setBalance] = useState();
  const [exceededHolds, setExceededHolds] = useState(false);
  const [exceededCheckOuts, setExceededCheckOuts] = useState(false);

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
    console.log('category received:', category);
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
          setBalance(media.balance);
          media = media.overdueMedia;
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

  const generateBooks = (media) => {
    console.log('generating books with media', media)
    return media.map((media, index)=>{
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

  if(!user.loggedIn || redirect){
    return <Redirect to="/" />;
  }

  else if (media && user.info){
    return (
      <React.Fragment>
        <SidebarNav user={user} logOut={logOut} changeCategory={changeCategory}/>
        <main className="dashboard">
          {balance && <h2>Balance: ${balance}.00</h2>}
          <section className="booklist">
            {generateBooks(media)}
          </section>
        </main>
      </React.Fragment>
    );
  }

  else{
    return null;
  }
}