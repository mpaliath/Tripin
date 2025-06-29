import { useState, useCallback } from 'react';
import type { Adventure } from '../../../shared/types';

interface ProgressEvent {
  stage: string;
  progress: number;
}

interface StreamState {
  loading: boolean;
  progress: ProgressEvent | null;
  adventures: Adventure[] | null;
  error: string | null;
}

export function useAdventureStream() {
  const [state, setState] = useState<StreamState>({
    loading: false,
    progress: null,
    adventures: null,
    error: null
  });

  const fetchAdventures = useCallback((params: {
    lat?: number | null;
    lng?: number | null;
    hours: number;
    city?: string;
  }) => {
    setState({
      loading: true,
      progress: null,
      adventures: null,
      error: null
    });

    const { lat, lng, hours, city } = params;
    
    // Check if EventSource is supported
    if (typeof EventSource === 'undefined') {
      // Fallback to regular HTTP request
      const url = new URL('/api/adventures', window.location.origin);
      if (lat && lng) {
        url.searchParams.set('lat', lat.toString());
        url.searchParams.set('lng', lng.toString());
      }
      url.searchParams.set('hours', hours.toString());
      if (city) {
        url.searchParams.set('city', city);
      }

      fetch(url.toString())
        .then(response => response.json())
        .then((adventures: Adventure[]) => {
          setState(prev => ({
            ...prev,
            loading: false,
            adventures: adventures.map((adv, i) => ({ ...adv, id: adv.id || String(i) }))
          }));
        })
        .catch(error => {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error.message || 'An error occurred'
          }));
        });
      
      return () => {}; // No cleanup needed
    }

    // Use Server-Sent Events for better UX
    const url = new URL('/api/adventures/stream', window.location.origin);
    
    if (lat && lng) {
      url.searchParams.set('lat', lat.toString());
      url.searchParams.set('lng', lng.toString());
    }
    url.searchParams.set('hours', hours.toString());
    if (city) {
      url.searchParams.set('city', city);
    }

    const eventSource = new EventSource(url.toString());

    eventSource.addEventListener('progress', (event) => {
      const progressData = JSON.parse(event.data) as ProgressEvent;
      setState(prev => ({
        ...prev,
        progress: progressData
      }));
    });

    eventSource.addEventListener('complete', (event) => {
      const adventures = JSON.parse(event.data) as Adventure[];
      setState(prev => ({
        ...prev,
        loading: false,
        adventures: adventures.map((adv, i) => ({ ...adv, id: adv.id || String(i) })),
        progress: null
      }));
      eventSource.close();
    });

    eventSource.addEventListener('error', (event) => {
      const errorData = JSON.parse((event as MessageEvent).data);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorData.error || 'An error occurred',
        progress: null
      }));
      eventSource.close();
    });

    eventSource.onerror = () => {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Connection error',
        progress: null
      }));
      eventSource.close();
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  }, []);

  return {
    ...state,
    fetchAdventures
  };
}
