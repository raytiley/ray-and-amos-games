import { useEffect } from 'react';

/**
 * Custom hook for handling touch/mouse swipe input
 * @param {React.RefObject} elementRef - Reference to the element to attach listeners to
 * @param {Function} onSwipeStart - Called when swipe/drag starts with (x, y)
 * @param {Function} onSwipeMove - Called during swipe/drag with (x, y)
 * @param {Function} onSwipeEnd - Called when swipe/drag ends
 */
export default function useSwipeInput(elementRef, onSwipeStart, onSwipeMove, onSwipeEnd) {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Get coordinates relative to game area (normalized to game dimensions)
    const getCoords = (e, rect) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      // Convert to game coordinates (assuming 800x600 game area)
      const x = ((clientX - rect.left) / rect.width) * 800;
      const y = ((clientY - rect.top) / rect.height) * 600;

      return { x, y };
    };

    let isActive = false;
    let rect = null;

    // Pointer/Touch start
    const handleStart = (e) => {
      // Only handle left mouse button or touch
      if (e.button !== undefined && e.button !== 0) return;

      rect = element.getBoundingClientRect();
      const { x, y } = getCoords(e, rect);

      isActive = true;
      onSwipeStart(x, y);
    };

    // Pointer/Touch move
    const handleMove = (e) => {
      if (!isActive || !rect) return;

      const { x, y } = getCoords(e, rect);
      onSwipeMove(x, y);
    };

    // Pointer/Touch end
    const handleEnd = () => {
      if (!isActive) return;

      isActive = false;
      rect = null;
      onSwipeEnd();
    };

    // Mouse events
    element.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    // Touch events
    element.addEventListener('touchstart', handleStart, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);

    return () => {
      element.removeEventListener('mousedown', handleStart);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);

      element.removeEventListener('touchstart', handleStart);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [elementRef, onSwipeStart, onSwipeMove, onSwipeEnd]);
}
