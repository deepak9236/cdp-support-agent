import axios from 'axios';
import * as cheerio from 'cheerio';
import Documentation from '../../models/documentation.js';

const SEGMENT_DOC_BASE_URL = 'https://segment.com/docs';

const fetchDocumentation = async () => {
  try {
    const response = await axios.get(`${SEGMENT_DOC_BASE_URL}/?ref=nav`);
    const $ = cheerio.load(response.data);
    
    const docLinks = [];
    $('a[href^="/docs/"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href && !docLinks.includes(href) && !href.includes('#')) {
        docLinks.push(href);
      }
    });
    
    const docsToProcess = docLinks.slice(0, 10);
    
    for (const link of docsToProcess) {
      await processDocumentationPage(`https://segment.com${link}`, 'segment');
    }
    
    console.log(`Processed ${docsToProcess.length} Segment documentation pages`);
    return true;
  } catch (error) {
    console.error('Error fetching Segment documentation:', error);
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

const extractKeywords = (title, content) => {
  const text = `${title} ${content}`.toLowerCase();
  
  const stopWords = [
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
    'by', 'about', 'as', 'into', 'like', 'through', 'after', 'over', 'between',
    'out', 'against', 'during', 'without', 'before', 'under', 'around', 'among'
  ];
  
  const words = text.split(/\W+/)
    .filter(word => word.length > 3) 
    .filter(word => !stopWords.includes(word)) 
    .filter(word => !parseInt(word)); 
  
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
};

const searchDocumentation = async (query) => {
  try {
    const searchString = query.toLowerCase();
    
    const docs = await Documentation.find(
      { 
        platform: 'segment',
        $text: { $search: searchString } 
      },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(5);
    
    return docs;
  } catch (error) {
    console.error('Error searching Segment documentation:', error);
    throw error;
  }
};

export default { fetchDocumentation, searchDocumentation };