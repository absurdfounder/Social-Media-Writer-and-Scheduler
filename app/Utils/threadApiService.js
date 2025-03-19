// Utils/threadApiService.js

/**
 * Call the thread generation API endpoint
 * @param {Object} params - Parameters for thread generation
 * @returns {Promise<Object>} - The generated tweets
 */
export const generateThreadContent = async ({
    prompt,
    maxTweets = 1,
    feeling = 'not_specified',
    mode = 'share',
    replyLength = 'super_short',
    replyStance = 'neutral',
    trainingData = '',
    celebrityMode = '',
    includeProduct = false,
    productInfo = null,
    apiKey
  }) => {
    try {
      // Get product info if needed
      let productInfoData = productInfo;
      if (includeProduct && !productInfoData) {
        const storedProductInfo = localStorage.getItem('productQuestionnaire');
        if (storedProductInfo) {
          productInfoData = JSON.parse(storedProductInfo);
        }
      }
  
      // Call our API endpoint
      const response = await fetch('/api/generate-thread', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          maxTweets,
          feeling,
          mode,
          replyLength,
          replyStance,
          trainingData,
          celebrityMode,
          includeProduct,
          productInfo: productInfoData,
          apiKey
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate thread');
      }
  
      const data = await response.json();
      
      if (!data.success || !data.tweets) {
        throw new Error('Invalid response from server');
      }
  
      return data.tweets;
    } catch (error) {
      console.error('Error calling thread generation API:', error);
      throw error;
    }
  };