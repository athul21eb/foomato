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

/**
 * 14. AnimatedDetailTransition — Smooth slide-in and fade transition when viewing order details inside a tab.
 */
export const AnimatedDetailTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -18 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * 15. AnimatedStepItem — Micro-animated milestone stepper element with scale hover and entrance.
 */
export const AnimatedStepItem: React.FC<{
  children: React.ReactNode;
  isCurrent?: boolean;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * 16. AnimatedReceiptRow — Staggered itemized dish rows in receipts.
 */
export const AnimatedReceiptRow: React.FC<{
  children: React.ReactNode;
  index?: number;
  className?: string;
}> = ({ children, index = 0, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.24,
        delay: Math.min(index * 0.03, 0.2),
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * 17. AnimatedLivePulseBadge — Gently pulsing ambient container for live tracking indicators.
 */
export const AnimatedLivePulseBadge: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <motion.div
      animate={{ scale: [1, 1.015, 1] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * 18. AnimatedDutyBeacon — Radar ping ripple aura around live GPS / duty status indicators.
 */
export const AnimatedDutyBeacon: React.FC<{
  children: React.ReactNode;
  active?: boolean;
  color?: string; // Tailwind color e.g. "bg-emerald-500"
  className?: string;
}> = ({ children, active = false, color = 'bg-emerald-500', className = '' }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {active && (
        <>
          <motion.span
            className={`absolute inset-0 rounded-full ${color} opacity-40 pointer-events-none`}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
          <motion.span
            className={`absolute inset-0 rounded-full ${color} opacity-30 pointer-events-none`}
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{ scale: [1, 1.7], opacity: [0.4, 0] }}
            transition={{
              duration: 1.8,
              delay: 0.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

/**
 * 19. AnimatedGlowContainer — Ambient breathing container glow for active duty or hero surfaces.
 */
export const AnimatedGlowContainer: React.FC<{
  children: React.ReactNode;
  active?: boolean;
  className?: string;
  glowColor?: string; // hex or rgba
}> = ({
  children,
  active = false,
  className = '',
  glowColor = 'rgba(16, 185, 129, 0.18)',
}) => {
  return (
    <motion.div
      animate={
        active
          ? {
              boxShadow: [
                `0 0 0 1px rgba(16,185,129,0.25), 0 10px 25px -5px ${glowColor}`,
                `0 0 0 1px rgba(16,185,129,0.45), 0 15px 35px -5px ${glowColor}`,
                `0 0 0 1px rgba(16,185,129,0.25), 0 10px 25px -5px ${glowColor}`,
              ],
            }
          : {
              boxShadow: '0 0 0 1px rgba(0,0,0,0)',
            }
      }
      transition={{
        duration: 2.8,
        repeat: active ? Infinity : 0,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * 20. AnimatedShimmerBadge — Polished badge with specular shine sweep effect.
 */
export const AnimatedShimmerBadge: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`relative overflow-hidden inline-flex items-center ${className}`}>
      {children}
      <motion.div
        className="absolute inset-0 -translate-x-full pointer-events-none bg-linear-to-r from-transparent via-white/25 to-transparent skew-x-12"
        animate={{ translateX: ['-100%', '200%'] }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          repeatDelay: 3.5,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

/**
 * 21. AnimatedBentoStatCard — Spring-elevated stat card with fluid hover dynamics.
 */
export const AnimatedBentoStatCard: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.38,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        y: -4,
        scale: 1.015,
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * 22. AnimatedNumberTicker — Smooth numeric counting animation for metrics & stats.
 */
export const AnimatedNumberTicker: React.FC<{
  value: number;
  direction?: 'up' | 'down';
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}> = ({
  value,
  decimals = 0,
  suffix = '',
  prefix = '',
  className = '',
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);
  const isInView = useInView(ref, { once: true, margin: '-20px' });

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(motionVal, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        if (ref.current) {
          ref.current.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`;
        }
      },
    });
    return () => controls.stop();
  }, [isInView, value, decimals, prefix, suffix, motionVal]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
};

/**
 * 23. AnimatedTabContent — Smooth fluid transition when switching between tabs.
 */
export const AnimatedTabContent: React.FC<{
  children: React.ReactNode;
  activeKey: string;
  className?: string;
}> = ({ children, activeKey, className = '' }) => {
  return (
    <motion.div
      key={activeKey}
      initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -10, filter: 'blur(2px)' }}
      transition={{
        duration: 0.28,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * 24. AnimatedSidebarTab — Micro-interactive sidebar button with active pill backdrop.
 */
export const AnimatedSidebarTab: React.FC<{
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}> = ({ children, isActive, onClick, className = '' }) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.01, x: 2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`relative w-full text-left cursor-pointer select-none transition-colors ${className}`}
    >
      {isActive && (
        <motion.div
          layoutId="riderActiveSidebarTab"
          className="absolute inset-0 rounded-2xl bg-linear-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/25 -z-10"
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 32,
          }}
        />
      )}
      {children}
    </motion.button>
  );
};

/**
 * 25. AnimatedLockBadge — Subtle floating/pulsing lock badge for restricted features.
 */
export const AnimatedLockBadge: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <motion.div
      animate={{
        y: [0, -3, 0],
      }}
      transition={{
        duration: 2.8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`inline-flex items-center ${className}`}
    >
      {children}
    </motion.div>
  );
};

/**
 * 26. AnimatedVerificationCard — Glowing attention card for verification-in-progress screens.
 */
export const AnimatedVerificationCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

