import React, { Component } from "react";

import Modal from "../components/Modal/Modal";
import Backdrop from "../components/Backdrop/Backdrop";
import AuthContext from "../context/auth-context";
import EventList from "../components/Events/EventList/EventList";
import Spinner from "../components/Spinner/Spinner";

import "./Events.css";

class EventsPage extends Component {
  state = {
    creating: false,
    events: [],
    isLoading: false,
    selectedEvent: null
  };

  isActive = true;

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

  showDetailHandler = eventId => {
    const selectedEvent = this.state.events.find(
      event => event._id === eventId
    );
    this.setState({ selectedEvent });
  };

  startCreateEventHandler = () => {
    this.setState({
      creating: true
    });
  };

  modalCancelHandler = () => {
    this.setState({
      creating: false,
      selectedEvent: null
    });
  };

  bookEventHandler = () => {
    if (!this.context.token) {
      this.setState({
        selectedEvent: null
      });
      return;
    }
    // console.log(this.state.selectedEvent._id);
    const requestBody = {
      query: `
        mutation {
          bookEvent(eventId: "${this.state.selectedEvent._id}") {
            _id
            createdAt
            updatedAt
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
        console.log(resData.data);
        this.setState({
          selectedEvent: null
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          selectedEvent: null
        });
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
        const events = [...this.state.events];
        events.push({
          ...resData.data.createEvent,
          creator: { _id: this.context.userId }
        });
        this.setState({ events });
      })
      .catch(err => {
        console.log(err);
      });
  };

  fetchEvents() {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
        {
          events{
            _id
            title
            description
            price
            date
            creator {
              _id
            }
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
        if (this.isActive) {
          this.setState({ events, isLoading: false });
        }
      })
      .catch(err => {
        console.log(err);
        if (this.isActive) {
          this.setState({ isLoading: false });
        }
      });
  }

  componentWillUnmount() {
    this.isActive = false;
  }

  render() {
    return (
      <React.Fragment>
        {(this.state.creating || this.state.selectedEvent) && <Backdrop />}
        {this.state.creating && (
          <Modal
            title="Add Event"
            onCancel={this.modalCancelHandler}
            onConfirm={this.modalConfirmHandler}
            confirmText="Confirm"
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
                <textarea id="description" rows="4" ref={this.descriptionEl} />
              </div>
            </form>
          </Modal>
        )}
        {this.state.selectedEvent && (
          <Modal
            title={this.state.selectedEvent.title}
            onCancel={this.modalCancelHandler}
            onConfirm={this.bookEventHandler}
            confirmText={this.context.token ? "Book Event" : "Confirm"}
            canCancel
            canConfirm
          >
            <h2>
              ${this.state.selectedEvent.price} -{" "}
              {new Date(this.state.selectedEvent.date).toLocaleDateString()}
            </h2>
            <p>{this.state.selectedEvent.description}</p>
          </Modal>
        )}

        {this.context.token && (
          <div className="events-control">
            <p>Share your own events!</p>
            <button onClick={this.startCreateEventHandler} className="btn">
              Create Event
            </button>
          </div>
        )}

        {this.state.isLoading ? (
          <Spinner />
        ) : (
          <EventList
            events={this.state.events}
            authUserId={this.context.userId}
            onDetail={this.showDetailHandler}
          />
        )}
      </React.Fragment>
    );
  }
}

export default EventsPage;
