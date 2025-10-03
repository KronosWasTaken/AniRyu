export const ANIMATION_CONFIG = {
  durations: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
    verySlow: 0.8,
  },
  
  easing: {
    easeIn: 'easeIn',
    easeOut: 'easeOut',
    easeInOut: 'easeInOut',
    linear: 'linear',
  },
  
  spring: {
    gentle: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 40,
    },
    bouncy: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
    snappy: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
  
  stagger: {
    fast: 0.05,
    normal: 0.1,
    slow: 0.2,
  },
  
  scale: {
    hover: 1.02,
    tap: 0.98,
    focus: 1.05,
  },
  
  movement: {
    subtle: 4,
    normal: 8,
    large: 16,
  },
} as const;

export const ANIMATION_PRESETS = {
  pageEnter: {
    duration: ANIMATION_CONFIG.durations.normal,
    ease: ANIMATION_CONFIG.easing.easeOut,
  },
  
  pageExit: {
    duration: ANIMATION_CONFIG.durations.fast,
    ease: ANIMATION_CONFIG.easing.easeIn,
  },
  
  cardHover: {
    duration: ANIMATION_CONFIG.durations.fast,
    ease: ANIMATION_CONFIG.easing.easeOut,
  },
  
  cardTap: {
    duration: ANIMATION_CONFIG.durations.fast,
    ease: ANIMATION_CONFIG.easing.easeInOut,
  },
  
  buttonHover: {
    duration: ANIMATION_CONFIG.durations.fast,
    ease: ANIMATION_CONFIG.easing.easeOut,
  },
  
  buttonTap: {
    duration: ANIMATION_CONFIG.durations.fast,
    ease: ANIMATION_CONFIG.easing.easeInOut,
  },
  
  listStagger: {
    staggerChildren: ANIMATION_CONFIG.stagger.normal,
    delayChildren: 0.1,
  },
  
  loading: {
    duration: 1,
    ease: ANIMATION_CONFIG.easing.linear,
    repeat: Infinity,
  },
} as const;
