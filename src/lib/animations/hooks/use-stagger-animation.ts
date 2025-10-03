import { useAnimation } from 'motion/react';
import { useEffect } from 'react';

interface UseStaggerAnimationOptions {
  delay?: number;
  staggerDelay?: number;
  duration?: number;
}

export function useStaggerAnimation(options: UseStaggerAnimationOptions = {}) {
  const { delay = 0, staggerDelay = 0.1, duration = 0.3 } = options;
  const controls = useAnimation();

  useEffect(() => {
    const startAnimation = async () => {
      await controls.start({
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: delay,
        },
      });
    };

    startAnimation();
  }, [controls, delay, staggerDelay]);

  return controls;
}

export function useStaggerItemAnimation(options: UseStaggerAnimationOptions = {}) {
  const { delay = 0, duration = 0.3 } = options;
  const controls = useAnimation();

  useEffect(() => {
    const startAnimation = async () => {
      await controls.start({
        opacity: 1,
        y: 0,
        transition: {
          duration,
          delay,
          ease: 'easeOut',
        },
      });
    };

    startAnimation();
  }, [controls, delay, duration]);

  return controls;
}
