import ChatHistory from '../models/chatHistory.js';
import { processUserQuery } from '../services/chatService.js';

export const processQuery = async (req, res) => {
  try {
    const { userId, query, platform } = req.body;
    
    if (!userId || !query) {
      return res.status(400).json({ message: 'User ID and query are required' });
    }
    
    const response = await processUserQuery(query, platform || 'all');
    
    const chatEntry = new ChatHistory({
      userId,
      question: query,
      response: response.answer,
      platform: platform || 'all'
    });
    
    await chatEntry.save();
    
    return res.status(200).json({
      answer: response.answer,
      sources: response.sources,
      platform: platform || 'all'
    });
    
  } catch (error) {
    console.error('Error processing query:', error);
    return res.status(500).json({ message: 'Error processing your query' });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await ChatHistory.find({ userId })
      .sort({ timestamp: -1 })
      .limit(50);
      
    return res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return res.status(500).json({ message: 'Error fetching chat history' });
  }
};

export const clearChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    await ChatHistory.deleteMany({ userId });
    
    return res.status(200).json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    return res.status(500).json({ message: 'Error clearing chat history' });
  }
};