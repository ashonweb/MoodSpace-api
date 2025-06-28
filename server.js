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
const LocationAndDirection = require('./models/locationAndDirection'); // Adjust path as needed

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
    const { moodId, title, locationAndDirection, location } = req.body;

    // Validation
    if (!moodId || !title || !locationAndDirection) {
      return res.status(400).json({
        success: false,
        error: 'moodId, title, and locationAndDirection are required'
      });
    }

    // Validate locationAndDirection is an array
    if (!Array.isArray(locationAndDirection)) {
      return res.status(400).json({
        success: false,
        error: 'locationAndDirection must be an array'
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

    // Use markModified to ensure Mongoose tracks changes in deeply nested structures
    doc.adventures[moodId][adventureIndex].locationAndDirection = locationAndDirection;
    doc.adventures[moodId][adventureIndex].updatedAt = new Date().toISOString();
    if (location) {
      doc.adventures[moodId][adventureIndex].location = location;
    }

    doc.markModified(`adventures.${moodId}.${adventureIndex}`);
    await doc.save();

    const updatedAdventure = doc.adventures[moodId][adventureIndex];

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



/**
 * GET /adventures/locationAndDirection
 * Query params: moodId, title, city, state
 * Returns the locationAndDirection array for the specified adventure
 */
// app.get('/locationAndDirection', async (req, res) => {
//   try {
//     const { moodId, title, city, state } = req.query;

//     // Find the document
//     const doc = await Adventure.findOne();
//     if (!doc) {
//       return res.status(404).json({
//         success: false,
//         error: 'No adventures document found'
//       });
//     }

//     // If no query parameters provided, return everything
//     if (!moodId && !title && !city && !state) {
//       console.log('📋 Returning all adventures');
      
//       // Count total adventures across all moods
//       let totalCount = 0;
//       const moodSummary = {};
      
//       Object.keys(doc.adventures).forEach(mood => {
//         const count = doc.adventures[mood].length;
//         moodSummary[mood] = count;
//         totalCount += count;
//       });

//       return res.json({
//         success: true,
//         message: 'All adventures retrieved successfully',
//         totalAdventures: totalCount,
//         moodSummary: moodSummary,
//         data: doc.adventures
//       });
//     }

//     // If any query parameter is missing when trying to get specific adventure
//     if (!moodId || !title || !city || !state) {
//       return res.status(400).json({
//         success: false,
//         error: 'For specific adventure lookup, all query parameters are required: moodId, title, city, and state',
//         provided: { moodId, title, city, state },
//         missing: [
//           !moodId && 'moodId',
//           !title && 'title', 
//           !city && 'city',
//           !state && 'state'
//         ].filter(Boolean)
//       });
//     }

//     console.log(`🔍 Looking for specific adventure:`);
//     console.log(`  - Mood: '${moodId}'`);
//     console.log(`  - Title: '${title}'`);
//     console.log(`  - City: '${city}'`);
//     console.log(`  - State: '${state}'`);

//     // Check if mood exists
//     const moodAdventures = doc.adventures[moodId];
//     if (!moodAdventures) {
//       return res.status(404).json({
//         success: false,
//         error: `Mood '${moodId}' not found`,
//         availableMoods: Object.keys(doc.adventures)
//       });
//     }

//     console.log(`📊 Found ${moodAdventures.length} adventures in mood '${moodId}'`);

//     // Find the adventure with flexible matching
//     let adventure = null;
//     let matchType = null;

//     // Try exact match first
//     adventure = moodAdventures.find(adv => {
//       const titleMatch = (adv.title === title || adv.adventureTitle === title);
//       const cityMatch = adv.city === city;
//       const stateMatch = adv.state === state;
      
//       if (titleMatch && cityMatch && stateMatch) {
//         matchType = 'exact';
//         return true;
//       }
//       return false;
//     });

//     // Try case-insensitive match
//     if (!adventure) {
//       adventure = moodAdventures.find(adv => {
//         const titleMatch = (
//           (adv.title && adv.title.toLowerCase() === title.toLowerCase()) ||
//           (adv.adventureTitle && adv.adventureTitle.toLowerCase() === title.toLowerCase())
//         );
//         const cityMatch = adv.city && adv.city.toLowerCase() === city.toLowerCase();
//         const stateMatch = adv.state && adv.state.toLowerCase() === state.toLowerCase();
        
//         if (titleMatch && cityMatch && stateMatch) {
//           matchType = 'case-insensitive';
//           return true;
//         }
//         return false;
//       });
//     }

//     // Try matching with location field as well (since POST uses both city and location)
//     if (!adventure) {
//       adventure = moodAdventures.find(adv => {
//         const titleMatch = (
//           (adv.title && adv.title.toLowerCase() === title.toLowerCase()) ||
//           (adv.adventureTitle && adv.adventureTitle.toLowerCase() === title.toLowerCase())
//         );
//         const locationMatch = (
//           (adv.city && adv.city.toLowerCase() === city.toLowerCase()) ||
//           (adv.location && adv.location.toLowerCase() === city.toLowerCase())
//         );
//         const stateMatch = adv.state && adv.state.toLowerCase() === state.toLowerCase();
        
//         if (titleMatch && locationMatch && stateMatch) {
//           matchType = 'flexible-location';
//           return true;
//         }
//         return false;
//       });
//     }

//     if (!adventure) {
//       // Provide helpful debugging information
//       const suggestions = moodAdventures
//         .filter(adv => 
//           (adv.city && adv.city.toLowerCase().includes(city.toLowerCase())) ||
//           (adv.location && adv.location.toLowerCase().includes(city.toLowerCase())) ||
//           (adv.state && adv.state.toLowerCase() === state.toLowerCase())
//         )
//         .slice(0, 3)
//         .map(adv => ({
//           title: adv.title || adv.adventureTitle,
//           city: adv.city,
//           location: adv.location,
//           state: adv.state
//         }));

//       return res.status(404).json({
//         success: false,
//         error: `Adventure not found for title '${title}', city '${city}', state '${state}' in mood '${moodId}'`,
//         searchCriteria: { moodId, title, city, state },
//         totalAdventuresInMood: moodAdventures.length,
//         suggestions: suggestions.length > 0 ? suggestions : 'No similar adventures found'
//       });
//     }

//     console.log(`✅ Found adventure using ${matchType} match`);

//     res.json({
//       success: true,
//       message: 'Adventure found successfully',
//       matchType: matchType,
//       data: adventure
//     });

//   } catch (err) {
//     console.error('❌ Error fetching locationAndDirection:', err);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch locationAndDirection',
//       message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//     });
//   }
// });


// app.post('/locationAndDirection', async (req, res) => {
//   try {
//     const { moodId, title, city, state, location, locationAndDirection } = req.body;
    
//     // Validate required fields
//     if (!moodId || !title || !city || !state || !location || !locationAndDirection) {
//       return res.status(400).json({
//         success: false,
//         error: 'moodId, title, city, state, location, and locationAndDirection are required'
//       });
//     }

//     if (!Array.isArray(locationAndDirection)) {
//       return res.status(400).json({
//         success: false,
//         error: 'locationAndDirection must be an array'
//       });
//     }

//     // Find the document or create one if it doesn't exist
//     let doc = await Adventure.findOne();
//     if (!doc) {
//       console.log('📝 Creating new adventures document');
//       doc = new Adventure({ adventures: {} });
//     }

//     // Initialize mood array if it doesn't exist
//     if (!doc.adventures[moodId]) {
//       console.log(`📝 Creating new mood: ${moodId}`);
//       doc.adventures[moodId] = [];
//     }

//     const moodAdventures = doc.adventures[moodId];

//     console.log(`🔍 Searching for adventure in mood '${moodId}':`);
//     console.log(`  - Title: '${title}'`);
//     console.log(`  - City: '${city}'`);
//     console.log(`  - State: '${state}'`);
//     console.log(`  - Total adventures in mood: ${moodAdventures.length}`);

//     // Try to find existing adventure with flexible matching
//     let adventureIndex = -1;
//     let matchDetails = {};

//     // Try exact match first
//     adventureIndex = moodAdventures.findIndex(adv => {
//       const titleMatch = (adv.title === title || adv.adventureTitle === title);
//       const locationMatch = adv.location === city;
//       const stateMatch = adv.state === state;
      
//       if (titleMatch && locationMatch && stateMatch) {
//         matchDetails = { type: 'exact', titleField: adv.title ? 'title' : 'adventureTitle' };
//         return true;
//       }
//       return false;
//     });

//     // If no exact match, try case-insensitive search
//     if (adventureIndex === -1) {
//       adventureIndex = moodAdventures.findIndex(adv => {
//         const titleMatch = (
//           (adv.title && adv.title.toLowerCase() === title.toLowerCase()) ||
//           (adv.adventureTitle && adv.adventureTitle.toLowerCase() === title.toLowerCase())
//         );
//         const locationMatch = adv.location && adv.location.toLowerCase() === city.toLowerCase();
//         const stateMatch = adv.state && adv.state.toLowerCase() === state.toLowerCase();
        
//         if (titleMatch && locationMatch && stateMatch) {
//           matchDetails = { type: 'case-insensitive', titleField: adv.title ? 'title' : 'adventureTitle' };
//           return true;
//         }
//         return false;
//       });
//     }

//     let isNewAdventure = false;

//     if (adventureIndex === -1) {
//       // Adventure doesn't exist, create a new one
//       console.log('📝 Adventure not found, creating new adventure');
      
//       const newAdventure = {
//         title: title,
//         location: location,
//         city: city,
//         state: state,
//         locationAndDirection: locationAndDirection,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString()
//       };

//       // Add the new adventure to the mood array
//       moodAdventures.push(newAdventure);
//       adventureIndex = moodAdventures.length - 1;
//       isNewAdventure = true;
      
//       console.log(`✅ Created new adventure at index ${adventureIndex}`);
//     } else {
//       // Adventure exists, update it
//       console.log(`✅ Found existing adventure at index ${adventureIndex} using ${matchDetails.type} match`);
      
//       // Update locationAndDirection and updatedAt
//       moodAdventures[adventureIndex].locationAndDirection = locationAndDirection;
//       moodAdventures[adventureIndex].updatedAt = new Date().toISOString();
//       moodAdventures[adventureIndex].location = location;
//     }

//     // Mark the document as modified and save
//     doc.markModified(`adventures.${moodId}`);
//     await doc.save();

//     console.log(`✅ Adventure ${isNewAdventure ? 'created' : 'updated'} successfully`);

//     res.json({
//       success: true,
//       message: `Adventure ${isNewAdventure ? 'created' : 'updated'} successfully`,
//       isNewAdventure: isNewAdventure,
//       matchType: isNewAdventure ? 'new' : matchDetails.type,
//       data: moodAdventures[adventureIndex]
//     });

//   } catch (err) {
//     console.error('❌ Error saving/updating adventure:', err);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to save/update adventure',
//       message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//     });
//   }
// });

// Import your model (assuming it's named LocationAndDirection)

// POST endpoint - Save or update location and direction data
app.post('/locationAndDirection', async (req, res) => {
  try {
    const { moodId, title, city, state, location, locationAndDirection, searchQuery } = req.body;
    
    // Validate required fields
    if (!moodId || !title || !state || !location || !locationAndDirection) {
      return res.status(400).json({
        success: false,
        error: 'moodId, title, state, location, and locationAndDirection are required'
      });
    }

    if (!Array.isArray(locationAndDirection)) {
      return res.status(400).json({
        success: false,
        error: 'locationAndDirection must be an array'
      });
    }

    if (locationAndDirection.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one location must be provided'
      });
    }

    console.log(`🔍 Searching for existing document:`);
    console.log(`  - MoodId: '${moodId}'`);
    console.log(`  - Title: '${title}'`);
    console.log(`  - Location: '${location}'`);
    console.log(`  - State: '${state}'`);

    // Try to find existing document with flexible matching
    let existingDoc = null;

    // Try exact match first
    existingDoc = await LocationAndDirection.findOne({
      moodId: moodId,
      title: title,
      location: location,
      state: state
    });

    // Try case-insensitive match if no exact match
    if (!existingDoc) {
      existingDoc = await LocationAndDirection.findOne({
        moodId: new RegExp(`^${moodId}$`, 'i'),
        title: new RegExp(`^${title}$`, 'i'),
        location: new RegExp(`^${location}$`, 'i'),
        state: new RegExp(`^${state}$`, 'i')
      });
    }

    let isNewDocument = false;
    let result;

    if (!existingDoc) {
      // Create new document
      console.log('📝 Creating new location document');
      
      const newDoc = new LocationAndDirection({
        moodId,
        title,
        state,
        location,
        locationAndDirection,
        searchQuery: searchQuery || '',
        metadata: {
          apiCallsMade: 1,
          lastApiCall: new Date(),
          usageCount: 1
        }
      });

      result = await newDoc.save();
      isNewDocument = true;
      
      console.log(`✅ Created new document with ID: ${result._id}`);
    } else {
      // Update existing document
      console.log(`✅ Found existing document with ID: ${existingDoc._id}`);
      
      existingDoc.locationAndDirection = locationAndDirection;
      existingDoc.location = location; // Update location if it changed
      if (searchQuery) existingDoc.searchQuery = searchQuery;
      
      // Update metadata
      existingDoc.metadata.apiCallsMade += 1;
      existingDoc.metadata.lastApiCall = new Date();
      existingDoc.metadata.usageCount += 1;

      result = await existingDoc.save();
    }

    console.log(`✅ Document ${isNewDocument ? 'created' : 'updated'} successfully`);

    res.json({
      success: true,
      message: `Location and direction ${isNewDocument ? 'created' : 'updated'} successfully`,
      isNewDocument,
      data: result
    });

  } catch (err) {
    console.error('❌ Error saving/updating location and direction:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to save/update location and direction',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// GET endpoint - Retrieve location and direction data
app.get('/locationAndDirection', async (req, res) => {
  try {
    const { moodId, title, location, state, limit, page } = req.query;

    // If no query parameters provided, return all documents
    if (!moodId && !title && !location && !state) {
      console.log('📋 Returning all location documents');
      
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 50;
      const skip = (pageNum - 1) * limitNum;

      const [documents, totalCount] = await Promise.all([
        LocationAndDirection.find({})
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        LocationAndDirection.countDocuments({})
      ]);

      // Group by mood for summary
      const moodSummary = {};
      documents.forEach(doc => {
        moodSummary[doc.moodId] = (moodSummary[doc.moodId] || 0) + 1;
      });

      return res.json({
        success: true,
        message: 'All location documents retrieved successfully',
        totalCount,
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        moodSummary,
        data: documents
      });
    }

    // Build search criteria
    const searchCriteria = {};
    if (moodId) searchCriteria.moodId = new RegExp(`^${moodId}$`, 'i');
    if (title) searchCriteria.title = new RegExp(`^${title}$`, 'i');
    if (location) searchCriteria.location = new RegExp(`^${location}$`, 'i');
    if (state) searchCriteria.state = new RegExp(`^${state}$`, 'i');

    console.log(`🔍 Searching with criteria:`, searchCriteria);

    const documents = await LocationAndDirection.find(searchCriteria)
      .sort({ updatedAt: -1 })
      .lean();

    if (documents.length === 0) {
      // Provide suggestions for similar documents
      const suggestions = await LocationAndDirection.find({
        $or: [
          location ? { location: new RegExp(location, 'i') } : {},
          state ? { state: new RegExp(`^${state}$`, 'i') } : {},
          moodId ? { moodId: new RegExp(`^${moodId}$`, 'i') } : {}
        ].filter(obj => Object.keys(obj).length > 0)
      })
      .select('moodId title location state')
      .limit(3)
      .lean();

      return res.status(404).json({
        success: false,
        error: 'No documents found matching the criteria',
        searchCriteria: { moodId, title, location, state },
        suggestions: suggestions.length > 0 ? suggestions : 'No similar documents found'
      });
    }

    console.log(`✅ Found ${documents.length} document(s)`);

    // If searching for specific document (all params provided), return single result
    if (moodId && title && location && state && documents.length === 1) {
      return res.json({
        success: true,
        message: 'Document found successfully',
        data: documents[0]
      });
    }

    // Return multiple results
    res.json({
      success: true,
      message: `Found ${documents.length} document(s)`,
      count: documents.length,
      data: documents
    });

  } catch (err) {
    console.error('❌ Error fetching location and direction:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch location and direction',
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