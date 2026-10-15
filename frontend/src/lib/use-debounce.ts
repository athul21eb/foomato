import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value by a specified delay in milliseconds.
 *
 * @param value The value to debounce.
 * @param delayMs The delay in milliseconds (defaults to 5000ms / 5s).
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delayMs: number = 5000): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
