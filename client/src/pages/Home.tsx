import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import MissionSection from "@/components/MissionSection";
import NurseriesSection from "@/components/NurseriesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import GallerySection from "@/components/GallerySection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

export default function Home() {
  return (
    <>
      <SEO 
        title="Little Blossoms Nursery | Childcare in Hayes, Uxbridge & Hounslow" 
        description="Providing exceptional childcare services in Hayes, Uxbridge, and Hounslow with a safe, nurturing environment for children to grow and learn."
      />
      
      <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full">
        <header>
          <NavBar />
          <HeroSection />
        </header>
        
        <main>
          <AboutSection />
          <MissionSection />
          <NurseriesSection />
          <TestimonialsSection />
          <GallerySection />
          <FAQSection />
          <ContactSection />
        </main>
        
        <div className="fixed bottom-4 right-4 z-50">
          <a 
            href="/view-contact-submissions" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all"
            aria-label="View Contact Submissions"
          >
            View Contact Submissions
          </a>
        </div>
        
        <Footer />
      </div>
    </>
  );
}
