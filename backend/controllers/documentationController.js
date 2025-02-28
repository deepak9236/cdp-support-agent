import Documentation from '../models/documentation.js';

export const searchDocumentation = async (req, res) => {
  try {
    const { query, platform } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    let searchQuery = { $text: { $search: query } };
    
    if (platform) {
      searchQuery.platform = platform;
    }
    
    const results = await Documentation.find(searchQuery)
      .sort({ score: { $meta: 'textScore' } })
      .limit(10);
      
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error searching documentation:', error);
    return res.status(500).json({ message: 'Error searching documentation' });
  }
};

export const getDocumentationByPlatform = async (req, res) => {
  try {
    const { platform } = req.params;
    
    if (!['segment', 'mparticle', 'lytics', 'zeotap'].includes(platform)) {
      return res.status(400).json({ message: 'Invalid platform specified' });
    }
    
    const docs = await Documentation.find({ platform })
      .sort({ lastUpdated: -1 });
      
    return res.status(200).json(docs);
  } catch (error) {
    console.error('Error fetching documentation:', error);
    return res.status(500).json({ message: 'Error fetching documentation' });
  }
};

export const addDocumentation = async (req, res) => {
  try {
    const { platform, title, content, url, category, keywords } = req.body;
    
    if (!platform || !title || !content || !url || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const newDoc = new Documentation({
      platform,
      title,
      content,
      url,
      category,
      keywords: keywords || []
    });
    
    const savedDoc = await newDoc.save();
    return res.status(201).json(savedDoc);
  } catch (error) {
    console.error('Error adding documentation:', error);
    return res.status(500).json({ message: 'Error adding documentation' });
  }
};

export const updateDocumentation = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedDoc = await Documentation.findByIdAndUpdate(
      id,
      { ...updates, lastUpdated: Date.now() },
      { new: true }
    );
    
    if (!updatedDoc) {
      return res.status(404).json({ message: 'Documentation not found' });
    }
    
    return res.status(200).json(updatedDoc);
  } catch (error) {
    console.error('Error updating documentation:', error);
    return res.status(500).json({ message: 'Error updating documentation' });
  }
};