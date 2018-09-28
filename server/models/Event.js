const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  key: String,
  chain: String,
  type: String,
  content: String,
});

const Event = mongoose.model('event', eventSchema);

module.exports = Event;
