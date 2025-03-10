import { useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About Us" },
    { href: "#mission", label: "Our Mission" },
    { href: "#nurseries", label: "Our Nurseries" },
  ];

  return (
    <header className="fixed w-full bg-white bg-opacity-95 shadow-sm z-50">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-heading font-bold text-xl">CMC</span>
            </div>
            <span className="ml-3 font-heading font-bold text-lg text-primary">Coat of Many Colours</span>
          </div>
          
          <div className="hidden md:flex space-x-6 items-center">
            {navLinks.map(link => (
              <a 
                key={link.href}
                href={link.href} 
                className="font-heading font-semibold text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a 
              href="#contact" 
              className="ml-2 px-5 py-2 bg-primary hover:bg-opacity-90 text-white font-heading font-semibold rounded-full transition-all shadow-md hover:shadow-lg"
            >
              Contact Us
            </a>
          </div>
          
          <button 
            className="md:hidden text-foreground"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>
        
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="flex flex-col space-y-4 py-4">
                {navLinks.map(link => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="font-heading font-semibold py-2 px-4 rounded-md hover:bg-gray-100"
                    onClick={closeMenu}
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href="#contact"
                  className="font-heading font-semibold py-2 px-4 bg-primary text-white rounded-md text-center"
                  onClick={closeMenu}
                >
                  Contact Us
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
