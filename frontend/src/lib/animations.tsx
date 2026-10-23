import React, { useRef, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
  useTransform,
  animate,
  useInView,
  useMotionValue,
} from 'motion/react';

// Re-export AnimatePresence for convenience
export { AnimatePresence };

// ─── Common Prop Types ────────────────────────────────────────────────────────

export interface AnimatedContentProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  duration?: number;
}

export interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  staggerChildren?: number;
  once?: boolean;
}

export interface RevealItemProps {
  children: React.ReactNode;
  className?: string;
  y?: number;
}

// ─── Semantic Animation Wrapper Components (No raw motion.div in pages) ───────

/**
 * 1. FadeInUp — Standard subtle upward entrance for hero sections, forms, and cards.
 * Minimal, swift 0.35s entrance.
 */
export const FadeInUp: React.FC<
  AnimatedContentProps & {
    initialY?: number;
    once?: boolean;
    margin?: string;
  }
> = ({
  children,
  className = '',
  style = {},
  delay = 0,
  duration = 0.35,
  initialY = 18,
  once = true,
  margin = '-50px',
}) => {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: initialY }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * 2. SlideInBottom — Smooth upward glide for notices, banners, and headers.
 */
export const SlideInBottom: React.FC<
  AnimatedContentProps & {
    initialY?: number;
    once?: boolean;
  }
> = ({
  children,
  className = '',
  style = {},
  delay = 0.05,
  duration = 0.38,
  initialY = 24,
  once = true,
}) => {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: initialY }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * 3. ScaleIn — Soft pop-in for login cards, modals, badges, and status chips.
 */
export const ScaleIn: React.FC<
  AnimatedContentProps & {
    initialScale?: number;
    once?: boolean;
  }
> = ({
  children,
  className = '',
  style = {},
  delay = 0,
  duration = 0.32,
  initialScale = 0.96,
  once = true,
}) => {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, scale: initialScale }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * 4. SimpleFade — Pure opacity crossfade without positional shift.
 */
export const SimpleFade: React.FC<
  AnimatedContentProps & {
    once?: boolean;
  }
> = ({
  children,
  className = '',
  style = {},
  delay = 0,
  duration = 0.25,
  once = true,
}) => {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

/**
 * 5. StaggerContainer — Coordinates cascading entrance for child elements.
 */
export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = '',
  delay = 0.02,
  staggerChildren = 0.05,
  once = true,
}) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: '-20px' }}
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * 6. RevealItem — Child component designed to live inside StaggerContainer.
 */
export const RevealItem: React.FC<RevealItemProps> = ({
  children,
  className = '',
  y = 14,
}) => {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y, scale: 0.98 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.32,
            ease: [0.16, 1, 0.3, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * 7. CardRevealStagger & CardRevealItem — Specifically tuned for grid of cards (Sellers, Dishes).
 */
export const CardRevealStagger: React.FC<StaggerContainerProps> = ({
  children,
  className = '',
  delay = 0.02,
  staggerDelay = 0.04,
  once = true,
}: StaggerContainerProps & { staggerDelay?: number }) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-40px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export const CardRevealItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.985 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.35,
            ease: [0.16, 1, 0.3, 1],
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * 8. InteractiveCard — Tactile card with subtle lift on hover and tactile tap compression.
 */
export const InteractiveCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  tabIndex?: number;
  role?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
}> = ({
  children,
  className = '',
  onClick,
  tabIndex,
  role,
  onKeyDown,
}) => {
  return (
    <motion.div
      className={className}
      onClick={onClick}
      tabIndex={tabIndex}
      role={role}
      onKeyDown={onKeyDown}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      transition={{
        type: 'spring',
        stiffness: 450,
        damping: 28,
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * 9. BlurIn — Soft atmospheric entrance using subtle backdrop/filter blur.
 */
export const BlurIn: React.FC<AnimatedContentProps> = ({
  children,
  className = '',
  style = {},
  delay = 0,
  duration = 0.35,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(6px)', y: 8 }}
      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

/**
 * 10. ScrollCountUp — Silky animated numeric stat counter.
 */
export const ScrollCountUp: React.FC<{
  to: number;
  duration?: number;
  delay?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}> = ({
  to,
  duration = 1.4,
  delay = 0,
  className = '',
  suffix = '',
  prefix = '',
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(count, to, { duration, delay, ease: 'easeOut' });
    return () => controls.stop();
  }, [isInView, count, to, duration, delay]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
};

/**
 * 11. AnimatedOrderList — Container for kitchen / customer order queue with fluid layout transitions.
 */
export const AnimatedOrderList: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = 'space-y-4' }) => {
  return (
    <motion.div layout className={className}>
      {children}
    </motion.div>
  );
};

/**
 * 12. AnimatedOrderCard — Animated card for live kitchen tickets / orders with layout morphing and subtle hover elevation.
 */
export const AnimatedOrderCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  index?: number;
}> = ({ children, className = '', index = 0 }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.16 } }}
      transition={{
        duration: 0.28,
        delay: Math.min(index * 0.04, 0.2),
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export interface AnimatedStatusTabProps {
  children: React.ReactNode;
  className?: string;
  isPulseYellowWhite?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * 13. AnimatedStatusTab — Segmented status filter tab button with smooth Motion animations.
 * When isPulseYellowWhite is true, pulses between vibrant yellow and crisp white via GPU-accelerated motion.
 */
export const AnimatedStatusTab: React.FC<AnimatedStatusTabProps> = ({
  children,
  className = '',
  isPulseYellowWhite = false,
  onClick,
  type = 'button',
}) => {
  if (!isPulseYellowWhite) {
    return (
      <button
        type={type}
        onClick={onClick}
        className={className}
      >
        {children}
      </button>
    );
  }

  return (
    <motion.button
      key="pulse-yellow-white-tab"
      type={type}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      animate={{
        backgroundColor: ['#facc15', '#ffffff', '#facc15'],
        color: ['#18181b', '#18181b', '#18181b'],
        boxShadow: [
          '0 0 12px rgba(250, 204, 21, 0.55)',
          '0 0 8px rgba(255, 255, 255, 0.7)',
          '0 0 12px rgba(250, 204, 21, 0.55)',
        ],
      }}
      transition={{
        duration: 1.4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.button>
  );
};
