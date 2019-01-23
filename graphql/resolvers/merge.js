const Event = require("../../models/event");
const User = require("../../models/user");
const { dateToString } = require("../../helpers/date");

const transformEvent = event => {
  return {
    ...event._doc,
    date: dateToString(event._doc.date),
    creator: getUser.bind(this, event._doc.creator)
  };
};

const transformUser = user => {
  return {
    ...user._doc,
    password: null,
    createdEvents: getEvents.bind(this, user._doc.createdEvents)
  };
};

const transformBooking = booking => {
  return {
    ...booking._doc,
    event: getEvent.bind(this, booking._doc.event),
    user: getUser.bind(this, booking._doc.user),
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt)
  };
};

const getUser = async userId => {
  try {
    const user = await User.findById(userId);
    return transformUser(user);
  } catch (err) {
    throw err;
  }
};

const getEvent = async eventId => {
  try {
    const event = await Event.findById(eventId);
    return transformEvent(event);
  } catch (err) {
    throw err;
  }
};

const getEvents = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map(event => {
      return transformEvent(event);
    });
  } catch (err) {
    throw err;
  }
};

exports.getEvent = getEvent;
exports.getEvents = getEvents;
exports.getUser = getUser;
exports.transformBooking = transformBooking;
exports.transformEvent = transformEvent;
exports.transformUser = transformUser;
