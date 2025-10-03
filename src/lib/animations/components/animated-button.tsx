import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { buttonHoverVariants, buttonTapVariants, buttonLoadingVariants } from '../variants/button-animations';

interface AnimatedButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function AnimatedButton({ 
  children, 
  className, 
  onClick, 
  disabled = false, 
  loading = false,
  type = 'button'
}: AnimatedButtonProps) {
  return (
    <motion.button
      type={type}
      variants={buttonLoadingVariants}
      animate={loading ? "loading" : "initial"}
      whileHover={!disabled && !loading ? buttonHoverVariants.hover : undefined}
      whileTap={!disabled && !loading ? buttonTapVariants.tap : undefined}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
    >
      {children}
    </motion.button>
  );
}
