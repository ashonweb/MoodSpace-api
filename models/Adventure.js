const mongoose = require('mongoose');

const adventureItemSchema = new mongoose.Schema({
  moodId: { type: String, required: true },
  title: { type: String, required: true },
  locationAndDirection: { type: String, required: true },
  location: String,
});

const adventureSchema = new mongoose.Schema({
  adventures: {
    type: Map,
    of: [adventureItemSchema],
    default: new Map()
  }
}, {
  collection: 'adventures',
  versionKey: false,
  minimize: false // Ensure empty objects are saved
});

module.exports = mongoose.model('Adventure', adventureSchema, 'adventures');