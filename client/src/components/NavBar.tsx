import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import ScrollToTopLink from "./ScrollToTopLink";

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
    { href: "/parent-info/sample-menu", label: "Menus" },
    { href: "/parent-info/term-dates", label: "Term Dates" },
    { href: "/parent-info/fees", label: "Fees" },
  ];

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 px-1 sm:px-4 ${isScrolled ? 'py-1' : 'py-1 sm:py-4'}`}>
      <div className="max-w-[90rem] mx-auto">
        <nav className="flex justify-between items-center rounded-xl sm:rounded-full px-2 sm:px-8 py-2 sm:py-4 bg-white/90 backdrop-blur-sm shadow-md mx-1">
          <div className="flex items-center flex-shrink-0">
            <button 
              className="lg:hidden flex items-center justify-center p-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors mr-1"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
            
            <ScrollToTopLink href="/" className="flex items-center">
              <img 
                src="/images/cmc-logo.png" 
                alt="CMC Logo" 
                className="w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 shrink-0 object-contain"
              />
              <span className="ml-1 md:ml-3 font-heading font-bold text-xs sm:text-sm md:text-lg text-primary truncate max-w-[80px] sm:max-w-full">
                <span className={isMobile ? "inline" : "hidden"}>CMC Nursery</span>
                <span className={!isMobile ? "inline" : "hidden"}>Coat of Many Colours</span>
              </span>
            </ScrollToTopLink>
          </div>
          
          <div className="hidden lg:flex space-x-2 lg:space-x-10 items-center">
            {navLinks.map(link => (
              <ScrollToTopLink 
                key={link.href}
                href={link.href} 
                className="font-heading font-semibold text-gray-800 hover:text-orange-500 transition-colors text-sm lg:text-lg"
              >
                {link.label}
              </ScrollToTopLink>
            ))}
            
            {/* Nurseries dropdown menu */}
            <div className="relative" ref={nurseriesRef}>
              <button 
                onClick={toggleNurseriesDropdown}
                className="font-heading font-semibold text-gray-800 hover:text-orange-500 transition-colors flex items-center text-sm lg:text-lg"
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
                      <ScrollToTopLink
                        key={location.href}
                        href={location.href}
                        className="block px-4 py-2 text-sm font-heading font-medium text-foreground hover:bg-primary hover:text-white transition-colors"
                        onClick={() => setShowNurseriesDropdown(false)}
                      >
                        {location.label}
                      </ScrollToTopLink>
                    ))}
                    <div className="border-t border-gray-100 my-1"></div>
                    <ScrollToTopLink
                      href="/#nurseries"
                      className="block px-4 py-2 text-sm font-heading font-medium text-foreground hover:bg-primary hover:text-white transition-colors"
                      onClick={() => setShowNurseriesDropdown(false)}
                    >
                      View All Nurseries
                    </ScrollToTopLink>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Parent Info dropdown menu */}
            <div className="relative" ref={parentInfoRef}>
              <button 
                onClick={toggleParentInfoDropdown}
                className="font-heading font-semibold text-gray-800 hover:text-orange-500 transition-colors flex items-center text-sm lg:text-lg"
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
                      <ScrollToTopLink
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-sm font-heading font-medium text-foreground hover:bg-primary hover:text-white transition-colors"
                        onClick={() => setShowParentInfoDropdown(false)}
                      >
                        {item.label}
                      </ScrollToTopLink>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Newsletters link */}
            <ScrollToTopLink 
              href="/newsletters" 
              className="font-heading font-semibold text-gray-800 hover:text-orange-500 transition-colors text-sm lg:text-lg"
            >
              Newsletters
            </ScrollToTopLink>
            
            {/* Gallery link */}
            <ScrollToTopLink 
              href="/gallery" 
              className="font-heading font-semibold text-gray-800 hover:text-orange-500 transition-colors text-sm lg:text-lg"
            >
              Gallery
            </ScrollToTopLink>
            
            <a 
              href="#contact" 
              className="ml-2 lg:ml-4 px-3 lg:px-5 py-2 border-b border-orange-500 text-gray-800 font-heading font-semibold transition-all hover:border-gray-800 text-sm lg:text-lg"
            >
              Get In Touch
            </a>

          </div>
          
          <div className="lg:block hidden">
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
              className="lg:hidden overflow-hidden mt-1 fixed left-1 right-1 sm:left-4 sm:right-4 top-[55px] bottom-auto z-50"
            >
              <div className="flex flex-col space-y-1 py-2 px-1 sm:px-4 bg-white/95 backdrop-blur-md rounded-xl shadow-lg max-h-[calc(100vh-80px)] overflow-y-auto">
                {navLinks.map(link => (
                  <ScrollToTopLink
                    key={link.href}
                    href={link.href}
                    className="font-heading font-semibold py-2 px-3 sm:px-4 rounded-md hover:bg-gray-100 text-sm sm:text-base flex items-center"
                    onClick={closeMenu}
                  >
                    {link.label}
                  </ScrollToTopLink>
                ))}
                
                {/* Mobile nurseries dropdown */}
                <div className="relative">
                  <button 
                    onClick={toggleNurseriesDropdown}
                    className="font-heading w-full text-left font-semibold py-2 px-3 sm:px-4 rounded-md hover:bg-gray-100 flex items-center justify-between text-sm sm:text-base"
                  >
                    Our Nurseries
                    <ChevronDown className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform ${showNurseriesDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showNurseriesDropdown && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pl-3 sm:pl-4 mt-1 mb-1 bg-gray-50/80 rounded-md"
                      >
                        {nurseryLocations.map(location => (
                          <ScrollToTopLink
                            key={location.href}
                            href={location.href}
                            className="block py-2 px-3 sm:px-4 font-heading font-medium text-gray-600 hover:text-primary text-xs sm:text-sm"
                            onClick={closeMenu}
                          >
                            {location.label}
                          </ScrollToTopLink>
                        ))}
                        <ScrollToTopLink
                          href="/#nurseries"
                          className="block py-2 px-3 sm:px-4 font-heading font-medium text-gray-600 hover:text-primary border-t border-gray-100 text-xs sm:text-sm"
                          onClick={closeMenu}
                        >
                          View All Nurseries
                        </ScrollToTopLink>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Mobile parent info dropdown */}
                <div className="relative">
                  <button 
                    onClick={toggleParentInfoDropdown}
                    className="font-heading w-full text-left font-semibold py-2 px-3 sm:px-4 rounded-md hover:bg-gray-100 flex items-center justify-between text-sm sm:text-base"
                  >
                    Parent Info
                    <ChevronDown className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform ${showParentInfoDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showParentInfoDropdown && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pl-3 sm:pl-4 mt-1 mb-1 bg-gray-50/80 rounded-md"
                      >
                        {parentInfoItems.map((item, index) => (
                          <ScrollToTopLink
                            key={item.href}
                            href={item.href}
                            className={`block py-2 px-3 sm:px-4 font-heading font-medium text-gray-600 hover:text-primary text-xs sm:text-sm ${index > 0 ? 'border-t border-gray-50' : ''}`}
                            onClick={closeMenu}
                          >
                            {item.label}
                          </ScrollToTopLink>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Mobile newsletters link */}
                <ScrollToTopLink
                  href="/newsletters"
                  className="font-heading font-semibold py-2 px-3 sm:px-4 rounded-md hover:bg-gray-100 text-sm sm:text-base flex items-center"
                  onClick={closeMenu}
                >
                  Newsletters
                </ScrollToTopLink>
                
                {/* Mobile gallery link */}
                <ScrollToTopLink
                  href="/gallery"
                  className="font-heading font-semibold py-2 px-3 sm:px-4 rounded-md hover:bg-gray-100 text-sm sm:text-base flex items-center"
                  onClick={closeMenu}
                >
                  Gallery
                </ScrollToTopLink>
                
                <a
                  href="#contact"
                  className="font-heading font-semibold py-2 px-3 sm:px-4 rounded-md hover:bg-gray-100 text-sm sm:text-base flex items-center justify-center border-b border-orange-500"
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