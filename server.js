// // server.js - Complete debug version
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// const PORT = process.env.PORT || 5000;

// // Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => {
//   console.log('✅ MongoDB connected');
//   console.log('🔗 Database name:', mongoose.connection.db.databaseName);
// })
// .catch(err => console.error('❌ MongoDB connection error:', err));

// // Debug route to list all collections
// app.get('/debug/collections', async (req, res) => {
//   try {
//     const collections = await mongoose.connection.db.listCollections().toArray();
//     console.log('📋 Available collections:', collections.map(c => c.name));
//     res.json({
//       database: mongoose.connection.db.databaseName,
//       collections: collections.map(c => c.name)
//     });
//   } catch (err) {
//     console.error('❌ Error listing collections:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Debug route to check raw collection data
// app.get('/debug/raw/:collectionName', async (req, res) => {
//   try {
//     const { collectionName } = req.params;
//     const collection = mongoose.connection.db.collection(collectionName);
//     const docs = await collection.find({}).toArray();
    
//     console.log(`📦 Documents in ${collectionName}:`, docs.length);
//     if (docs.length > 0) {
//       console.log('📦 First document structure:', Object.keys(docs[0]));
//     }
    
//     res.json({
//       collection: collectionName,
//       count: docs.length,
//       documents: docs,
//       firstDocKeys: docs.length > 0 ? Object.keys(docs[0]) : []
//     });
//   } catch (err) {
//     console.error('❌ Error fetching raw data:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Test multiple possible collection names
// app.get('/debug/test-collections', async (req, res) => {
//   try {
//     const possibleNames = ['adventures', 'adventure', 'Adventure', 'moodSpaceAdventures'];
//     const results = {};
    
//     for (const name of possibleNames) {
//       try {
//         const collection = mongoose.connection.db.collection(name);
//         const count = await collection.countDocuments();
//         results[name] = count;
//         console.log(`📊 Collection '${name}': ${count} documents`);
//       } catch (err) {
//         results[name] = `Error: ${err.message}`;
//       }
//     }
    
//     res.json(results);
//   } catch (err) {
//     console.error('❌ Error testing collections:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Adventure model with flexible schema
// const adventureSchema = new mongoose.Schema({
//   adventures: {
//     type: mongoose.Schema.Types.Mixed,
//     default: {}
//   }
// }, {
//   collection: 'adventures',
//   strict: false,
//   versionKey: false
// });

// const Adventure = mongoose.model('Adventure', adventureSchema, 'adventures');

// // Test different models with different collection names
// const models = {
//   adventures: mongoose.model('Adventure1', adventureSchema, 'adventures'),
//   adventure: mongoose.model('Adventure2', adventureSchema, 'adventure'),
//   Adventure: mongoose.model('Adventure3', adventureSchema, 'Adventure'),
//   moodSpaceAdventures: mongoose.model('Adventure4', adventureSchema, 'moodSpaceAdventures')
// };

// // Test all possible models
// app.get('/debug/test-models', async (req, res) => {
//   try {
//     const results = {};
    
//     for (const [name, model] of Object.entries(models)) {
//       try {
//         const docs = await model.find({});
//         results[name] = {
//           count: docs.length,
//           hasData: docs.length > 0,
//           firstDocKeys: docs.length > 0 ? Object.keys(docs[0].toObject()) : []
//         };
//         console.log(`📊 Model '${name}': ${docs.length} documents`);
//       } catch (err) {
//         results[name] = { error: err.message };
//       }
//     }
    
//     res.json(results);
//   } catch (err) {
//     console.error('❌ Error testing models:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Database connection info
// app.get('/debug/connection', (req, res) => {
//   res.json({
//     readyState: mongoose.connection.readyState,
//     readyStateText: {
//       0: 'disconnected',
//       1: 'connected',
//       2: 'connecting',
//       3: 'disconnecting'
//     }[mongoose.connection.readyState],
//     host: mongoose.connection.host,
//     port: mongoose.connection.port,
//     name: mongoose.connection.name,
//     databaseName: mongoose.connection.db?.databaseName,
//     connectionString: process.env.MONGO_URI?.replace(/\/\/.*:.*@/, '//***:***@')
//   });
// });

// // Original adventures route (will work once we find the right collection)
// app.get('/adventures', async (req, res) => {
//   try {
//     const docs = await Adventure.find();
//     console.log('📦 Documents found:', docs.length);

//     if (!docs || docs.length === 0) {
//       return res.status(404).json({ 
//         error: 'No adventure documents found',
//         suggestion: 'Try /debug/test-models to find the correct collection'
//       });
//     }

//     console.log('📦 First document keys:', Object.keys(docs[0].toObject()));
    
