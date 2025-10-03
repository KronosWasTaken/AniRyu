import { useAnimation } from 'motion/react';
import { useCallback } from 'react';

interface UseHoverAnimationOptions {
  scale?: number;
  y?: number;
  duration?: number;
}

export function useHoverAnimation(options: UseHoverAnimationOptions = {}) {
  const { scale = 1.02, y = -4, duration = 0.2 } = options;
  const controls = useAnimation();

  const handleMouseEnter = useCallback(() => {
    controls.start({
      scale,
      y,
      transition: {
        duration,
        ease: 'easeOut',
      },
    });
  }, [controls, scale, y, duration]);

  const handleMouseLeave = useCallback(() => {
    controls.start({
      scale: 1,
      y: 0,
      transition: {
        duration,
        ease: 'easeOut',
      },
    });
  }, [controls, duration]);

  return {
    controls,
    handleMouseEnter,
    handleMouseLeave,
  };
}

export function useTapAnimation(options: UseHoverAnimationOptions = {}) {
  const { scale = 0.98, duration = 0.1 } = options;
  const controls = useAnimation();

  const handleTap = useCallback(() => {
    controls.start({
      scale,
      transition: {
        duration,
        ease: 'easeInOut',
      },
    });
  }, [controls, scale, duration]);

  const handleTapEnd = useCallback(() => {
    controls.start({
      scale: 1,
      transition: {
        duration,
        ease: 'easeInOut',
      },
    });
  }, [controls, duration]);

  return {
    controls,
    handleTap,
    handleTapEnd,
  };
}
