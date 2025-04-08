import { useEffect } from 'react';

export const useMount = (fn: () => void) => {
  if (typeof fn !== 'function') {
    throw new Error('useUnmount requires a function as its only parameter');
  }

  useEffect(() => {
    fn();
  }, []);
};
