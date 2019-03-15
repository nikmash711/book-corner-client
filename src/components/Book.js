import React, { useState, useEffect, useContext }  from 'react';
import './book.scss'
export default function Book(props) {
  let availability = props.available ? "Availeble" : "Unavailable"
    return (
      <article className="book">
        <img src={props.img}/>
        <h2>{props.title}</h2>
        <h6>{availability}</h6>
      </article>
    );
}