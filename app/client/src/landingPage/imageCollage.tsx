import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './imageCollage.module.css';

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string;
const CACHE_KEY = 'trippinCollage';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const NUM_IMAGES = 65; // We'll create a grid of 65 images

interface CellData {
  content: string; // image url
  width: number;
  height: number;
}

interface ImageData {
  url: string;
}

interface CachedData {
  timestamp: number;
  cells: CellData[];
}

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
              query: 'travel, adventure, nature, city, landscape',
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
      return images.map((img) => ({
        content: img.url,
        width: Math.random() < 0.4 ? 2 : 1, // 20% chance of being wide
        height: Math.random() < 0.4 ? 2 : 1, // 20% chance of being tall
      }));
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
                url: `/api/placeholder/800/600?text=Image${i + 1}`,
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
