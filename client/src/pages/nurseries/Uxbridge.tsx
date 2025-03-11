import { useState } from "react";
import NurseryLayout from "@/components/NurseryLayout";
import NurseryDescription from "@/components/nursery/NurseryDescription";
import NurseryFacilities from "@/components/nursery/NurseryFacilities";
import NurseryLocation from "@/components/nursery/NurseryLocation";
import NurseryGallery from "@/components/nursery/NurseryGallery";
import UpcomingEvents from "@/components/nursery/UpcomingEvents";
import Newsletter from "@/components/nursery/Newsletter";
import { 
  Brain, 
  BookOpen, 
  Puzzle, 
  Trees, 
  HeartPulse, 
  ShieldCheck, 
  Heart,
  Download
} from "lucide-react";

export default function UxbridgeNursery() {
  const events = [
    {
      title: "STEM Workshop for Parents",
      date: "April 18, 2025",
      time: "5:30 PM - 7:00 PM",
      location: "Uxbridge Nursery, Learning Lab",
      description: "Learn how to support your child's early STEM development at home. Our educators will demonstrate simple, engaging activities that promote scientific thinking and curiosity."
    },
    {
      title: "Family Fun Day",
      date: "May 9, 2025",
      time: "11:00 AM - 2:00 PM",
      location: "Uxbridge Nursery Garden",
      description: "Join us for a day of fun activities, games, and refreshments. A great opportunity for families to socialize and for children to play together in our beautiful garden."
    }
  ];

  const facilities = [
    {
      icon: <Brain className="text-primary w-6 h-6" />,
      title: "Sensory Room",
      description: "A dedicated sensory room designed to stimulate children's senses and support their cognitive development."
    },
    {
      icon: <BookOpen className="text-primary w-6 h-6" />,
      title: "Learning Laboratory",
      description: "Interactive space with educational materials to encourage exploration and discovery."
    },
    {
      icon: <Puzzle className="text-primary w-6 h-6" />,
      title: "STEM Discovery Zone",
      description: "Area equipped with age-appropriate science and math materials to foster early STEM skills."
    },
    {
      icon: <Trees className="text-primary w-6 h-6" />,
      title: "Nature Garden",
      description: "Carefully designed outdoor space with plants, small wildlife habitats, and natural play elements."
    },
    {
      icon: <HeartPulse className="text-primary w-6 h-6" />,
      title: "Physical Development Area",
      description: "Space dedicated to developing gross motor skills, balance, and coordination through active play."
    },
    {
      icon: <ShieldCheck className="text-primary w-6 h-6" />,
      title: "Secure Environment",
      description: "State-of-the-art security systems and protocols to ensure children's safety at all times."
    }
  ];

  const galleryImages = [
    "https://images.unsplash.com/photo-1544487660-b86394cba400?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1571210862729-78a52d3779a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1541692641319-981cc79ee10a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1551966775-a4ddc8df048b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1599687267392-b92a30d39263?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  ];

  return (
    <NurseryLayout 
      title="Uxbridge Nursery" 
      heroImage="https://images.unsplash.com/photo-1544487660-b86394cba400?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
      themeColor="uxbridge"
    >
      <NurseryDescription 
        description="Our Uxbridge nursery is a cozy, innovative environment with state-of-the-art learning facilities and a dedicated sensory room. We cater to children aged 2-5, providing a nurturing space where curious minds flourish. Our approach focuses on hands-on learning experiences that develop cognitive, social, and emotional skills while celebrating each child's unique personality and learning style."
        imageSrc="https://images.unsplash.com/photo-1527490087278-9c75be0b8052?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
      />
      
      <NurseryFacilities facilities={facilities} />
      
      <NurseryLocation 
        address="4 New Windsor Street, Uxbridge, UB8 2TU"
        hoursText="Monday - Friday: 7:30 AM - 6:00 PM"
        phoneNumber="01895 272885"
        mapImage="https://images.unsplash.com/photo-1577086664693-894d8405334a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
      />
      
      <NurseryGallery images={galleryImages} />
      
      <UpcomingEvents events={events} nurseryName="Uxbridge" />
      
      <Newsletter />
      
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-bold mb-4">Downloadable Resources</h2>
            <p className="text-gray-600 mb-8">
              Download useful documents and resources for parents at our Uxbridge nursery
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <a href="#" className="flex items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-uxbridge/10 p-3 rounded-full mr-4">
                <Download className="text-uxbridge w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-medium text-lg">Uxbridge Nursery Policies</h3>
                <p className="text-gray-500 text-sm">PDF document • 2.1MB</p>
              </div>
            </a>
            
            <a href="#" className="flex items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-uxbridge/10 p-3 rounded-full mr-4">
                <Download className="text-uxbridge w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-medium text-lg">STEM Activities Guide</h3>
                <p className="text-gray-500 text-sm">PDF document • 1.5MB</p>
              </div>
            </a>
            
            <a href="#" className="flex items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-uxbridge/10 p-3 rounded-full mr-4">
                <Download className="text-uxbridge w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-medium text-lg">Weekly Menu Sample</h3>
                <p className="text-gray-500 text-sm">PDF document • 0.8MB</p>
              </div>
            </a>
            
            <a href="#" className="flex items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-uxbridge/10 p-3 rounded-full mr-4">
                <Download className="text-uxbridge w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-medium text-lg">Parent Handbook</h3>
                <p className="text-gray-500 text-sm">PDF document • 3.2MB</p>
              </div>
            </a>
          </div>
        </div>
      </section>
    </NurseryLayout>
  );
}