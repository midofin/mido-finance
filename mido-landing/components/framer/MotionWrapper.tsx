// MotionWrapper.tsx
"use client";
import React, { ReactNode } from 'react';
import { AnimationControls, motion, TargetAndTransition, Transition, VariantLabels, Variants } from 'framer-motion';


interface MotionWrapperProps {
    children?: ReactNode;
    variants?: Variants;
    className?: string;
    initial?: string;
    animate?: AnimationControls | TargetAndTransition | VariantLabels | boolean;
    transition?: Transition;
  }

export function MotionWrapperDiv({ children, variants=undefined, className, initial = 'hidden', animate = 'visible', transition=undefined }: MotionWrapperProps) {
  return (
    <motion.div
      initial={initial}
      animate={animate}
      variants={variants}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export function MotionWrapperSection({ children, variants=undefined, className, initial = 'hidden', animate = 'visible', transition=undefined }: MotionWrapperProps) {
  return (
    <motion.section
      initial={initial}
      animate={animate}
      variants={variants}
      transition={transition}
      className={className}
    >
      {children}
    </motion.section>
  );
};

export function MotionWrapperH2({ children, variants=undefined, className, initial = 'hidden', animate = 'visible', transition=undefined }: MotionWrapperProps) {
  return (
    <motion.h2
      initial={initial}
      animate={animate}
      variants={variants}
      transition={transition}
      className={className}
    >
      {children}
    </motion.h2>
  );
};

export function MotionWrapperP({ children, variants=undefined, className, initial = 'hidden', animate = 'visible', transition=undefined }: MotionWrapperProps) {
  return (
    <motion.p
      initial={initial}
      animate={animate}
      variants={variants}
      transition={transition}
      className={className}
    >
      {children}
    </motion.p>
  );
};