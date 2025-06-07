import axios from 'axios';

const API_KEY = process.env.GOOGLE_API_KEY;
const CX = process.env.GOOGLE_CX;

export async function fetchImages(query: string) {
  const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
    params: {
      key: API_KEY,
      cx: CX,
      q: query,
      searchType: 'image',
    },
  });
  return response.data.items.map((item: any) => ({
    title: item.title,
    link: item.link,
    thumbnail: item.image.thumbnailLink,
  }));
}