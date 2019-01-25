import React, { Component } from "react";

import Modal from "../components/Modal/Modal";
import Backdrop from "../components/Backdrop/Backdrop";
import AuthContext from "../context/auth-context";

import "./Events.css";

class EventsPage extends Component {
  state = {
    creating: false,
    events: []
  };

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.titleEl = React.createRef();
    this.priceEl = React.createRef();
    this.dateEl = React.createRef();
    this.descriptionEl = React.createRef();
  }

  componentDidMount() {
    this.fetchEvents();
  }

  startCreateEventHandler = () => {
    this.setState({
      creating: true
    });
  };

  modalCancelHandler = () => {
    this.setState({
      creating: false
    });
  };

  modalConfirmHandler = () => {
    this.setState({
      creating: false
    });
    const title = this.titleEl.current.value;
    const price = +this.priceEl.current.value;
    const description = this.descriptionEl.current.value;
    const date = this.dateEl.current.value;

    if (
      title.trim().length === 0 ||
      price <= 0 ||
      description.trim().length === 0 ||
      date.trim().length === 0
    ) {
      return;
    }

    const requestBody = {
      query: `
        mutation {
          createEvent(eventInput: {title: "${title}", description: "${description}", price: ${price}, date: "${date}"}) {
            _id
            title
            description
            price
            date
            creator {
              _id
              email
            }
          }
        }
      `
    };

    const token = this.context.token;

    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then(resData => {
        this.fetchEvents();
      })
      .catch(err => {
        console.log(err);
      });
  };

  fetchEvents() {
    const requestBody = {
      query: `
        {
          events{
            _id
            title
            description
            price
            date
          }
        }
      `
    };
    fetch("http://localhost:8000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then(resData => {
        const events = resData.data.events;
        this.setState({ events });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    const eventsList = this.state.events.map(event => {
      return (
        <li key={event._id} className="events__list-item">
          {event.title}
        </li>
      );
    });

    return (
      <React.Fragment>
        {this.state.creating && (
          <React.Fragment>
            <Backdrop />
            <Modal
              title="Add Event"
              onCancel={this.modalCancelHandler}
              onConfirm={this.modalConfirmHandler}
              canCancel
              canConfirm
            >
              <form>
                <div className="form-control">
                  <label htmlFor="title">Title</label>
                  <input type="text" id="title" ref={this.titleEl} />
                </div>

                <div className="form-control">
                  <label htmlFor="Price">Price</label>
                  <input type="number" id="Price" ref={this.priceEl} />
                </div>

                <div className="form-control">
                  <label htmlFor="date">Date</label>
                  <input type="datetime-local" id="date" ref={this.dateEl} />
                </div>

                <div className="form-control">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    rows="4"
                    ref={this.descriptionEl}
                  />
                </div>
              </form>
            </Modal>
          </React.Fragment>
        )}

        {this.context.token && (
          <div className="events-control">
            <p>Share your own events!</p>
            <button onClick={this.startCreateEventHandler} className="btn">
              Create Event
            </button>
          </div>
        )}

        <ul className="events__list">{eventsList}</ul>
      </React.Fragment>
    );
  }
}

export default EventsPage;
