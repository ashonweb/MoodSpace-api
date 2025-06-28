const app = express();
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