import { useState } from 'react';

export const useLoading = (initialValue: boolean = false) => {
  const [loading, setLoading] = useState(initialValue);

  return {
    loading,
    setLoading,
  };
};
