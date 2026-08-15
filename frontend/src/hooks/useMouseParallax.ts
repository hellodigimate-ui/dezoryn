import { useState, useEffect, useCallback } from 'react';

/**
 * Lightweight mouse parallax hook.
 * Returns { x, y } in range [-1, 1] relative to the viewport centre.
 * Smoothed with a lerp so motion feels silky, not snappy.
 */
export function useMouseParallax(strength = 1) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = useCallback((e: MouseEvent) => {
    const x = ((e.clientX / window.innerWidth) - 0.5) * 2 * strength;
    const y = ((e.clientY / window.innerHeight) - 0.5) * 2 * strength;
    setPos({ x, y });
  }, [strength]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, [handleMove]);

  return pos;
}
