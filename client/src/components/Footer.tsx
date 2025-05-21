import { Link } from "wouter";
import { Mail, Phone, Clock, Facebook, Instagram } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-1 mb-4">
            <div className="flex flex-col items-center md:items-start">
              <img 
                src="/images/cmc-logo.png" 
                alt="CMC Logo" 
                className="w-24 h-24 object-contain mb-2"
              />
              <span className="font-heading font-bold text-xl text-white mb-2">Coat of Many Colours</span>
            </div>
            
            <p className="text-gray-400 mb-4 text-center md:text-left text-sm">
              Nurturing happy, healthy children through mindfulness and personalized care.
            </p>
            
            <div className="flex space-x-3 justify-center md:justify-start">
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-all">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-all">
                <Instagram size={16} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-heading font-bold text-base mb-3">Quick Links</h4>
            <ul className="space-y-1 text-sm">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/mission" className="text-gray-400 hover:text-white transition-colors">Our Mission</Link></li>
              <li><a href="/#nurseries" className="text-gray-400 hover:text-white transition-colors">Our Nurseries</a></li>
              <li><Link href="/newsletters" className="text-gray-400 hover:text-white transition-colors">Newsletters</Link></li>
              <li><a href="/#contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-bold text-base mb-3">Parent Info</h4>
            <ul className="space-y-1 text-sm">
              <li><Link href="/parent-info/daily-routine" className="text-gray-400 hover:text-white transition-colors">Daily Routine</Link></li>
              <li><Link href="/parent-info/sample-menu" className="text-gray-400 hover:text-white transition-colors">Sample Menu</Link></li>
              <li><Link href="/parent-info/term-dates" className="text-gray-400 hover:text-white transition-colors">Term Dates</Link></li>
              <li><Link href="/parent-info/fees" className="text-gray-400 hover:text-white transition-colors">Fees</Link></li>
              <li><Link href="/parent-info/policies" className="text-gray-400 hover:text-white transition-colors">Policies</Link></li>
              <li><Link href="/newsletters" className="text-gray-400 hover:text-white transition-colors">Newsletters</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-bold text-base mb-3">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex">
                <Mail className="mr-2 mt-0.5 text-primary" size={14} />
                <span className="text-gray-400">admin@cmcnursery.co.uk</span>
              </li>
              <li className="flex">
                <Phone className="mr-2 mt-0.5 text-primary" size={14} />
                <span className="text-gray-400">01895 272885</span>
              </li>
              <li className="flex">
                <Clock className="mr-2 mt-0.5 text-primary" size={14} />
                <span className="text-gray-400">Mon-Fri: 7:30AM-6PM</span>
              </li>
            </ul>
            
            <div className="mt-3">
              <Link href="/#contact" className="inline-block px-4 py-1.5 bg-primary text-white font-heading font-semibold rounded-lg transition-all hover:bg-opacity-90 text-sm">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-6 pt-4 flex flex-col md:flex-row justify-between items-center text-xs">
          <p className="text-gray-400 text-center md:text-left mb-2 md:mb-0">
            &copy; {currentYear} Coat of Many Colours Nursery. All rights reserved.
          </p>
          
          <div className="flex space-x-4">
            <Link href="/parent-info/policies" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/parent-info/policies" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/parent-info/policies" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
