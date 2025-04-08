import { useEffect, useRef } from 'react';

export const useEffectOnce = (fn: Function, condition: any) => {
  const hasRun = useRef(false);
  useEffect(() => {
    if (condition && !hasRun.current) {
      fn();
      hasRun.current = true;
    }
  }, [condition]);
};
