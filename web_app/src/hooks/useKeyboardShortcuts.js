import { useEffect, useCallback } from 'react';

export function useKeyboardShortcuts(shortcuts = {}) {
  const handleKeyDown = useCallback(
    (event) => {
      const { key, ctrlKey, shiftKey, altKey, metaKey } = event;
      
      const keyCombo = [
        ctrlKey && 'ctrl',
        shiftKey && 'shift',
        altKey && 'alt',
        metaKey && 'meta',
        key.toLowerCase(),
      ]
        .filter(Boolean)
        .join('+');

      const handler = shortcuts[keyCombo];
      if (handler) {
        event.preventDefault();
        handler(event);
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export default useKeyboardShortcuts;