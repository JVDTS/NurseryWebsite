import { ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

interface ParentInfoLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  icon: ReactNode;
}

export default function ParentInfoLayout({ children, title, subtitle, icon }: ParentInfoLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1">
        {/* Header */}
        <motion.section 
          className="pt-32 pb-16 bg-primary/10"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="bg-white rounded-full h-20 w-20 flex items-center justify-center shadow-md">
                <div className="text-primary text-3xl">
                  {icon}
                </div>
              </div>
              
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">{title}</h1>
                <p className="mt-2 text-muted-foreground text-lg max-w-2xl">{subtitle}</p>
              </div>
            </div>
          </div>
        </motion.section>
        
        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {children}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}