import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import {API_BASE_URL} from '../config';
import {normalizeResponseErrors} from '../utils';

export default function MediaForm(props) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [img, setImage] = useState("");
  const [type, setType] = useState("book");
  const [error, setError] = useState(null);

  const handleSubmit = e => {
    console.log('IN SUBMIT')
    e.preventDefault();
    fetch(`${API_BASE_URL}/media`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        Authorization: `Bearer ${props.authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          title,
          author,
          img,
          type,
      })
    })
    .then(res => normalizeResponseErrors(res))
    .then(res => res.json())
    .then((media) => {
      props.saveMedia();
    })
    .catch(err => {
      setError(err.message);
  })
  };

  return (
    <Modal
      show={props.show}
      onHide={props.cancelMedia}
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>Add Media</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          {error && <h5 className="onboarding-error">{error}</h5>}
          <section className="field">
            <label htmlFor="title">Title</label>
            <input
              required
              id="title"
              type="text"
              onChange={e => setTitle(e.target.value)}
              placeholder="Title"
            />
          </section>
          <section className="field">
            <label htmlFor="author">Author</label>
            <input
              required
              id="author"
              type="text"
              onChange={e => setAuthor(e.target.value)}
              placeholder="Author"
            />
          </section>
          <section className="field">
            <label htmlFor="image">Image</label>
            <input
              required
              id="image"
              type="text"
              onChange={e => setImage(e.target.value)}
              placeholder="Image"
            />
          </section>
          <section className="field">
            <label htmlFor="type">Type</label>
            <select
              className="select-media"
              onChange={(e) => setType(e.target.value)}>
              <option defaultValue value="book">Book</option>
              <option value="dvd">DVD</option>
            </select>
          </section>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.cancelMedia}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

//This will hopefully be used for editing as well