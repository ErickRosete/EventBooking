import React, { Component } from "react";
import AuthContext from "../context/auth-context";
import Spinner from "../components/Spinner/Spinner";

class BookingsPage extends Component {
  state = {
    bookings: [],
    isLoading: false
  };

  isActive = true;

  static contextType = AuthContext;

  componentDidMount() {
    this.fetchBookings();
  }

  fetchBookings = () => {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
        {
          bookings {
            _id
            event {
              _id
              title
              date
            }
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
        const bookings = resData.data.bookings;
        if (this.isActive) {
          this.setState({
            bookings: bookings,
            isLoading: false
          });
        }
      })
      .catch(err => {
        console.log(err);
        if (this.isActive) {
          this.setState({ isLoading: false });
        }
      });
  };

  componentWillUnmount() {
    this.isActive = false;
  }

  render() {
    return (
      <div className="bookings">
        <h1>This is the bookings page</h1>
        {this.state.isLoading ? (
          <Spinner />
        ) : (
          <ul>
            {this.state.bookings.map(booking => (
              <li key={booking._id}>
                {booking.event.title} -
                {new Date(booking.createdAt).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
}

export default BookingsPage;
