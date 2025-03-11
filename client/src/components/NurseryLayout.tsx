import React from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";

interface NurseryLayoutProps {
  children: React.ReactNode;
  title: string;
  heroImage: string;
}

export default function NurseryLayout({ children, title, heroImage }: NurseryLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      {/* Hero Section */}
      <section className="pt-24 relative">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${heroImage})`,
              filter: 'brightness(0.7)'
            }}
          />
        </div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <motion.h1 
            className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {title}
          </motion.h1>
        </div>
      </section>
      
      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}