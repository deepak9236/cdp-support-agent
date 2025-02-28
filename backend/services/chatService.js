import Documentation from '../models/documentation.js';
import segmentService from './cdpServices/segmentService.js';
import mParticleService from './cdpServices/mParticleService.js';
import lyticsService from './cdpServices/lyticsService.js';
import zeotapService from './cdpServices/zeotapService.js';
import natural from 'natural';

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

export const processUserQuery = async (query, platform) => {
  try {
    const processedQuery = preprocessQuery(query);
    
    if (!isRelevantToCDP(processedQuery)) {
      return {
        answer: "I'm sorry, but your question doesn't appear to be related to Customer Data Platforms (CDPs). I can help with questions about Segment, mParticle, Lytics, or Zeotap. Please ask a CDP-related question.",
        sources: []
      };
    }
    
    const platformToUse = determinePlatform(processedQuery, platform);
    
    if (isComparisonQuery(processedQuery)) {
      return handleComparisonQuery(processedQuery, platformToUse);
    }
    
    let relevantDocs;
    if (platformToUse === 'all') {
      relevantDocs = await searchAllPlatforms(processedQuery);
    } else {
      relevantDocs = await getPlatformSpecificDocs(platformToUse, processedQuery);
    }
    
    if (!relevantDocs || relevantDocs.length === 0) {
      return {
        answer: `I couldn't find specific information about "${query}" in the ${platformToUse === 'all' ? 'CDP documentation' : platformToUse + ' documentation'}. Please try rephrasing your question or ask about a different topic.`,
        sources: []
      };
    }
    
    const response = generateResponse(query, relevantDocs, platformToUse);
    
    return response;
  } catch (error) {
    console.error('Error processing user query:', error);
    throw new Error('Failed to process your query. Please try again.');
  }
};

const preprocessQuery = (query) => {
  const lowercased = query.toLowerCase();
  
  const tokens = tokenizer.tokenize(lowercased);
  
  const stemmed = tokens.map(token => stemmer.stem(token));
  
  return {
    original: query,
    lowercased,
    tokens,
    stemmed
  };
};

const isRelevantToCDP = (processedQuery) => {
  const cdpKeywords = [
    'segment', 'mparticle', 'lytics', 'zeotap', 'cdp', 'customer data', 'platform',
    'integration', 'source', 'destination', 'audience', 'profile', 'track', 'event',
    'data', 'analytics', 'user', 'identity', 'api', 'webhook'
  ];
  
  const hasRelevantWords = processedQuery.tokens.some(token => 
    cdpKeywords.includes(token) || 
    cdpKeywords.some(keyword => token.includes(keyword))
  );
  
  return hasRelevantWords;
};

const determinePlatform = (processedQuery, specifiedPlatform) => {
  if (specifiedPlatform && specifiedPlatform !== 'all') {
    return specifiedPlatform;
  }
  
  if (processedQuery.lowercased.includes('segment')) {
    return 'segment';
  } else if (processedQuery.lowercased.includes('mparticle') || 
             processedQuery.lowercased.includes('m particle')) {
    return 'mparticle';
  } else if (processedQuery.lowercased.includes('lytics')) {
    return 'lytics';
  } else if (processedQuery.lowercased.includes('zeotap')) {
    return 'zeotap';
  }
  
  return 'all';
};

const isComparisonQuery = (processedQuery) => {
  const comparisonKeywords = [
    'compare', 'comparison', 'versus', 'vs', 'difference', 'different',
    'better', 'best', 'worse', 'worst', 'similar', 'similarly'
  ];
  
  const hasComparisonWord = processedQuery.tokens.some(token => 
    comparisonKeywords.includes(token)
  );
  
  const platformsMentioned = [
    processedQuery.lowercased.includes('segment'),
    processedQuery.lowercased.includes('mparticle') || processedQuery.lowercased.includes('m particle'),
    processedQuery.lowercased.includes('lytics'),
    processedQuery.lowercased.includes('zeotap')
  ];
  
  const platformCount = platformsMentioned.filter(Boolean).length;
  
  return hasComparisonWord || platformCount >= 2;
};

