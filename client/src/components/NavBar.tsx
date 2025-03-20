import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNurseriesDropdown, setShowNurseriesDropdown] = useState(false);
  const [showParentInfoDropdown, setShowParentInfoDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const nurseriesRef = useRef<HTMLDivElement>(null);
  const parentInfoRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
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
      if (parentInfoRef.current && !parentInfoRef.current.contains(event.target as Node)) {
        setShowParentInfoDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [nurseriesRef, parentInfoRef]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  const toggleNurseriesDropdown = () => {
    setShowNurseriesDropdown(!showNurseriesDropdown);
    if (showParentInfoDropdown) setShowParentInfoDropdown(false);
  };
  
  const toggleParentInfoDropdown = () => {
    setShowParentInfoDropdown(!showParentInfoDropdown);
    if (showNurseriesDropdown) setShowNurseriesDropdown(false);
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/mission", label: "Our Mission" },
  ];
  
  const nurseryLocations = [
    { href: "/nurseries/hayes", label: "Hayes" },
    { href: "/nurseries/uxbridge", label: "Uxbridge" },
    { href: "/nurseries/hounslow", label: "Hounslow" },
  ];
  
  const parentInfoItems = [
    { href: "/parent-info/policies", label: "Policies" },
    { href: "/parent-info/daily-routine", label: "Daily Routine" },
    { href: "/parent-info/sample-menu", label: "Sample Menu" },
    { href: "/parent-info/term-dates", label: "Term Dates" },
    { href: "/parent-info/fees", label: "Fees" },
  ];

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 px-1 sm:px-4 ${isScrolled ? 'py-1' : 'py-1 sm:py-2'}`}>
      <div className="max-w-[90rem] mx-auto">
        <nav className="flex justify-between items-center rounded-full px-3 sm:px-6 py-2 sm:py-2 bg-white/90 backdrop-blur-sm shadow-md">
          <div className="flex items-center flex-grow-0">
            <button 
              className="md:hidden flex items-center justify-center p-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors mr-1"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
            <Link href="/" className="flex items-center">
              <div className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center shrink-0">
                <span className="text-white font-heading font-bold text-xs sm:text-base md:text-xl">CMC</span>
              </div>
              <span className="ml-1 md:ml-3 font-heading font-bold text-xs sm:text-sm md:text-lg text-primary truncate max-w-[100px] sm:max-w-full">
                <span className={isMobile ? "inline" : "hidden"}>CMC Nursery</span>
                <span className={!isMobile ? "inline" : "hidden"}>Coat of Many Colours</span>
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-6 lg:space-x-10 items-center">
            {navLinks.map(link => (
              <Link 
                key={link.href}
                href={link.href} 
                className="font-heading font-semibold text-gray-800 hover:text-orange-500 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            
            {/* Nurseries dropdown menu */}
            <div className="relative" ref={nurseriesRef}>
              <button 
                onClick={toggleNurseriesDropdown}
                className="font-heading font-semibold text-gray-800 hover:text-orange-500 transition-colors flex items-center"
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
                      <Link
                        key={location.href}
                        href={location.href}
                        className="block px-4 py-2 text-sm font-heading font-medium text-foreground hover:bg-primary hover:text-white transition-colors"
                        onClick={() => setShowNurseriesDropdown(false)}
                      >
                        {location.label}
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 my-1"></div>
                    <Link
                      href="/#nurseries"
                      className="block px-4 py-2 text-sm font-heading font-medium text-foreground hover:bg-primary hover:text-white transition-colors"
                      onClick={() => setShowNurseriesDropdown(false)}
                    >
                      View All Nurseries
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Parent Info dropdown menu */}
            <div className="relative" ref={parentInfoRef}>
              <button 
                onClick={toggleParentInfoDropdown}
                className="font-heading font-semibold text-gray-800 hover:text-orange-500 transition-colors flex items-center"
              >
                Parent Info
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showParentInfoDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showParentInfoDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-lg shadow-xl z-50"
                  >
                    {parentInfoItems.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-sm font-heading font-medium text-foreground hover:bg-primary hover:text-white transition-colors"
                        onClick={() => setShowParentInfoDropdown(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Newsletters link */}
            <Link 
              href="/newsletters" 
              className="font-heading font-semibold text-gray-800 hover:text-orange-500 transition-colors"
            >
              Newsletters
            </Link>
            
            <a 
              href="#contact" 
              className="ml-4 px-5 py-2 border-b border-orange-500 text-gray-800 font-heading font-semibold transition-all hover:border-gray-800"
            >
              Get In Touch
            </a>

          </div>
          
          <div className="md:block hidden">
            {/* Placeholder for desktop layout balance */}
          </div>
        </nav>
        
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden mt-2 fixed left-2 right-2 sm:left-4 sm:right-4 top-[50px] bottom-auto z-50"
            >
              <div className="flex flex-col space-y-1 py-2 px-2 sm:px-4 bg-white/95 backdrop-blur-md rounded-xl shadow-lg max-h-[calc(100vh-70px)] overflow-y-auto">
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="font-heading font-semibold py-2.5 px-4 rounded-md hover:bg-gray-100 text-base flex items-center"
                    onClick={closeMenu}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {/* Mobile nurseries dropdown */}
                <div className="relative">
                  <button 
                    onClick={toggleNurseriesDropdown}
                    className="font-heading w-full text-left font-semibold py-2.5 px-4 rounded-md hover:bg-gray-100 flex items-center justify-between text-base"
                  >
                    Our Nurseries
                    <ChevronDown className={`h-5 w-5 transition-transform ${showNurseriesDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showNurseriesDropdown && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pl-4 mt-1 mb-1 bg-gray-50/80 rounded-md"
                      >
                        {nurseryLocations.map(location => (
                          <Link
                            key={location.href}
                            href={location.href}
                            className="block py-3 px-4 font-heading font-medium text-gray-600 hover:text-primary"
                            onClick={closeMenu}
                          >
                            {location.label}
                          </Link>
                        ))}
                        <Link
                          href="/#nurseries"
                          className="block py-3 px-4 font-heading font-medium text-gray-600 hover:text-primary border-t border-gray-100"
                          onClick={closeMenu}
                        >
                          View All Nurseries
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Mobile parent info dropdown */}
                <div className="relative">
                  <button 
                    onClick={toggleParentInfoDropdown}
                    className="font-heading w-full text-left font-semibold py-2.5 px-4 rounded-md hover:bg-gray-100 flex items-center justify-between text-base"
                  >
                    Parent Info
                    <ChevronDown className={`h-5 w-5 transition-transform ${showParentInfoDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showParentInfoDropdown && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pl-4 mt-1 mb-1 bg-gray-50/80 rounded-md"
                      >
                        {parentInfoItems.map((item, index) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`block py-3 px-4 font-heading font-medium text-gray-600 hover:text-primary ${index > 0 ? 'border-t border-gray-50' : ''}`}
                            onClick={closeMenu}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Mobile newsletters link */}
                <Link
                  href="/newsletters"
                  className="font-heading font-semibold py-2.5 px-4 rounded-md hover:bg-gray-100 text-base flex items-center"
                  onClick={closeMenu}
                >
                  Newsletters
                </Link>
                
                <a
                  href="#contact"
                  className="font-heading font-semibold py-2.5 px-4 rounded-md hover:bg-gray-100 text-base flex items-center justify-center border-b border-orange-500"
                  onClick={closeMenu}
                >
                  Get In Touch
                </a>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
