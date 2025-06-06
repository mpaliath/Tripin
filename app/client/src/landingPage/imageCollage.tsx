import { DebugUtils } from '@features/debug/debugUtils';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './imageCollage.module.css';

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string;
const CACHE_KEY = 'partyImageCollage';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const NUM_IMAGES = 65; // We'll create a 9x9 grid with 16 text cells
const CELEBRATORY_TEXTS = [
  'Happy Birthday!',
  'Celebrate!',
  'Party Time!',
  'Cheers!',
  'Congrats!',
  'Hooray!',
  'Woo-hoo!',
  'Fantastic!',
  'Amazing!',
  'Brilliant!',
  'Awesome!',
  'Wonderful!',
  'Incredible!',
  'Superb!',
  'Excellent!',
  'Fabulous!',
];

interface ImageData {
  url: string;
}

interface CellData {
  type: 'image' | 'text';
  content: string;
  width: number;
  height: number;
}

interface CachedData {
  timestamp: number;
  cells: CellData[];
}

// Use a fixed palette for random background colors
const colorTokens = [
  '#fbbf24', // yellow-400
  '#f87171', // red-400
  '#34d399', // green-400
  '#60a5fa', // blue-400
  '#a78bfa', // purple-400
  '#f472b6', // pink-400
  '#facc15', // yellow-300
  '#38bdf8', // sky-400
  '#fcd34d', // yellow-300
  '#fca5a5', // red-300
  '#6ee7b7', // green-300
  '#93c5fd', // blue-300
  '#c4b5fd', // purple-300
  '#f9a8d4', // pink-300
  '#fde68a', // yellow-200
  '#bae6fd', // sky-200
  '#fef08a', // yellow-100
  '#fca5a5', // red-200
  '#bbf7d0', // green-200
  '#bfdbfe', // blue-200
  '#ddd6fe', // purple-200
  '#fbcfe8', // pink-200
];

const getRandomColor = () =>
  colorTokens[Math.floor(Math.random() * colorTokens.length)];

const getRandomFont = () => {
  const fonts = [
    'Arial',
    'Verdana',
    'Georgia',
    'Times New Roman',
    'Courier',
    'Impact',
  ];
  return fonts[Math.floor(Math.random() * fonts.length)];
};
const getRandomSize = () => Math.floor(Math.random() * 300) + 700;
const getContrastColor = (color: string) => {
  // Accepts hex color, returns black or white for contrast
  let c = color.substring(1); // strip #
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 128 ? '#FFFFFF' : '#000000';
};

const ImageCollage: React.FC = () => {
  const [cells, setCells] = useState<CellData[]>([]);
  const location = useLocation();

  const getCachedImages = useCallback((): CachedData | null => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    return cachedData ? JSON.parse(cachedData) : null;
  }, []);

  const setCachedImages = useCallback((cells: CellData[]) => {
    const dataToCache: CachedData = {
      timestamp: new Date().getTime(),
      cells: cells,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));
  }, []);

  const fetchImages = useCallback(async (): Promise<ImageData[]> => {
    if (!UNSPLASH_ACCESS_KEY) {
      console.error('Unsplash API key is not set');
      return [];
    }

    const fetchBatch = async (count: number) => {
      try {
        const response = await axios.get(
          'https://api.unsplash.com/photos/random',
          {
            params: {
              count: count,
              query: 'children birthday party',
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

    try {
      const batches = [30, 30, 5]; // 65 images total
      const results = await Promise.all(
        batches.map((count) => fetchBatch(count)),
      );
      return results.flat();
    } catch (error) {
      console.error('Error fetching images:', error);
      return [];
    }
  }, []);

  const createCellData = useCallback(
    async (images: ImageData[]): Promise<CellData[]> => {
      if (DebugUtils.isDebuggingComponent(ImageCollage.name)) {
        return Array.from({ length: 81 }, (_, index) => ({
          type: 'text',
          content: `${index}`,
          width: 1,
          height: 1,
        }));
      }

      const cellData: CellData[] = [
        ...images.map((img) => ({
          type: 'image' as const,
          content: img.url,
          width: Math.random() < 0.4 ? 2 : 1, // 20% chance of being wide
          height: Math.random() < 0.4 ? 2 : 1, // 20% chance of being tall
        })),
        ...CELEBRATORY_TEXTS.map((text) => ({
          type: 'text' as const,
          content: text,
          width: Math.random() < 0.15 ? 2 : 1, // 15% chance of being wide
          height: Math.random() < 0.15 ? 2 : 1, // 15% chance of being tall
        })),
      ];
      return cellData.sort(() => Math.random() - 0.5); // Shuffle the array
    },
    [],
  );

  const loadCells = useCallback(
    async (bypassCache: boolean) => {
      let cellData: CellData[];
      const cachedData = getCachedImages();
      const currentTime = new Date().getTime();

      if (
        !bypassCache &&
        cachedData &&
        currentTime - cachedData.timestamp < CACHE_DURATION
      ) {
        cellData = cachedData.cells;
      } else {
        try {
          const images = await fetchImages();
          cellData = await createCellData(images);
          setCachedImages(cellData);
        } catch (error) {
          console.error(
            'Error fetching new images, falling back to cache or placeholders:',
            error,
          );
          if (cachedData) {
            cellData = cachedData.cells;
          } else {
            // If no cached data, use placeholders
            const placeholderImages: ImageData[] = Array.from(
              { length: NUM_IMAGES },
              (_, i) => ({
                url: `/api/placeholder/800/600?text=Party${i + 1}`,
              }),
            );
            cellData = await createCellData(placeholderImages);
          }
        }
      }

      setCells(cellData);
    },
    [fetchImages, createCellData, getCachedImages, setCachedImages],
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const bypassCache = searchParams.has('bypassCache');
    loadCells(bypassCache);
  }, [location.search, loadCells]);

  const renderCell = useCallback(
    (cell: CellData, index: number) => {
      const randomOffset = () => `${Math.random() * 10 - 5}px`;
      const cellStyle = {
        gridColumn: `span ${cell.width}`,
        gridRow: `span ${cell.height}`,
        transform: `translate(${randomOffset()}, ${randomOffset()})`,
      };

      if (cell.type === 'image') {
        return (
          <div
            id={`item_${index}`}
            key={index}
            className={`${styles.cell} ${styles.imageCell}`}
            style={{
              ...cellStyle,
              backgroundImage: `url("${cell.content}")`,
            }}
          />
        );
      } else {
        const backgroundColor = getRandomColor();
        const textColor = getContrastColor(backgroundColor);
        const fontSize = getRandomSize();
        const fontFamily = getRandomFont();

        return (
          <div
            id={`item_${index}`}
            key={index}
            className={`${styles.cell} flex items-center justify-center p-2`}
            style={{
              ...cellStyle,
              backgroundColor,
            }}
          >
            <span
              style={{
                color: textColor,
                fontSize: `${fontSize}%`,
                fontFamily,
                textAlign: 'center',
                lineHeight: 1.2,
                width: '100%',
                wordBreak: 'break-word',
              }}
            >
              {cell.content}
            </span>
          </div>
        );
      }
    },
    [],
  );

  return (
    <div className={styles.collage}>
      <div className={styles.movingGrid}>{cells.map(renderCell)}</div>
    </div>
  );
};

export default ImageCollage;
