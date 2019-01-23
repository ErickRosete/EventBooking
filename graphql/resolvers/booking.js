const Booking = require("../../models/booking");
const { getEvent, transformBooking } = require("./merge");

module.exports = {
  bookings: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated");
    }
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return transformBooking(booking);
      });
    } catch (err) {
      throw err;
    }
  },

  bookEvent: async args => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated");
    }
    const booking = Booking({
      event: args.eventId,
      user: req.userId
    });
    try {
      const result = await booking.save();
      return transformBooking(result);
    } catch (err) {
      throw err;
    }
  },

  cancelBooking: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated");
    }
    try {
      const booking = await Booking.findByIdAndRemove(args.bookingId);
      return await getEvent(booking._doc.event);
    } catch (err) {
      throw err;
    }
  }
};