//     let adventures;
//     if (docs[0].adventures && typeof docs[0].adventures === 'object') {
//       adventures = docs[0].adventures;
//     } else {
//       const docObj = docs[0].toObject();
//       delete docObj._id;
//       delete docObj.__v;
//       adventures = docObj;
//     }
    
//     res.json(adventures);
//   } catch (err) {
//     console.error('❌ Error fetching adventures:', err);
//     res.status(500).json({ 
//       error: 'Failed to fetch adventures',
//       details: err.message 
//     });
//   }
// });

// // Get adventures by mood
// app.get('/adventures/:mood', async (req, res) => {
//   try {
//     const { mood } = req.params;
//     const docs = await Adventure.find();
    
//     if (!docs || docs.length === 0) {
//       return res.status(404).json({ error: 'No adventures found' });
//     }

//     const adventures = docs[0].adventures || docs[0].toObject();
//     const moodAdventures = adventures[mood];
    
//     if (!moodAdventures) {
//       return res.status(404).json({ 
//         error: `No adventures found for mood: ${mood}`,
//         availableMoods: Object.keys(adventures)
//       });
//     }
    
//     res.json(moodAdventures);
//   } catch (err) {
//     console.error('❌ Error fetching mood adventures:', err);
//     res.status(500).json({ error: 'Failed to fetch mood adventures' });
//   }
// });

// // Root route with debug links
// app.get('/', (req, res) => {
//   res.json({
//     message: 'Adventure API Debug Server',
//     debugEndpoints: {
//       connection: `http://localhost:${PORT}/debug/connection`,
//       collections: `http://localhost:${PORT}/debug/collections`,
//       testCollections: `http://localhost:${PORT}/debug/test-collections`,
//       testModels: `http://localhost:${PORT}/debug/test-models`,
//       rawData: `http://localhost:${PORT}/debug/raw/COLLECTION_NAME`
//     },
//     mainEndpoints: {
//       adventures: `http://localhost:${PORT}/adventures`,
//       moodAdventures: `http://localhost:${PORT}/adventures/MOOD_NAME`
//     }
//   });
// });

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
//   console.log('🔍 Debug endpoints:');
//   console.log(`   - Connection: http://localhost:${PORT}/debug/connection`);
//   console.log(`   - Collections: http://localhost:${PORT}/debug/collections`);
//   console.log(`   - Test Collections: http://localhost:${PORT}/debug/test-collections`);
//   console.log(`   - Test Models: http://localhost:${PORT}/debug/test-models`);
//   console.log(`   - Raw Data: http://localhost:${PORT}/debug/raw/COLLECTION_NAME`);
// });



// server.js - Production version
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS configuration for production
const allowedOrigins = [
  'https://mood-space-ashonwebs-projects.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');
  console.log('🔗 Database name:', mongoose.connection.db.databaseName);
})
.catch(err => console.error('❌ MongoDB connection error:', err));

// Adventure model
const adventureSchema = new mongoose.Schema({
  adventures: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  collection: 'adventures',
  strict: false,
  versionKey: false
});

const Adventure = mongoose.model('Adventure', adventureSchema, 'adventures');

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Adventure API is running!',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      adventures: '/adventures',
      adventuresByMood: '/adventures/:mood'
    }
  });
});

// Health check for monitoring
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected nicely' : 'disconnected'
  });
});

