import { Variants } from 'motion/react';

export const buttonHoverVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

export const buttonTapVariants: Variants = {
  initial: {
    scale: 1,
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: 'easeInOut',
    },
  },
};

export const buttonLoadingVariants: Variants = {
  initial: {
    opacity: 1,
  },
  loading: {
    opacity: 0.7,
    transition: {
      duration: 0.2,
    },
  },
};

export const iconRotateVariants: Variants = {
  initial: {
    rotate: 0,
  },
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

export const buttonPulseVariants: Variants = {
  initial: {
    scale: 1,
  },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};
