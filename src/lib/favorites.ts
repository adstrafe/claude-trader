import { ForexPair } from "./mockData";

const FAVORITES_COOKIE_KEY = 'favorite_pairs';

// Default favorite pairs
const DEFAULT_FAVORITES = ['EURUSD', 'USDJPY', 'GBPUSD', 'EURGBP'];

// Cookie utility functions
function setCookie(name: string, value: string, days: number = 365) {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// Favorites management functions
export function getFavoritePairs(): string[] {
  try {
    const favoritesCookie = getCookie(FAVORITES_COOKIE_KEY);
    if (favoritesCookie) {
      const favorites = JSON.parse(favoritesCookie);
      return favorites;
    }
  } catch (error) {
    console.error('Error parsing favorites cookie:', error);
  }
  return DEFAULT_FAVORITES;
}

export function setFavoritePairs(favorites: string[]): void {
  try {
    setCookie(FAVORITES_COOKIE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving favorites cookie:', error);
  }
}

export function toggleFavorite(symbol: string): string[] {
  const currentFavorites = getFavoritePairs();
  const isFavorite = currentFavorites.includes(symbol);
  
  let newFavorites: string[];
  if (isFavorite) {
    // Simply remove the pair
    newFavorites = currentFavorites.filter(fav => fav !== symbol);
  } else {
    // Simply add the new pair
    newFavorites = [...currentFavorites, symbol];
  }
  
  setFavoritePairs(newFavorites);
  return newFavorites;
}

export function isFavorite(symbol: string): boolean {
  return getFavoritePairs().includes(symbol);
}

export function applyFavoritesToPairs(pairs: ForexPair[]): ForexPair[] {
  const favorites = getFavoritePairs();
  return pairs.map(pair => ({
    ...pair,
    isFavorite: favorites.includes(pair.symbol)
  }));
}

export function getFavoritePairsFromList(pairs: ForexPair[]): ForexPair[] {
  const favorites = getFavoritePairs();
  return pairs.filter(pair => favorites.includes(pair.symbol));
}

// Get exactly 4 pairs for dashboard display (favorites + defaults)
export function getDashboardPairs(pairs: ForexPair[]): ForexPair[] {
  const favorites = getFavoritePairs();
  const favoritePairs = pairs.filter(pair => favorites.includes(pair.symbol));
  
  // If we have 4 or more favorites, show first 4
  if (favoritePairs.length >= 4) {
    return favoritePairs.slice(0, 4);
  }
  
  // If we have less than 4 favorites, fill with defaults
  const remainingDefaults = DEFAULT_FAVORITES.filter(defaultPair => 
    !favorites.includes(defaultPair)
  );
  
  const needed = 4 - favoritePairs.length;
  const defaultPairs = pairs.filter(pair => 
    remainingDefaults.includes(pair.symbol)
  ).slice(0, needed);
  
  return [...favoritePairs, ...defaultPairs];
}

export function getFavoritesCount(): number {
  return getFavoritePairs().length;
}
