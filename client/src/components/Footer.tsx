import { Link } from "wouter";
import { Mail, Phone, Clock, Facebook, Instagram } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-2 mb-8">
            <div className="flex flex-col items-center md:items-start">
              <img 
                src="/images/cmc-logo.png" 
                alt="CMC Logo" 
                className="w-48 h-48 object-contain mb-4"
              />
              <span className="font-heading font-bold text-2xl text-white mb-4">Coat of Many Colours</span>
            </div>
            
            <p className="text-gray-400 mb-6 text-center md:text-left">
              A nursery dedicated to nurturing happy, healthy, and conscious children through mindfulness, nature connection, and personalized care.
            </p>
            
            <div className="flex space-x-4 justify-center md:justify-start">
              <a href="#" className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-all">
                <Facebook size={22} />
              </a>
              <a href="#" className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-all">
                <Instagram size={22} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-heading font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/mission" className="text-gray-400 hover:text-white transition-colors">Our Mission</Link></li>
              <li><Link href="/#nurseries" className="text-gray-400 hover:text-white transition-colors">Our Nurseries</Link></li>
              <li><Link href="/newsletters" className="text-gray-400 hover:text-white transition-colors">Newsletters</Link></li>
              <li><Link href="/#contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-bold text-lg mb-6">Parent Info</h4>
            <ul className="space-y-3">
              <li><Link href="/parent-info/daily-routine" className="text-gray-400 hover:text-white transition-colors">Daily Routine</Link></li>
              <li><Link href="/parent-info/sample-menu" className="text-gray-400 hover:text-white transition-colors">Sample Menu</Link></li>
              <li><Link href="/parent-info/term-dates" className="text-gray-400 hover:text-white transition-colors">Term Dates</Link></li>
              <li><Link href="/parent-info/fees" className="text-gray-400 hover:text-white transition-colors">Fees</Link></li>
              <li><Link href="/parent-info/policies" className="text-gray-400 hover:text-white transition-colors">Policies</Link></li>
              <li><Link href="/newsletters" className="text-gray-400 hover:text-white transition-colors">Newsletters</Link></li>
              <li><Link href="/#contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-bold text-lg mb-6">Our Nurseries</h4>
            <ul className="space-y-3">
              <li><Link href="/nurseries/hayes" className="text-gray-400 hover:text-white transition-colors">Hayes - 192 Church Road, UB3 2LT</Link></li>
              <li><Link href="/nurseries/uxbridge" className="text-gray-400 hover:text-white transition-colors">Uxbridge - 4 New Windsor Street, UB8 2TU</Link></li>
              <li><Link href="/nurseries/hounslow" className="text-gray-400 hover:text-white transition-colors">Hounslow - 488, 490 Great West Rd, TW5 0TA</Link></li>
              <li><Link href="/#contact" className="text-gray-400 hover:text-white transition-colors">Book a Tour</Link></li>
              <li><Link href="/parent-info/fees" className="text-gray-400 hover:text-white transition-colors">Fees & Enrollment</Link></li>
              <li><Link href="/parent-info/term-dates" className="text-gray-400 hover:text-white transition-colors">Term Dates</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-bold text-lg mb-6">Get in Touch</h4>
            <ul className="space-y-4">
              <li className="flex">
                <Mail className="mr-3 mt-1 text-primary" size={18} />
                <span className="text-gray-400">admin@cmcnursery.co.uk</span>
              </li>
              <li className="flex">
                <Phone className="mr-3 mt-1 text-primary" size={18} />
                <span className="text-gray-400">01895 272885</span>
              </li>
              <li className="flex">
                <Clock className="mr-3 mt-1 text-primary" size={18} />
                <span className="text-gray-400">Mon-Fri: 7:30AM-6PM</span>
              </li>
            </ul>
            
            <div className="mt-6">
              <Link href="/#contact" className="inline-block px-6 py-2 bg-primary text-white font-heading font-semibold rounded-lg transition-all hover:bg-opacity-90">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-center md:text-left mb-4 md:mb-0">
            &copy; {currentYear} Coat of Many Colours Nursery. All rights reserved.
          </p>
          
          <div className="flex space-x-6">
            <Link href="/parent-info/policies" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/parent-info/policies" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/parent-info/policies" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
