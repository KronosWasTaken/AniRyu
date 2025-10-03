import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { staggerItemVariants } from '../variants/page-transitions';

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function StaggerItem({ children, className, delay = 0 }: StaggerItemProps) {
  return (
    <motion.div
      variants={staggerItemVariants}
      initial="initial"
      animate="animate"
      className={className}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </motion.div>
  );
}
