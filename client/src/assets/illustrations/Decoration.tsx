import { motion } from "framer-motion";

interface DecorationProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  color: string;
  animationType?: "float" | "bounce" | "wiggle";
  delay?: number;
}

export default function Decoration({ 
  className = "", 
  size = "md", 
  color, 
  animationType = "float",
  delay = 0
}: DecorationProps) {
  
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32"
  };
  
  const getAnimation = () => {
    switch (animationType) {
      case "float":
        return { 
          y: [0, -15, 0],
          transition: { 
            repeat: Infinity, 
            duration: 6, 
            ease: "easeInOut",
            delay
          }
        };
      case "bounce":
        return { 
          y: [0, -10, 0],
          transition: { 
            repeat: Infinity, 
            duration: 3, 
            ease: "easeOut",
            delay
          }
        };
      case "wiggle":
        return { 
          rotate: [-3, 3, -3],
          transition: { 
            repeat: Infinity, 
            duration: 2, 
            ease: "easeInOut",
            delay
          }
        };
      default:
        return {};
    }
  };

  return (
    <motion.div 
      className={`${sizeClasses[size]} ${color} rounded-full opacity-70 ${className}`}
      animate={getAnimation().y || getAnimation().rotate}
      transition={getAnimation().transition}
    />
  );
}
