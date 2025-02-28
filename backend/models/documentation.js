import mongoose from 'mongoose';

const documentationSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['segment', 'mparticle', 'lytics', 'zeotap']
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  keywords: [{
    type: String
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Create index for text search
documentationSchema.index({ 
  title: 'text', 
  content: 'text', 
  keywords: 'text' 
});

const Documentation = mongoose.model('Documentation', documentationSchema);

export default Documentation;