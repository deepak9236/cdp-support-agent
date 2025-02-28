// Format a response for a how-to question
const formatHowToResponse = (documentData, query) => {
    // Check if we have step-by-step instructions
    if (documentData.steps && documentData.steps.length > 0) {
      let response = `Here's how to ${query.toLowerCase().replace('how do i ', '').replace('how to ', '')}:\n\n`;
      
      // Add numbered steps
      documentData.steps.forEach((step, index) => {
        response += `${index + 1}. ${step}\n`;
      });
      
      // Add reference
      response += `\nSource: ${documentData.title} (${documentData.url})`;
      
      return response;
    }
    
    // If no explicit steps, try to extract from content
    const content = documentData.content;
    const sentences = content.split(/\.(?!\d)/g).filter(s => s.trim().length > 0);
    
    // Try to find sentences related to the query
    const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const relevantSentences = sentences.filter(s => 
      queryWords.some(word => s.toLowerCase().includes(word))
    );
    
    if (relevantSentences.length > 0) {
      let response = `Here's information about ${query.toLowerCase().replace('how do i ', '').replace('how to ', '')}:\n\n`;
      
      // Add relevant sentences as bullet points
      relevantSentences.slice(0, 5).forEach((sentence, index) => {
        response += `• ${sentence.trim()}.\n`;
      });
      
      // Add code example if available
      if (documentData.codeExamples && documentData.codeExamples.length > 0) {
        response += `\nHere's an example:\n\`\`\`\n${documentData.codeExamples[0]