// Get all adventures
app.get('/adventures', async (req, res) => {
  try {
    const docs = await Adventure.find();
    console.log('📦 Documents found:', docs.length);

    if (!docs || docs.length === 0) {
      return res.status(404).json({ 
        error: 'No adventure documents found'
      });
    }

    console.log('📦 First document keys:', Object.keys(docs[0].toObject()));
    
    let adventures;
    if (docs[0].adventures && typeof docs[0].adventures === 'object') {
      adventures = docs[0].adventures;
    } else {
      const docObj = docs[0].toObject();
      delete docObj._id;
      delete docObj.__v;
      adventures = docObj;
    }
    
    res.json({
      success: true,
      data: adventures,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('❌ Error fetching adventures:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch adventures',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// Get adventures by mood
app.get('/adventures/:mood', async (req, res) => {
  try {
    const { mood } = req.params;
    const docs = await Adventure.find();
    
    if (!docs || docs.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'No adventures found' 
      });
    }

    const adventures = docs[0].adventures || docs[0].toObject();
    const moodAdventures = adventures[mood];
    
    if (!moodAdventures) {
      return res.status(404).json({ 
        success: false,
        error: `No adventures found for mood: ${mood}`,
        availableMoods: Object.keys(adventures),
        suggestion: `Try one of: ${Object.keys(adventures).join(', ')}`
      });
    }
    
    res.json({
      success: true,
      mood: mood,
      data: moodAdventures,
      count: Array.isArray(moodAdventures) ? moodAdventures.length : 1,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('❌ Error fetching mood adventures:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch mood adventures',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// Get available moods
app.get('/moods', async (req, res) => {
  try {
    const docs = await Adventure.find();
    
    if (!docs || docs.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'No adventures found' 
      });
    }

    const adventures = docs[0].adventures || docs[0].toObject();
    const moods = Object.keys(adventures);
    
    res.json({
      success: true,
      moods: moods,
      count: moods.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('❌ Error fetching moods:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch moods',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});




/**
 * POST /adventures
 * Save a new adventure entry to the database.
 * Expects: {
 *   moodId, adventureTitle, locationAndDirection, city, state, updatedAt
 * }
 */
/**
 * PUT /adventures/:moodId/:adventureTitle
 * Update an existing adventure's locationAndDirection
 */
app.put('/adventures/:moodId/:adventureTitle', async (req, res) => {
  try {
    const { moodId, adventureTitle } = req.params;
    const { locationAndDirection } = req.body;

    if (!locationAndDirection) {
      return res.status(400).json({
        success: false,
        error: 'locationAndDirection is required'
      });
    }

    // Find the document
    const doc = await Adventure.findOne();
    if (!doc) {
      return res.status(404).json({
        success: false,
        error: 'No adventures document found'
      });
    }

    // Check if mood exists
    if (!doc.adventures[moodId]) {
      return res.status(404).json({
        success: false,
        error: `Mood '${moodId}' not found`
      });
    }

    // Find the adventure to update
    const adventureIndex = doc.adventures[moodId].findIndex(
      adventure => adventure.adventureTitle === adventureTitle
    );

    if (adventureIndex === -1) {
      return res.status(404).json({
        success: false,
        error: `Adventure '${adventureTitle}' not found in mood '${moodId}'`
      });
    }

    // Get current adventures object
    const currentAdventures = doc.adventures;
    
    // Update only the locationAndDirection field
    currentAdventures[moodId][adventureIndex].locationAndDirection = locationAndDirection;
    currentAdventures[moodId][adventureIndex].updatedAt = new Date().toISOString();

    // Use set() to ensure Mongoose detects the change
    doc.set('adventures', currentAdventures);
    await doc.save();

    const updatedAdventure = currentAdventures[moodId][adventureIndex];

    console.log('✅ Adventure updated:', updatedAdventure.adventureTitle);
    console.log('📍 New locationAndDirection count:', locationAndDirection.length);

    res.json({
      success: true,
      message: 'Adventure updated successfully',
      data: updatedAdventure
    });

  } catch (err) {
    console.error('❌ Error updating adventure:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update adventure',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

/**
 * Alternative: PUT /adventures/update
 * Update adventure by sending moodId and adventureTitle in body
 */
app.put('/adventures/update', async (req, res) => {
  try {
    const { moodId, title, locationAndDirection,location } = req.body;

    if (!moodId || !title || !locationAndDirection) {
      return res.status(400).json({
        success: false,
        error: 'moodId, adventureTitle, and locationAndDirection are required'
      });
    }

    // Find the document
    const doc = await Adventure.findOne();
    if (!doc) {
      return res.status(404).json({
        success: false,
        error: 'No adventures document found'
      });
    }

    // Check if mood exists
    if (!doc.adventures[moodId]) {
      return res.status(404).json({
        success: false,
        error: `Mood '${moodId}' not found`
      });
    }

    // Find the adventure to update
    const adventureIndex = doc.adventures[moodId].findIndex(
      adventure => adventure.title === title
    );

    if (adventureIndex === -1) {
      return res.status(404).json({
        success: false,
        error: `Adventure '${title}' not found in mood '${moodId}'`
      });
    }

    // Get current adventures object
    const currentAdventures = doc.adventures;
    
    // Update only the locationAndDirection field
    currentAdventures[moodId][adventureIndex].location = location;

    currentAdventures[moodId][adventureIndex].locationAndDirection = locationAndDirection;
    currentAdventures[moodId][adventureIndex].updatedAt = new Date().toISOString();

    // Use set() to ensure Mongoose detects the change
    doc.set('adventures', currentAdventures);
    await doc.save();

    const updatedAdventure = currentAdventures[moodId][adventureIndex];

    console.log('✅ Adventure updated:', updatedAdventure.title);
    console.log('📍 New locationAndDirection count:', locationAndDirection.length);

    res.json({
      success: true,
      message: 'Adventure updated successfully',
      data: updatedAdventure
    });

  } catch (err) {
    console.error('❌ Error updating adventure:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update adventure',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});
// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    availableRoutes: ['/', '/health', '/adventures', '/adventures/:mood', '/moods']
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('📦 MongoDB connection closed.');
    process.exit(0);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Export for serverless deployment
module.exports = app;