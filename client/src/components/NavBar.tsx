import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNurseriesDropdown, setShowNurseriesDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const nurseriesRef = useRef<HTMLDivElement>(null);
  
  // Handle scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (nurseriesRef.current && !nurseriesRef.current.contains(event.target as Node)) {
        setShowNurseriesDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [nurseriesRef]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  const toggleNurseriesDropdown = () => {
    setShowNurseriesDropdown(!showNurseriesDropdown);
  };

  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About Us" },
    { href: "#mission", label: "Our Mission" },
  ];
  
  const nurseryLocations = [
    { href: "#islington", label: "Islington" },
    { href: "#camden", label: "Camden" },
    { href: "#greenwich", label: "Greenwich" },
  ];

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'py-2 bg-white/90 backdrop-blur-sm shadow-md' : 'py-4 bg-white/70 backdrop-blur-sm'}`}>
      <div className="container mx-auto px-4">
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
            
            {/* Nurseries dropdown menu */}
            <div className="relative" ref={nurseriesRef}>
              <button 
                onClick={toggleNurseriesDropdown}
                className="font-heading font-semibold text-foreground hover:text-primary transition-colors flex items-center"
              >
                Our Nurseries
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showNurseriesDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showNurseriesDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-lg shadow-xl z-50"
                  >
                    {nurseryLocations.map(location => (
                      <a
                        key={location.href}
                        href={location.href}
                        className="block px-4 py-2 text-sm font-heading font-medium text-foreground hover:bg-primary hover:text-white transition-colors"
                        onClick={() => setShowNurseriesDropdown(false)}
                      >
                        {location.label}
                      </a>
                    ))}
                    <div className="border-t border-gray-100 my-1"></div>
                    <a
                      href="#nurseries"
                      className="block px-4 py-2 text-sm font-heading font-medium text-foreground hover:bg-primary hover:text-white transition-colors"
                      onClick={() => setShowNurseriesDropdown(false)}
                    >
                      View All Nurseries
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
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
                
                {/* Mobile nurseries dropdown */}
                <div className="relative">
                  <button 
                    onClick={toggleNurseriesDropdown}
                    className="font-heading w-full text-left font-semibold py-2 px-4 rounded-md hover:bg-gray-100 flex items-center justify-between"
                  >
                    Our Nurseries
                    <ChevronDown className={`h-4 w-4 transition-transform ${showNurseriesDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showNurseriesDropdown && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pl-6"
                      >
                        {nurseryLocations.map(location => (
                          <a
                            key={location.href}
                            href={location.href}
                            className="block py-2 px-4 font-heading font-medium text-gray-600 hover:text-primary"
                            onClick={closeMenu}
                          >
                            {location.label}
                          </a>
                        ))}
                        <a
                          href="#nurseries"
                          className="block py-2 px-4 font-heading font-medium text-gray-600 hover:text-primary"
                          onClick={closeMenu}
                        >
                          View All Nurseries
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
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
