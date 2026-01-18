import { useEffect, useRef } from 'react';

/**
 * Custom hook for running a game loop using requestAnimationFrame
 * @param {Function} callback - Function called each frame with deltaTime (ms)
 */
export default function useGameLoop(callback) {
  const callbackRef = useRef(callback);
  const frameRef = useRef();
  const lastTimeRef = useRef();

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const loop = (timestamp) => {
      if (lastTimeRef.current === undefined) {
        lastTimeRef.current = timestamp;
      }

      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Call the game update function
      callbackRef.current(deltaTime);

      // Request next frame
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);
}
