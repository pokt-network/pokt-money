'use client'
import { useState, useEffect } from 'react';

export default function useMediaQuery(query: string){
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    // Function to update the state based on media query match
    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Set initial match state
    setMatches(mediaQueryList.matches);

    // Add listener for media query change
    mediaQueryList.addEventListener('change', handleChange);

    // Clean up listener on unmount
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};
