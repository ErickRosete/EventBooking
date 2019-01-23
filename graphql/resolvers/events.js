const Event = require("../../models/event");
const User = require("../../models/user");

const { transformEvent } = require("./merge");

module.exports = {
  events: async () => {
    try {
      events = await Event.find();
      return events.map(event => {
        return transformEvent(event);
      });
    } catch (err) {
      throw err;
    }
  },

  createEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated");
    }

    const event = Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: req.userId
    });

    try {
      const result = await event.save();
      const user = await User.findById(req.userId);
      if (!user) {
        throw new Error("User not found");
      }
      user.createdEvents.push(event);
      await user.save();

      return transformEvent(result);
    } catch (err) {
      throw err;
    }
  }
};
