import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { cardEnterVariants, cardHoverVariants, cardTapVariants } from '../variants/card-animations';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function AnimatedCard({ children, className, onClick, disabled }: AnimatedCardProps) {
  return (
    <motion.div
      variants={cardEnterVariants}
      initial="initial"
      animate="animate"
      whileHover={!disabled ? cardHoverVariants.hover : undefined}
      whileTap={!disabled ? cardTapVariants.tap : undefined}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  );
}
