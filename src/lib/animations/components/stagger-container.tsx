import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { staggerContainerVariants } from '../variants/page-transitions';

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function StaggerContainer({ children, className, delay = 0 }: StaggerContainerProps) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
      className={className}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </motion.div>
  );
}
