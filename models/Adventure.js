// models/Adventure.js
const mongoose = require('mongoose');

const adventureSchema = new mongoose.Schema({
  adventures: {
    type: mongoose.Schema.Types.Mixed, // Allow any type of data
    default: {}
  }
}, {
  collection: 'adventures', // Explicit collection name
  strict: false, // Allow flexible schema
  versionKey: false // Remove __v field
});

// Export with explicit collection name
module.exports = mongoose.model('Adventure', adventureSchema, 'adventures');