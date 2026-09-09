import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

let lenisInstance = null;

/**
 * Access the active Lenis instance
 * @returns {Lenis | null}
 */
export const getLenis = () => lenisInstance;

/**
 * Initialize Lenis smooth scroll engine with momentum and easing
 * @returns {Lenis}
 */
export const initSmoothScroll = () => {
  if (typeof window === 'undefined') return null;
  if (lenisInstance) return lenisInstance;

  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential ease-out
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
    autoRaf: true,
    anchors: false, // Disabled to prevent Lenis from intercepting hash router URLs (#/, #/rates, etc.)
    prevent: (node) => {
      if (!node || !node.closest) return false;
      return Boolean(
        node.closest('[data-lenis-prevent]') ||
        node.closest('.modal-overlay') ||
        node.closest('.modal-content') ||
        node.closest('.drawer') ||
        node.closest('.scroll-touch-x') ||
        node.closest('select')
      );
    }
  });

  // Attach to global window for accessibility / debugging
  window.__lenis = lenisInstance;

  return lenisInstance;
};

/**
 * Clean up Lenis instance on unmount
 */
export const destroySmoothScroll = () => {
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
    delete window.__lenis;
  }
};
