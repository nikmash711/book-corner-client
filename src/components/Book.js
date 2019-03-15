import React, { useState, useEffect }  from 'react';
import { loadAuthToken } from '../local-storage';
import {API_BASE_URL} from '../config';
import {normalizeResponseErrors} from '../utils';
import './book.scss'

export default function Book(props) {
  const [media, setMedia] = useState(props.media);
  let [ableToPlaceHold, setAbleToPlaceHold] = useState(true);
  let [ableToCheckOut, setAbleToCheckOut] = useState(true);

  let availability = media.available ? "Available" : "Unavailable";

  useEffect(() => {
    //user can only place a hold on a book if they haven't already checked out 2, if this book isnt already in their currently checked out, and if its unavailable 
    props.exceededHolds ? setAbleToPlaceHold(false)
    : props.user.currentlyCheckedOut.includes(media.id) ? setAbleToPlaceHold(false) 
    : props.user.mediaOnHold.includes(media.id) ? setAbleToPlaceHold(false) 
    : availability ==="Available" ? setAbleToPlaceHold(false)
    : setAbleToPlaceHold(true)
    
    //user can only check out a book if they haven't already checked out 2, if this book isnt already in their currently checked out, and if its available 
    props.exceededCheckOuts ? setAbleToCheckOut(false) 
    : props.user.currentlyCheckedOut.includes(media.id) ? setAbleToCheckOut(false) 
    : availability ==="Unavailable" ? setAbleToCheckOut(false) 
    : setAbleToCheckOut(true);
  },
  [props.user]);

  const checkOut = (mediaId) => {
    const authToken = loadAuthToken();
    let userId = props.user.id; 
    fetch(`${API_BASE_URL}/media/availability/${mediaId}/${userId}`, {
      method: 'PUT',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        available: false
      })
    })
      .then(res => normalizeResponseErrors(res))
      .then(res => res.json())
      .then(updatedMedia => {
        setMedia(updatedMedia);
        setAbleToCheckOut(false)
        props.refresh();
      })
      .catch(error => {
        console.log(error);
      });
  }

  const placeHold = (mediaId) => {
    let updatedMedia; 
    const authToken = loadAuthToken();
    fetch(`${API_BASE_URL}/media/placeHold/${mediaId}`, {
      method: 'PUT',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
      }
    })
      .then(res => normalizeResponseErrors(res))
      .then(res => res.json())
      .then(results => {
        updatedMedia = results;
        props.refresh();
      })
      .then(()=>{
        console.log('EHRKRKBRK')
        setMedia(updatedMedia);
        setAbleToPlaceHold(false)
      })
      .catch(error => {
        console.log(error);
      });
  }

    return (
      <article className="book">
        <img src={media.img} alt="media"/>
        <h2>{media.title}</h2>
        {props.category==='allMedia' && <h6 className={availability.toLowerCase()}>{availability}</h6>}
        {props.category==='myCheckedOutMedia' && <h6 className="unavailable">{media.dueDate || 'Not Ready For Pickup'}</h6>}
        {
          ableToCheckOut && 
          <button
            onClick={()=>checkOut(media.id)}
          >
            Check Out
          </button>
        }
        {
          ableToPlaceHold && 
          <button
            onClick={()=>placeHold(media.id)}
          >
            Place Hold
          </button>
        }
      </article>
    );
}