const handleComparisonQuery = async (processedQuery, platforms) => {
  try {
    const featureKeywords = extractFeatureKeywords(processedQuery);
    
    const platformDocs = await Promise.all([
      getPlatformSpecificDocs('segment', { tokens: featureKeywords }),
      getPlatformSpecificDocs('mparticle', { tokens: featureKeywords }),
      getPlatformSpecificDocs('lytics', { tokens: featureKeywords }),
      getPlatformSpecificDocs('zeotap', { tokens: featureKeywords })
    ]);
    
    return generateComparisonResponse(processedQuery.original, platformDocs, featureKeywords);
  } catch (error) {
    console.error('Error handling comparison query:', error);
    throw new Error('Failed to process your comparison query. Please try again.');
  }
};

const extractFeatureKeywords = (processedQuery) => {
  const featureKeywords = [
    'audience', 'segment', 'integration', 'source', 'destination', 'tracking',
    'event', 'profile', 'identity', 'user', 'data', 'api', 'webhook', 'consent',
    'privacy', 'gdpr', 'ccpa', 'schema', 'mapping', 'transform', 'enrichment'
  ];
  
  const relevantFeatures = processedQuery.tokens.filter(token => 
    featureKeywords.includes(token) || 
    featureKeywords.some(keyword => token.includes(keyword))
  );
  
  return relevantFeatures.length > 0 ? relevantFeatures : ['general'];
};

