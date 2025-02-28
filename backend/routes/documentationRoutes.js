import express from 'express';
import { 
  searchDocumentation, 
  getDocumentationByPlatform,
  addDocumentation,
  updateDocumentation
} from '../controllers/documentationController.js';

const router = express.Router();

// Search documentation across platforms
router.get('/search', searchDocumentation);

// Get documentation by platform
router.get('/platform/:platform', getDocumentationByPlatform);

// Add new documentation 
router.post('/', addDocumentation);

// Update documentation
router.put('/:id', updateDocumentation);

export default router;