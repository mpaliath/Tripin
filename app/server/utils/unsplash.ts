import axios from 'axios';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export const fetchImage = async (queryString: string) => {
      try {
        const response = await axios.get(
          'https://api.unsplash.com/photos/random',
          {
            params: {
              count: 1,
              query: queryString,
              client_id: UNSPLASH_ACCESS_KEY,
            },
          },
        );
        return response.data.map((item: any) => ({ url: item.urls.regular }));
      } catch (error) {
        console.error('Error fetching images from Unsplash:', error);
        throw error;
      }
    };