const searchAllPlatforms = async (processedQuery) => {
  try {
    const searchString = processedQuery.tokens.join(' ');
    
    const docs = await Documentation.find(
      { $text: { $search: searchString } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(5);
    
    return docs;
  } catch (error) {
    console.error('Error searching all platforms:', error);
    throw error;
  }
};

const getPlatformSpecificDocs = async (platform, processedQuery) => {
  try {
    const searchString = processedQuery.tokens.join(' ');
    
    const docs = await Documentation.find(
      { 
        platform,
        $text: { $search: searchString } 
      },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(3);
    
    return docs;
  } catch (error) {
    console.error(`Error searching ${platform} documentation:`, error);
    throw error;
  }
};

const generateResponse = (query, relevantDocs, platform) => {
  const sources = relevantDocs.map(doc => ({
    title: doc.title,
    url: doc.url,
    platform: doc.platform
  }));
  
  let answer = '';
  
  if (isHowToQuestion(query)) {
    answer = generateHowToResponse(query, relevantDocs, platform);
  } else {
    answer = generateInformationalResponse(query, relevantDocs, platform);
  }
  
  return {
    answer,
    sources
  };
};

const isHowToQuestion = (query) => {
  const howToPatterns = [
    /how (do|to|can|would|should) (i|we|you)/i,
    /how (is|are|was|were)/i,
    /steps to/i,
    /guide for/i,
    /tutorial for/i,
    /process (of|for)/i
  ];
  
  return howToPatterns.some(pattern => pattern.test(query));
};

const generateHowToResponse = (query, relevantDocs, platform) => {
  let steps = [];
  let generalInfo = '';
  
  relevantDocs.forEach(doc => {
    const content = doc.content;
    const stepMatches = content.match(/(\d+\.\s.*?)(?=\d+\.|$)/gs);
    
    if (stepMatches) {
      steps = [...steps, ...stepMatches];
    } else {
      generalInfo += content + ' ';
    }
  });
  
  let response = '';
  
  if (steps.length > 0) {
    response = `Here's how to ${query.toLowerCase().replace('how do i ', '').replace('how to ', '')} in ${platform === 'all' ? 'the selected CDP' : platform}:\n\n`;
    
    steps.slice(0, 7).forEach((step, index) => {
      response += `${index + 1}. ${step.trim().replace(/^\d+\.\s/, '')}\n`;
    });
  } else {
    response = `To ${query.toLowerCase().replace('how do i ', '').replace('how to ', '')} in ${platform === 'all' ? 'the selected CDP' : platform}, you would typically:\n\n`;
    
    const sentences = generalInfo.split(/\.(?!\d)/g).filter(s => s.trim().length > 0);
    const relevantSentences = sentences.filter(s => 
      query.toLowerCase().split(' ').some(word => 
        s.toLowerCase().includes(word) && word.length > 3
      )
    );
    
    if (relevantSentences.length > 0) {
      relevantSentences.slice(0, 5).forEach((sentence, index) => {
        response += `${index + 1}. ${sentence.trim()}.\n`;
      });
    } else {
      response += "I couldn't find specific step-by-step instructions for this task. Please check the documentation links provided below or try to rephrase your question.";
    }
  }
  
  response += `\nFor more detailed information, please refer to the ${platform === 'all' ? 'CDP' : platform} documentation.`;
  
  return response;
};

const generateInformationalResponse = (query, relevantDocs, platform) => {
  let information = '';
  
  relevantDocs.forEach(doc => {
    information += doc.content + ' ';
  });
  
  let response = '';
  
  const sentences = information.split(/\.(?!\d)/g).filter(s => s.trim().length > 0);
  const relevantSentences = sentences.filter(s => 
    query.toLowerCase().split(' ').some(word => 
      s.toLowerCase().includes(word) && word.length > 3
    )
  );
  
  if (relevantSentences.length > 0) {
    const combinedInfo = relevantSentences.slice(0, 5).join('. ');
    
    response = `${combinedInfo}.\n\nThis information is from the ${platform === 'all' ? 'CDP' : platform} documentation. For more details, please refer to the provided sources.`;
  } else {
    response = `I couldn't find specific information about "${query}" in the ${platform === 'all' ? 'CDP' : platform} documentation. Please check the provided sources or try rephrasing your question.`;
  }
  
  return response;
};

const generateComparisonResponse = (query, platformDocs, featureKeywords) => {
    const [segmentDocs, mParticleDocs, lyticsDocs, zeotapDocs] = platformDocs;
    
    const platformInfo = {
      segment: extractPlatformInfo(segmentDocs, featureKeywords),
      mparticle: extractPlatformInfo(mParticleDocs, featureKeywords),
      lytics: extractPlatformInfo(lyticsDocs, featureKeywords),
      zeotap: extractPlatformInfo(zeotapDocs, featureKeywords)
    };
    
    const platformsWithInfo = Object.entries(platformInfo)
      .filter(([_, info]) => info.trim().length > 0)
      .map(([platform, _]) => platform);
    
    if (platformsWithInfo.length < 2) {
      return {
        answer: `I don't have enough information to compare the platforms regarding "${featureKeywords.join(' ')}". Please try asking about a different feature or check the documentation for more details.`,
        sources: []
      };
    }
    
    const feature = featureKeywords.join(' ');
    
    let response = `Here's a comparison of ${feature} across the CDP platforms:\n\n`;
    
    Object.entries(platformInfo).forEach(([platform, info]) => {
      if (info.trim().length > 0) {
        response += `**${platform.charAt(0).toUpperCase() + platform.slice(1)}**: ${info}\n\n`;
      }
    });
    
    response += `When comparing these platforms for ${feature}, it's important to consider your specific business needs and use cases. Each platform has its own strengths and approaches.`;
    
    const sources = [
      ...segmentDocs.map(doc => ({ title: doc.title, url: doc.url, platform: 'segment' })),
      ...mParticleDocs.map(doc => ({ title: doc.title, url: doc.url, platform: 'mparticle' })),
      ...lyticsDocs.map(doc => ({ title: doc.title, url: doc.url, platform: 'lytics' })),
      ...zeotapDocs.map(doc => ({ title: doc.title, url: doc.url, platform: 'zeotap' }))
    ].filter(source => source.title); 
    
    return {
      answer: response,
      sources
    };
  };
  
  const extractPlatformInfo = (docs, featureKeywords) => {
    if (!docs || docs.length === 0) {
      return '';
    }
    
    let relevantInfo = '';
    
    docs.forEach(doc => {
      const sentences = doc.content.split(/\.(?!\d)/g).filter(s => s.trim().length > 0);
      
      const relevantSentences = sentences.filter(s => 
        featureKeywords.some(keyword => s.toLowerCase().includes(keyword.toLowerCase()))
      );
      
      if (relevantSentences.length > 0) {
        relevantInfo += relevantSentences.join('. ') + '. ';
      }
    });
    
    return relevantInfo.trim();
  };
  
  export default { processUserQuery };