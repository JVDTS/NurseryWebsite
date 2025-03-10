import { motion } from "framer-motion";

interface CloudProps {
  className?: string;
  text: string;
  textColor: string;
  delay?: number;
}

export default function Cloud({ className = "", text, textColor, delay = 0 }: CloudProps) {
  return (
    <motion.div 
      className={`bg-white p-4 rounded-xl shadow-md ${className}`}
      animate={{ 
        y: [0, -15, 0] 
      }}
      transition={{ 
        repeat: Infinity, 
        duration: 6, 
        ease: "easeInOut",
        delay: delay 
      }}
    >
      <p className={`text-sm font-medium ${textColor}`}>{text}</p>
    </motion.div>
  );
}
