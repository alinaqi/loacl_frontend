import { useEffect } from 'react';
import { eventEmitter } from '../utils/eventEmitter';

export function useEventListener<T>(event: string, handler: (data: T) => void) {
  useEffect(() => {
    const unsubscribe = eventEmitter.on(event, handler);
    return () => {
      unsubscribe();
    };
  }, [event, handler]);
}

export function useEventEmitter<T>(event: string) {
  return (data: T) => {
    eventEmitter.emit(event, data);
  };
} 