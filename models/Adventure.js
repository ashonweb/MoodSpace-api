const mongoose = require('mongoose');


// Schema for individual location items within locationAndDirection
const locationItemSchema = new mongoose.Schema({
  address: String,
  gettingThere: String,
  parking: String,
  category: String,
  searchTerm: String,
  coordinates: {
    lat: Number,
    lng: Number
  }
}, { _id: false });

// Schema for individual adventure items
const adventureItemSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Changed from adventureTitle to title
  locationAndDirection: [locationItemSchema], // Array of location objects
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