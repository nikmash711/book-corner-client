import React, { useState, useEffect, useContext }  from 'react';
import {UserContext} from "../context";
import {Redirect} from 'react-router-dom';
import SidebarNav from './Sidebar';
import { clearAuthToken, loadAuthToken } from '../local-storage';
import {API_BASE_URL} from '../config';
import {normalizeResponseErrors} from '../utils';
import Book from './Book';

export default function Dashboard(props) {
  //make sure user is logged in before being able to see this page (context?)
  let user = useContext(UserContext);
  const [redirect, setRedirect] = useState(false);
  const [category, setCategory] = useState("");
  const [books, setBooks] = useState();

  const logOut = () => {
    clearAuthToken();
    user.loggedIn=false;
    setRedirect(true);
  }

  useEffect(() => {
    console.log('USE')
    if(!user.loggedIn || redirect){
      setRedirect(true);
    }
    else{
      changeCategory('allMedia')
    }
  }, 
  []);

  const changeCategory = (category) => {
    setCategory(category);
    const authToken = loadAuthToken();
    fetch(`${API_BASE_URL}/media/${category}`, {
      method: 'GET',
      headers: {
          Authorization: `Bearer ${authToken}`
      },
  })
      .then(res => normalizeResponseErrors(res))
      .then(res => res.json())
      .then(books => {
          setBooks(books);
          console.log(books);
      })
      .catch(error => {
        console.log(error);
      });
  }

  const generateBooks = (books) => {
    return books.map(book=>{
      return <Book {...book}/>
    })
  }

  if(!user.loggedIn || redirect){
    return <Redirect to="/" />;
  }
  else{
    return (
      <React.Fragment>
        <SidebarNav user={user} logOut={logOut} changeCategory={changeCategory}/>
        <main>
          {books && generateBooks(books)}
        </main>
      </React.Fragment>
    );
  }
}