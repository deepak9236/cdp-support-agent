import axios from 'axios';
import cheerio from 'cheerio';

// Function to scrape and process a documentation page
const processDocPage = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Extract the title
    const title = $('h1').first().text().trim() || $('title').text().trim();
    
    // Extract the content
    let content = '';
    $('p, li, h2, h3, h4').each((_, element) => {
      const text = $(element).text().trim();
      if (text) {
        content += text + ' ';
      }
    });
    
    // Extract any structured data like code examples, tables, etc.
    const codeExamples = [];
    $('pre, code').each((_, element) => {
      const code = $(element).text().trim();
      if (code) {
        codeExamples.push(code);
      }
    });
    
    // Extract any steps or numbered lists
    const steps = [];
    $('ol li').each((_, element) => {
      const step = $(element).text().trim();
      if (step) {
        steps.push(step);
      }
    });
    
    return {
      title,
      content,
      codeExamples,
      steps,
      url
    };
  } catch (error) {
    console.error(`Error processing page ${url}:`, error);
    return null;
  }
};

// Function to extract the platform from URL
const extractPlatformFromUrl = (url) => {
  if (url.includes('segment.com')) {
    return 'segment';
  } else if (url.includes('mparticle.com')) {
    return 'mparticle';
  } else if (url.includes('lytics.com')) {
    return 'lytics';
  } else if (url.includes('zeotap.com')) {
    return 'zeotap';
  } else {
    return 'unknown';
  }
};

// Function to find and extract all internal links from a page
const extractInternalLinks = async (baseUrl, platform) => {
  try {
    const response = await axios.get(baseUrl);
    const $ = cheerio.load(response.data);
    
    const links = new Set();
    
    // Find all internal links
    $('a').each((_, element) => {
      const href = $(element).attr('href');
      
      if (href) {
        // Filter links based on platform
        if (platform === 'segment' && href.startsWith('/docs')) {
          links.add(`https://segment.com${href}`);
        } else if (platform === 'mparticle' && !href.startsWith('http')) {
          links.add(`https://docs.mparticle.com${href.startsWith('/') ? href : '/' + href}`);
        } else if (platform === 'lytics' && !href.startsWith('http')) {
          links.add(`https://docs.lytics.com${href.startsWith('/') ? href : '/' + href}`);
        } else if (platform === 'zeotap' && href.startsWith('/home')) {
          links.add(`https://docs.zeotap.com${href}`);
        }
      }
    });
    
    return Array.from(links);
  } catch (error) {
    console.error(`Error extracting links from ${baseUrl}:`, error);
    return [];
  }
};

export default {
  processDocPage,
  extractPlatformFromUrl,
  extractInternalLinks
};