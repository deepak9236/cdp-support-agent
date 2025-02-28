// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatService = {
  sendMessage: async (message, sessionId = null) => {
    try {
      const response = await api.post('/chat', { message, sessionId });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
  
  getChatHistory: async (sessionId) => {
    try {
      const response = await api.get(`/chat/history/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  },
  
  createNewSession: async () => {
    try {
      const response = await api.post('/chat/session');
      return response.data;
    } catch (error) {
      console.error('Error creating new session:', error);
      throw error;
    }
  }
};

export const documentationService = {
  searchDocumentation: async (query, platform) => {
    try {
      const response = await api.get('/documentation/search', {
        params: { query, platform },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching documentation:', error);
      throw error;
    }
  },
  
  getPlatforms: async () => {
    try {
      const response = await api.get('/documentation/platforms');
      return response.data;
    } catch (error) {
      console.error('Error getting platforms:', error);
      throw error;
    }
  }
};

export default {
  chatService,
  documentationService
};