import { Variants } from 'motion/react';

export const cardHoverVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

export const cardTapVariants: Variants = {
  initial: {
    scale: 1,
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: 'easeInOut',
    },
  },
};

export const cardEnterVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

export const cardExitVariants: Variants = {
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

export const mediaCardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  hover: {
    y: -4,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};
