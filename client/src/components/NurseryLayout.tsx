import { useEffect } from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { motion } from "framer-motion";

interface NurseryLayoutProps {
  children: React.ReactNode;
  title: string;
  heroImage: string;
  themeColor?: string;
}

export default function NurseryLayout({ children, title, heroImage, themeColor = "primary" }: NurseryLayoutProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Create CSS variables for theme color
  const themeStyles = {
    "--theme-color": `var(--${themeColor})`,
    "--theme-color-foreground": `var(--${themeColor}-foreground)`
  } as React.CSSProperties;

  return (
    <div className="flex flex-col min-h-screen" style={themeStyles}>
      <NavBar />
      
      <div className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30" />
        </div>
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold text-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {title}
          </motion.h1>
          <motion.div 
            style={{ backgroundColor: `hsl(var(--${themeColor}))` }} 
            className="w-20 h-1 mb-6"
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ duration: 1, delay: 0.4 }}
          />
        </div>
      </div>
      
      <main className="flex-grow theme-context">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}