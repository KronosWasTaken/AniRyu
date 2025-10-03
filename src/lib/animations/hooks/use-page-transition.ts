import { useAnimation } from 'motion/react';
import { useEffect } from 'react';

interface UsePageTransitionOptions {
  delay?: number;
  duration?: number;
}

export function usePageTransition(options: UsePageTransitionOptions = {}) {
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

export function useFadeIn(options: UsePageTransitionOptions = {}) {
  const { delay = 0, duration = 0.4 } = options;
  const controls = useAnimation();

  useEffect(() => {
    const startAnimation = async () => {
      await controls.start({
        opacity: 1,
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

export function useSlideUp(options: UsePageTransitionOptions = {}) {
  const { delay = 0, duration = 0.4 } = options;
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
