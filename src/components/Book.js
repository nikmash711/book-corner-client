import React, { useState, useEffect, useContext }  from 'react';
import { loadAuthToken } from '../local-storage';
import {API_BASE_URL} from '../config';
import {normalizeResponseErrors} from '../utils';
import './book.scss'
import {UserContext} from "../context";
import moment from 'moment';

export default function Book(props) {
  let user = useContext(UserContext);
  let [ableToPlaceHold, setAbleToPlaceHold] = useState(true);
  let [ableToCheckOut, setAbleToCheckOut] = useState(true);
  let [ableToCancelHold, setAbleToCancelHold] = useState(true);
  let [availability, setAvailability] = useState(props.media.available ? "Available" : "Unavailable");

  let admin=false;
  if(user && user.info.email==='jewishbookcorner@gmail.com'){
   admin=true;
  }

  let dueDate = moment().add(14, 'days').calendar(null, {
    sameDay: 'MM/DD/YYYY',
    nextDay: 'MM/DD/YYYY',
    nextWeek: 'MM/DD/YYYY',
    lastDay: 'MM/DD/YYYY',
    lastWeek:'MM/DD/YYYY',
    sameElse: 'MM/DD/YYYY'
  });

  useEffect(() => {
    //user can only place a hold on a book if they haven't already checked out 2, if this book isnt already in their currently checked out, and if its unavailable, and not admin 
    props.exceededHolds ? setAbleToPlaceHold(false)
    : props.user.currentlyCheckedOut.includes(props.media.id) ? setAbleToPlaceHold(false) 
    : props.user.mediaOnHold.includes(props.media.id) ? setAbleToPlaceHold(false) 
    : availability ==="Available" ? setAbleToPlaceHold(false)
    : admin ? setAbleToPlaceHold(false) 
    : setAbleToPlaceHold(true)
    
    //user can only check out a book if they haven't already checked out 2, if this book isnt already in their currently checked out, and if its available 
    props.exceededCheckOuts ? setAbleToCheckOut(false) 
    : props.user.currentlyCheckedOut.includes(props.media.id) ? setAbleToCheckOut(false) 
    : availability ==="Unavailable" ? setAbleToCheckOut(false)
    : admin ? setAbleToCheckOut(false)  
    : setAbleToCheckOut(true);

    props.user.mediaOnHold.includes(props.media.id) ? setAbleToCancelHold(true) : setAbleToCancelHold(false);
  },
 );

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
        setAbleToCheckOut(false)
        setAvailability('Unavailable');
        return props.refresh();
      })
      .catch(error => {
        console.log(error);
      });
  }

  const placeHold = (mediaId, action) => {
    let updatedMedia; 
    const authToken = loadAuthToken();
    fetch(`${API_BASE_URL}/media/hold/${mediaId}/${action}`, {
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
        if(action==='place'){
          setAbleToPlaceHold(false)
          setAbleToCancelHold(true)
        }
        else{
          setAbleToPlaceHold(true)
          setAbleToCancelHold(false)
        }
        return props.refresh()
      })
      .catch(error => {
        console.log(error);
      });
  }

  const readyForPickup = (mediaId) => {
    let updatedMedia;
    const authToken = loadAuthToken();
    fetch(`${API_BASE_URL}/media/pickup/${mediaId}`, {
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
        return props.refresh()
      })
      .catch(error => {
        console.log(error);
      });
  }

  const returnMedia = (mediaId, userId) => {
    let updatedMedia;
    const authToken = loadAuthToken();
    fetch(`${API_BASE_URL}/media/availability/${mediaId}/${userId}`, {
      method: 'PUT',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        available: true
      })
    })
      .then(res => normalizeResponseErrors(res))
      .then(res => res.json())
      .then(results => {
        updatedMedia = results;
        console.log('hold queue', props.media.holdQueue)
        //if theres a hold queue: 
        if(props.media.holdQueue.length){
          return fetch(`${API_BASE_URL}/media/pickup/${mediaId}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`
            },
            body: JSON.stringify({
              holdQueue: props.media.holdQueue
            })
          })
        }
        else {
          return Promise.resolve();
        }
      })
      .then(results=>{
        if(results){
          updatedMedia = results;
        }

        return props.refresh()

      })
      .catch(error => {
        console.log(error);
      });
  }

  return (
    <article className="book">
      <img src={props.media.img} alt="media"/>
      <h2>{props.media.title}</h2>
      {props.category==='allMedia' && <h6 className={availability.toLowerCase()}>{availability}</h6>}
      {props.category==='myCheckedOutMedia' && <h6 className="unavailable">{`Due: ${props.media.dueDate || 'Not Ready For Pickup'}`}</h6>}
      {
        ableToCheckOut && 
        <button
          onClick={()=>checkOut(props.media.id)}
        >
          Check Out
        </button>
      }
      {
        ableToPlaceHold && 
        <button
          onClick={()=>placeHold(props.media.id, 'place')}
        >
          Place Hold
        </button>
      }
      {
        ableToCancelHold && 
        <button
          onClick={()=>placeHold(props.media.id, 'cancel')}
        >
          Cancel Hold
        </button>
      }
      {
        admin && props.category==='allRequests' &&
        
        <a
        href={`mailto:${props.media.checkedOutBy.email}?subject=${props.media.title} Is Ready For Pickup &body= Please pick up this media within the next two days. It is due back ${dueDate}`}
        onClick={()=>readyForPickup(props.media.id, 'pickup')}
        >
          Ready For Pickup
        </a>
      }
      {
        admin && props.category==='allCheckedOutMedia' &&
        <a
          href= {props.media.holdQueue.length ? `mailto:${props.media.holdQueue[0].email}?subject=${props.media.title} Is Ready For Pickup &body= Please pick up this media within the next two days. It is due back ${dueDate}` : "#"}
          onClick={()=>returnMedia(props.media.id, props.media.checkedOutBy.id)}
        >
          Return Media
        </a>
      }
    </article>
  );
}