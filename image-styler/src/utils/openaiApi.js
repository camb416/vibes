// OpenAI API integration for image generation

export const generateImage = async (prompt, styleData = null) => {
  const apiKey = localStorage.getItem('openai_key');
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please set it in settings.');
  }

  // Use the prompt as-is since it's already enhanced by the node
  const enhancedPrompt = prompt;

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'url'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate image');
    }

    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
};

export const generateImageBatch = async (prompts, styleData = null, onProgress = null) => {
  const results = [];
  
  for (let i = 0; i < prompts.length; i++) {
    try {
      const imageUrl = await generateImage(prompts[i], styleData);
      results.push({
        prompt: prompts[i],
        url: imageUrl,
        success: true
      });
      
      if (onProgress) {
        onProgress((i + 1) / prompts.length * 100);
      }
    } catch (error) {
      results.push({
        prompt: prompts[i],
        error: error.message,
        success: false
      });
      
      if (onProgress) {
        onProgress((i + 1) / prompts.length * 100);
      }
    }
  }
  
  return results;
};

export const validateApiKey = async (apiKey) => {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};