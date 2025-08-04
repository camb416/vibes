// Unsplash API integration for default images
// Using Lorem Picsum as a free alternative for demo purposes

const UNSPLASH_ACCESS_KEY = 'demo-key'; // Using demo mode for development

export const getRandomImage = async (width = 400, height = 300, keyword = '') => {
  try {
    // Using Lorem Picsum for demo - replace with actual Unsplash API if key is available
    if (!UNSPLASH_ACCESS_KEY) {
      const response = await fetch(`https://picsum.photos/${width}/${height}?random=${Date.now()}`);
      return response.url;
    }

    // Actual Unsplash API implementation
    const searchParam = keyword ? `&query=${encodeURIComponent(keyword)}` : '';
    const response = await fetch(
      `https://api.unsplash.com/photos/random?orientation=landscape&w=${width}&h=${height}${searchParam}`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Unsplash');
    }

    const data = await response.json();
    return data.urls.regular;
  } catch (error) {
    console.error('Error fetching random image:', error);
    // Fallback to Lorem Picsum
    return `https://picsum.photos/${width}/${height}?random=${Date.now()}`;
  }
};

export const searchImages = async (query, page = 1, perPage = 12) => {
  if (!UNSPLASH_ACCESS_KEY) {
    // Return mock data for demo
    return {
      results: Array.from({ length: perPage }, (_, i) => ({
        id: `mock-${page}-${i}`,
        urls: {
          small: `https://picsum.photos/300/200?random=${Date.now()}-${i}`,
          regular: `https://picsum.photos/800/600?random=${Date.now()}-${i}`,
        },
        alt_description: `Random image ${i + 1}`,
        user: { name: 'Demo User' },
      })),
      total: 100,
      total_pages: Math.ceil(100 / perPage),
    };
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search Unsplash');
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching images:', error);
    throw error;
  }
};