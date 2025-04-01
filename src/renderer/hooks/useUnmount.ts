import { useEffect } from 'react';

export const useUnmount = (fn: () => void) => {
  if (typeof fn !== 'function') {
    throw new Error('useUnmount requires a function as its only parameter');
  }

  useEffect(() => {
    return () => fn();
  }, []);
};
