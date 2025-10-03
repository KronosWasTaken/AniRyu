import { Transition } from 'motion/react';

export const smoothTransition: Transition = {
  duration: 0.3,
  ease: 'easeInOut',
};

export const fastTransition: Transition = {
  duration: 0.15,
  ease: 'easeOut',
};

export const slowTransition: Transition = {
  duration: 0.5,
  ease: 'easeOut',
};

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const bouncyTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
};

export const gentleTransition: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 40,
};

export const staggerTransition: Transition = {
  duration: 0.3,
  ease: 'easeOut',
  staggerChildren: 0.1,
  delayChildren: 0.1,
};

export const fadeTransition: Transition = {
  duration: 0.4,
  ease: 'easeOut',
};

export const slideTransition: Transition = {
  duration: 0.3,
  ease: 'easeOut',
};

export const scaleTransition: Transition = {
  duration: 0.2,
  ease: 'easeOut',
};
