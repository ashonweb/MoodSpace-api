const mongoose = require('mongoose');

const adventureItemSchema = new mongoose.Schema({
  adventureTitle: { type: String, required: true },
  locationAndDirection: { type: String, required: true },
  city: String,
  state: String,
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { _id: false });

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