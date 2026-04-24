import { useState, useEffect, useCallback, useRef } from 'react';

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export function useDebounceFn(fn, delay = 300) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const debouncedFn = useCallback((...args) => {
    fnRef.current(...args);
  }, []);

  const { debounced } = useDebounce(0, delay);

  return debouncedFn;
}

export function useDebouncedSearch(callback, delay = 400) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, delay);
  const callbackRef = useRef(callback);

  useEffect(() => {
    if (debouncedQuery && callbackRef.current) {
      callbackRef.current(debouncedQuery);
    }
  }, [debouncedQuery]);

  return [query, setQuery];
}

export default useDebounce;