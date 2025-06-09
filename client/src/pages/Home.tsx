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

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full">
      <NavBar />
      <HeroSection />
      <AboutSection />
      <MissionSection />
      <NurseriesSection />
      <TestimonialsSection />
      <GallerySection />
      <FAQSection />
      <ContactSection />
      <div className="fixed bottom-4 right-4 z-50">
        <a 
          href="/view-contact-submissions" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          View Contact Submissions
        </a>
      </div>
      <Footer />
    </div>
  );
}
