import React, { useState, useEffect, useContext } from 'react';
import { loadAuthToken } from '../local-storage';
import { API_BASE_URL } from '../config';
import { normalizeResponseErrors } from '../utils';
import './book.scss';
import { UserContext } from '../context';
import moment from 'moment';
import { adminEmail } from '../vars';

export default class Book extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ableToPlaceHold: true,
      ableToCheckOut: true,
      ableToCancelHold: false,
      availability: ''
    };
  }

  componentDidUpdate = prevProps => {
    if (prevProps.media !== this.props.media) {
      console.log('HERE');
      const admin = this.props.user.email.toLowerCase() === adminEmail;
      //User can only check out a book if they haven't already checked out 2, if this book isnt already in their currently checked out, and if its available
      if (
        this.props.exceededCheckOuts ||
        this.props.user.currentlyCheckedOut.includes(this.props.media.id) ||
        !this.props.media.available ||
        admin
      ) {
        this.setState({ ableToCheckOut: false });
      }

      //User can only place a hold on a book if they haven't already checked out 2, if this book isnt already in their currently checked out, and if its unavailable, and not admin
      if (
        this.props.exceededHolds ||
        this.props.user.currentlyCheckedOut.includes(this.props.media.id) ||
        this.props.user.mediaOnHold.includes(this.props.media.id) ||
        this.props.media.available ||
        admin
      ) {
        this.setState({ ableToPlaceHold: false });
      }

      if (this.props.user.mediaOnHold.includes(this.props.media.id)) {
        this.setState({ ableToCancelHold: true });
      }

      if (this.props.media.available) {
        console.log('SETTING AVAILABILITY TO Available');
        this.setState({ availability: 'Available' });
      } else {
        console.log('SETTING AVAILABILITY TO Unavailable');
        this.setState({ availability: 'Unavailable' });
      }
    }
  };

  render() {
    const dayNow = moment().calendar(null, {
      sameDay: 'MM/DD/YYYY',
      nextDay: 'MM/DD/YYYY',
      nextWeek: 'MM/DD/YYYY',
      lastDay: 'MM/DD/YYYY',
      lastWeek: 'MM/DD/YYYY',
      sameElse: 'MM/DD/YYYY'
    });

    const admin = this.props.user.email.toLowerCase() === adminEmail;

    let now = moment(dayNow, 'MM/DD/YYYY');
    let due = moment(this.props.media.dueDate, 'MM/DD/YYYY');

    let tense = moment.duration(now.diff(due)).asDays() > 0 ? 'Was Due' : 'Due';

    let icon =
      this.props.media.type === 'adult-book' ||
      this.props.media.type === 'kid-book' ? (
        <i className="fas fa-book" />
      ) : (
        <i className="fas fa-compact-disc" />
      );

    const checkOut = mediaId => {
      this.setState({ ableToPlaceHold: false });
      const authToken = loadAuthToken();
      let userId = this.props.user.id;
      fetch(`${API_BASE_URL}/media/availability/${mediaId}/${userId}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
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
          this.setState({
            ableToCheckOut: false,
            availability: 'Unavailable'
          });
          return this.props.refresh();
        })
        .catch(error => {
          this.props.setError(error);
        });
    };

    const placeHold = (mediaId, action) => {
      let updatedMedia;
      const authToken = loadAuthToken();
      fetch(`${API_BASE_URL}/media/hold/${mediaId}/${action}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        }
      })
        .then(res => normalizeResponseErrors(res))
        .then(res => res.json())
        .then(results => {
          updatedMedia = results;
          if (action === 'place') {
            this.setState({ ableToPlaceHold: false, ableToCancelHold: true });
          } else {
            this.setState({ ableToPlaceHold: true, ableToCancelHold: false });
          }
          return this.props.refresh();
        })
        .catch(error => {
          // console.log(error);
        });
    };

    const readyForPickup = mediaId => {
      let updatedMedia;
      const authToken = loadAuthToken();
      fetch(`${API_BASE_URL}/media/pickup/${mediaId}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        }
      })
        .then(res => normalizeResponseErrors(res))
        .then(res => res.json())
        .then(results => {
          updatedMedia = results;
          return this.props.refresh();
        })
        .catch(error => {
          // console.log(error);
        });
    };

    const renew = mediaId => {
      let updatedMedia;
      const authToken = loadAuthToken();
      fetch(`${API_BASE_URL}/media/renew/${mediaId}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        }
      })
        .then(res => normalizeResponseErrors(res))
        .then(res => res.json())
        .then(results => {
          updatedMedia = results;
          return this.props.refresh();
        })
        .catch(error => {
          // console.log(error);
        });
    };

    const returnMedia = (mediaId, userId) => {
      let updatedMedia;
      const authToken = loadAuthToken();
      fetch(`${API_BASE_URL}/media/availability/${mediaId}/${userId}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
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
          //if theres a hold queue:
          if (this.props.media.holdQueue.length) {
            return fetch(`${API_BASE_URL}/media/pickup/${mediaId}`, {
              method: 'PUT',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`
              },
              body: JSON.stringify({
                holdQueue: this.props.media.holdQueue
              })
            });
          } else {
            return Promise.resolve();
          }
        })
        .then(results => {
          if (results) {
            updatedMedia = results;
          }

          return this.props.refresh();
        })
        .catch(error => {
          // console.log(error);
        });
    };

    const handleEdit = () => {
      this.props.setShowMediaForm();
      this.props.setCurrentMedia();
    };

    return (
      <article className="media">
        <section className="media-image-section">
          <img className="media-image" src={this.props.media.img} alt="media" />
        </section>
        <section className="media-info">
          <section>
            <h2 className="media-title">{this.props.media.title}</h2>
            <span className="media-icon">{icon}</span>
            {admin && (
              <button className="edit-media-button" onClick={handleEdit}>
                <i className="fas fa-edit" />
              </button>
            )}
            <h6 className="media-author">By: {this.props.media.author}</h6>
          </section>
          {this.props.category === 'allMedia' && (
            <h6
              className={`media-subcontent ${this.state.availability.toLowerCase()}`}
            >
              {this.state.availability}
            </h6>
          )}
          {(this.props.category === 'allOverdueMedia' ||
            this.props.category === 'allCheckedOutMedia') && (
            <React.Fragment>
              <h6 className="media-subcontent">
                Checked Out By:{' '}
                {this.props.media.checkedOutBy &&
                  this.props.media.checkedOutBy.firstName +
                    ' ' +
                    this.props.media.checkedOutBy.lastName}
              </h6>
              <h6 className="unavailable media-subcontent">{`${tense}: ${
                this.props.media.dueDate
              }`}</h6>
            </React.Fragment>
          )}
          {admin && this.props.category === 'allRequests' && (
            <h6 className="media-subcontent">
              Requested By:{' '}
              {this.props.media.checkedOutBy &&
                this.props.media.checkedOutBy.firstName +
                  ' ' +
                  this.props.media.checkedOutBy.lastName}
            </h6>
          )}
          {(this.props.category === 'myCheckedOutMedia' ||
            this.props.category === 'myOverdueMedia') && (
            <h6 className="unavailable media-subcontent">
              {this.props.media.dueDate
                ? `${tense}: ${this.props.media.dueDate}`
                : 'Not Ready For Pickup'}
            </h6>
          )}
          {this.state.ableToCheckOut && this.props.category === 'allMedia' ? (
            <button
              className="action-button-skin media-button"
              onClick={() => checkOut(this.props.media.id)}
            >
              Check Out
            </button>
          ) : this.state.ableToPlaceHold &&
            this.props.category === 'allMedia' ? (
            <button
              className="action-button-skin media-button"
              onClick={() => placeHold(this.props.media.id, 'place')}
            >
              Place Hold
            </button>
          ) : this.state.ableToCancelHold ? (
            <button
              className="action-button-skin media-button"
              onClick={() => placeHold(this.props.media.id, 'cancel')}
            >
              Cancel Hold
            </button>
          ) : (
            ''
          )}
          {admin &&
            this.props.category === 'allRequests' &&
            this.props.media.checkedOutBy && (
              <button
                className="action-button-skin media-button"
                onClick={() => readyForPickup(this.props.media.id, 'pickup')}
              >
                Ready For Pickup
              </button>
            )}
          {admin &&
            this.props.category === 'allRequests' &&
            this.props.media.checkedOutBy && (
              <button
                className="action-button-skin media-button"
                onClick={() =>
                  returnMedia(
                    this.props.media.id,
                    this.props.media.checkedOutBy.id
                  )
                }
              >
                Cancel Request
              </button>
            )}
          {admin &&
            this.props.category === 'allCheckedOutMedia' &&
            this.props.media.checkedOutBy && (
              <button
                className="action-button-skin media-button"
                onClick={() =>
                  returnMedia(
                    this.props.media.id,
                    this.props.media.checkedOutBy.id
                  )
                }
              >
                Return Media
              </button>
            )}
          {!admin &&
            (this.props.category === 'myCheckedOutMedia' ||
              this.props.category === 'myOverdueMedia') &&
            !this.props.media.renewals &&
            this.props.media.dueDate && (
              <button
                onClick={() => renew(this.props.media.id)}
                className="action-button-skin media-button"
              >
                Renew
              </button>
            )}
        </section>
      </article>
    );
  }
}
