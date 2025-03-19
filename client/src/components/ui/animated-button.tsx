import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function AnimatedButton({
  children,
  className,
  variant = "primary",
  size = "md",
  onClick,
  href,
  disabled = false,
  type = "button"
}: AnimatedButtonProps) {
  const baseClasses = "font-heading font-semibold rounded-full inline-flex items-center justify-center transition-all";
  
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-secondary text-white hover:bg-secondary/90",
    outline: "bg-white border-2 border-primary text-primary hover:bg-primary/5"
  };
  
  const sizeClasses = {
    sm: "text-sm px-4 py-2",
    md: "px-6 py-3",
    lg: "text-lg px-8 py-4"
  };

  const ButtonContent = () => (
    <span className="relative z-10">{children}</span>
  );

  const Component = href ? motion.a : motion.button;
  
  return (
    <Component
      href={href}
      onClick={onClick}
      disabled={disabled}
      type={href ? undefined : type}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      whileHover={{ y: -3, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.07)" }}
      whileTap={{ y: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <ButtonContent />
    </Component>
  );
}