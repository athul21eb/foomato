import type { Transition, Variants } from 'motion/react';

// ─── Standard Transitions & Springs (Curated for a snappy, premium feel) ──────

export const springGentle: Transition = {
  type: 'spring',
  stiffness: 280,
  damping: 24,
  mass: 0.8,
};

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 30,
  mass: 0.7,
};

export const springBouncy: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 18,
};

export const easeSmooth: Transition = {
  duration: 0.28,
  ease: [0.16, 1, 0.3, 1],
};

// ─── Motion Variants & Props ─────────────────────────────────────────────────

export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] },
  },
};

export const fadeInVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

export const staggerItemVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.15 },
  },
};

export const cartItemVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: springGentle },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};

export const cartItemMotionProps = {
  layout: true,
  variants: cartItemVariants,
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
  transition: springGentle,
};

export const cardHoverVariants: Variants = {
  initial: { y: 0 },
  hover: { y: -4, transition: springGentle },
  tap: { scale: 0.985, transition: springSnappy },
};

export const buttonTapProps = {
  whileHover: { scale: 1.015 },
  whileTap: { scale: 0.98 },
  transition: springSnappy,
};

export const modalOverlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.16 } },
};

export const modalContentVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 340, damping: 26 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 6,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};
