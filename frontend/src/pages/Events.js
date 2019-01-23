import React, { Component } from "react";

import "./Events.css";

import Modal from "../components/Modal/Modal";
import Backdrop from "../components/Backdrop/Backdrop";

class EventsPage extends Component {
  state = {
    creating: false
  }

  toggleCreateEventHandler = () => {
    this.setState({
      creating: !this.state.creating
    })
  }

  render() {
    return <React.Fragment>
      {this.state.creating && <React.Fragment>
        <Backdrop></Backdrop>
        <Modal title="Add Event" onCancel={this.toggleCreateEventHandler} onConfirm={this.toggleCreateEventHandler} canCancel canConfirm>
          <p>Modal Content</p>
        </Modal>
      </React.Fragment>
      }

      <div className="events-control">
        <p>Share your own events!</p>
        <button onClick={this.toggleCreateEventHandler} className="btn">Create Event</button>
      </div>
    </React.Fragment>;
  }
}

export default EventsPage;
