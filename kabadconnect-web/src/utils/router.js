import { useState, useEffect } from 'react';

// Route normalizer
export const parseHashRoute = (hash) => {
  if (!hash) return 'home';
  const clean = hash.replace(/^#\/?/, '').split('?')[0].trim().toLowerCase();
  if (!clean || clean === 'home') return 'home';
  if (clean.includes('rate')) return 'rates';
  if (clean.includes('calc')) return 'calculator';
  if (clean.includes('kabadwala') || clean.includes('dealer') || clean.includes('radar')) return 'kabadwalas';
  if (clean.includes('store') || clean.includes('shop') || clean.includes('product') || clean.includes('bazaar') || clean.includes('market') || clean.includes('resale') || clean.includes('sell')) return 'store';
  if (clean.includes('how') || clean.includes('work') || clean.includes('faq')) return 'how-it-works';
  if (clean.includes('profile') || clean.includes('account') || clean.includes('agent') || clean.includes('partner-profile')) return 'profile';
  return clean;
};

export const navigateTo = (route) => {
  const targetHash = route === 'home' ? '#/' : `#/${route}`;
  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

export const useHashRoute = () => {
  const [route, setRoute] = useState(() => parseHashRoute(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => {
      const newRoute = parseHashRoute(window.location.hash);
      setRoute(newRoute);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return [route, navigateTo];
};
