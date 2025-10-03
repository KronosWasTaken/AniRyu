import { fadeIn, slideUp, scaleIn, staggerContainer, staggerItem } from './variants';
import { smooth, spring, gentle } from './transitions';

export const pageTransition = {
  ...fadeIn,
  transition: smooth,
};

export const cardHover = {
  scale: 1.02,
  transition: {
    duration: 0.2,
    ease: "easeInOut",
  },
};

export const buttonPress = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

export const modalBackdrop = {
  ...fadeIn,
  transition: smooth,
};

export const modalContent = {
  ...scaleIn,
  transition: spring,
};

export const listStagger = {
  ...staggerContainer,
  transition: smooth,
};

export const listItem = {
  ...staggerItem,
  transition: smooth,
};

export const loadingSpinner = {
  animate: {
    rotate: 360,
  },
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'linear',
  },
};
