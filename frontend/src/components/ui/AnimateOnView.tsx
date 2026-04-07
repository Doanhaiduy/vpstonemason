'use client';

import { motion, type Variants } from 'framer-motion';
import type { ReactNode, CSSProperties } from 'react';

interface AnimateOnViewProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  once?: boolean;
  style?: CSSProperties;
  /** Use animate instead of whileInView (for hero sections that should animate on mount) */
  animateOnMount?: boolean;
}

const getVariants = (direction: string, distance: number): Variants => {
  const initial: Record<string, number> = { opacity: 0 };

  switch (direction) {
    case 'up':
      initial.y = distance;
      break;
    case 'down':
      initial.y = -distance;
      break;
    case 'left':
      initial.x = distance;
      break;
    case 'right':
      initial.x = -distance;
      break;
  }

  return {
    hidden: initial,
    visible: { opacity: 1, x: 0, y: 0 },
  };
};

export function AnimateOnView({
  children,
  className,
  delay = 0,
  duration = 0.6,
  direction = 'up',
  distance = 20,
  once = true,
  style,
  animateOnMount = false,
}: AnimateOnViewProps) {
  const variants = getVariants(direction, distance);

  if (animateOnMount) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={variants}
        transition={{ duration, delay }}
        className={className}
        style={style}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      variants={variants}
      transition={{ duration, delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
