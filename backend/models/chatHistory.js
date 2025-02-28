import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    enum: ['segment', 'mparticle', 'lytics', 'zeotap', 'all'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

export default ChatHistory;