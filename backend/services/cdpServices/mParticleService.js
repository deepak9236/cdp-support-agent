import axios from 'axios';
import * as cheerio from 'cheerio';
import Documentation from '../../models/documentation.js';

const MPARTICLE_DOC_BASE_URL = 'https://docs.mparticle.com';

const fetchDocumentation = async () => {
  try {
    const response = await axios.get(MPARTICLE_DOC_BASE_URL);
    const $ = cheerio.load(response.data);
    
    const docLinks = [];
    $('a[href^="/"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href && !docLinks.includes(href) && !href.includes('#') && href !== '/') {
        docLinks.push(href);
      }
    });
    
    const docsToProcess = docLinks.slice(0, 10);
    
    for (const link of docsToProcess) {
      await processDocumentationPage(`${MPARTICLE_DOC_BASE_URL}${link}`, 'mparticle');
    }
    
    console.log(`Processed ${docsToProcess.length} mParticle documentation pages`);
    return true;
  } catch (error) {
    console.error('Error fetching mParticle documentation:', error);
    return false;
  }
};

const processDocumentationPage = async (url, platform) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    const title = $('h1').first().text().trim();
    
    let content = '';
    $('article p, article li, article h2, article h3').each((_, element) => {
      const text = $(element).text().trim();
      if (text) {
        content += text + ' ';
      }
    });
    
    const urlParts = url.split('/');
    const category = urlParts[urlParts.length - 2] || 'general';
    
    const keywords = extractKeywords(title, content);
    
    const existingDoc = await Documentation.findOne({ url, platform });
    
    if (existingDoc) {
      existingDoc.title = title;
      existingDoc.content = content;
      existingDoc.category = category;
      existingDoc.keywords = keywords;
      existingDoc.lastUpdated = Date.now();
      await existingDoc.save();
    } else {
      const newDoc = new Documentation({
        platform,
        title,
        content,
        url,
        category,
        keywords
      });
      await newDoc.save();
    }
    
    return true;
  } catch (error) {
    console.error(`Error processing page ${url}:`, error);
    return false;
  }
};

// Extract keywords from title and content
const extractKeywords = (title, content) => {
  // Combine title and content
  const text = `${title} ${content}`.toLowerCase();
  
  // Common words to exclude
  const stopWords = [
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
    'by', 'about', 'as', 'into', 'like', 'through', 'after', 'over', 'between',
    'out', 'against', 'during', 'without', 'before', 'under', 'around', 'among'
  ];
  
  // Split into words and filter
  const words = text.split(/\W+/)
    .filter(word => word.length > 3) // Only words longer than 3 characters
    .filter(word => !stopWords.includes(word)) // Exclude stop words
    .filter(word => !parseInt(word)); // Exclude numbers
  
  // Count word frequencies
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Sort by frequency and take top 10
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
};

// Search for specific information in mParticle documentation
const searchDocumentation = async (query) => {
  try {
    // Create a search string from the query
    const searchString = query.toLowerCase();
    
    // Search the documentation collection
    const docs = await Documentation.find(
      { 
        platform: 'mparticle',
        $text: { $search: searchString } 
      },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(5);
    
    return docs;
  } catch (error) {
    console.error('Error searching mParticle documentation:', error);
    throw error;
  }
};

export default { fetchDocumentation, searchDocumentation };