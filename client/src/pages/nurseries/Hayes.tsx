import { useState } from "react";
import NurseryLayout from "@/components/NurseryLayout";
import NurseryDescription from "@/components/nursery/NurseryDescription";
import NurseryFacilities from "@/components/nursery/NurseryFacilities";
import NurseryLocation from "@/components/nursery/NurseryLocation";
import NurseryGallery from "@/components/nursery/NurseryGallery";
import UpcomingEvents from "@/components/nursery/UpcomingEvents";
import Newsletter from "@/components/nursery/Newsletter";
import { 
  Palette, 
  BookOpen, 
  Music, 
  Trees, 
  Utensils, 
  ShieldCheck,
  Heart,
  Download
} from "lucide-react";

export default function HayesNursery() {
  const events = [
    {
      title: "Parent Information Evening",
      date: "April 15, 2025",
      time: "6:30 PM - 8:00 PM",
      location: "Hayes Nursery, Main Hall",
      description: "Join us for an informative evening about our curriculum, daily routines, and upcoming activities. A great opportunity to meet staff and ask questions."
    },
    {
      title: "Spring Garden Planting Day",
      date: "April 22, 2025",
      time: "10:00 AM - 12:00 PM",
      location: "Hayes Nursery Garden",
      description: "Children and parents are invited to help plant our spring garden. Learn about plants and sustainability while enjoying outdoor activities."
    }
  ];

  const facilities = [
    {
      icon: <Palette className="text-primary w-6 h-6" />,
      title: "Creative Arts Studio",
      description: "A bright, engaging space where children can explore various art media and express themselves creatively."
    },
    {
      icon: <BookOpen className="text-primary w-6 h-6" />,
      title: "Reading Corner",
      description: "A cozy, well-stocked reading area that encourages early literacy and a love of books."
    },
    {
      icon: <Music className="text-primary w-6 h-6" />,
      title: "Music & Movement",
      description: "Dedicated space for music activities, singing, dancing and developing rhythm skills."
    },
    {
      icon: <Trees className="text-primary w-6 h-6" />,
      title: "Outdoor Play Area",
      description: "Large, safely enclosed outdoor space with age-appropriate play equipment and natural elements."
    },
    {
      icon: <Utensils className="text-primary w-6 h-6" />,
      title: "Healthy Meals",
      description: "Nutritious, freshly prepared meals and snacks catering to dietary requirements and preferences."
    },
    {
      icon: <ShieldCheck className="text-primary w-6 h-6" />,
      title: "Secure Environment",
      description: "State-of-the-art security systems and protocols to ensure children's safety at all times."
    }
  ];

  const galleryImages = [
    "https://images.unsplash.com/photo-1526634332515-d56c5fd16991?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1567057419565-4349c49d8a04?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1555861496-0666c8981751?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1610440042657-612c34d95e9f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1484820540004-14229fe36ca4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  ];

  return (
    <NurseryLayout 
      title="Hayes Nursery" 
      heroImage="https://images.unsplash.com/photo-1565538810643-b5bdb714032a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    >
      <NurseryDescription 
        description="Welcome to our Hayes nursery, a bright, spacious facility with a beautiful garden, located in the heart of Hayes. Our purpose-built environment provides children aged 0-5 with rich, varied learning experiences that encourage exploration, creativity, and growth. We focus on creating a warm, nurturing atmosphere where each child feels secure and valued, enabling them to build confidence and develop a lifelong love of learning."
        imageSrc="https://images.unsplash.com/photo-1570913187788-2aa6bd2054e0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
      />
      
      <NurseryFacilities facilities={facilities} />
      
      <NurseryLocation 
        address="192 Church Road, Hayes, UB3 2LT"
        hoursText="Monday - Friday: 7:30 AM - 6:00 PM"
        phoneNumber="01895 272885"
        mapImage="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
      />
      
      <NurseryGallery images={galleryImages} />
      
      <UpcomingEvents events={events} nurseryName="Hayes" />
      
      <Newsletter />
      
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-bold mb-4">Downloadable Resources</h2>
            <p className="text-gray-600 mb-8">
              Download useful documents and resources for parents at our Hayes nursery
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <a href="#" className="flex items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Download className="text-primary w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-medium text-lg">Hayes Nursery Policies</h3>
                <p className="text-gray-500 text-sm">PDF document • 2.4MB</p>
              </div>
            </a>
            
            <a href="#" className="flex items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Download className="text-primary w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-medium text-lg">Weekly Menu Sample</h3>
                <p className="text-gray-500 text-sm">PDF document • 1.8MB</p>
              </div>
            </a>
            
            <a href="#" className="flex items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Download className="text-primary w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-medium text-lg">Term Dates 2025-2026</h3>
                <p className="text-gray-500 text-sm">PDF document • 0.5MB</p>
              </div>
            </a>
            
            <a href="#" className="flex items-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Download className="text-primary w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-medium text-lg">Registration Form</h3>
                <p className="text-gray-500 text-sm">PDF document • 1.2MB</p>
              </div>
            </a>
          </div>
        </div>
      </section>
    </NurseryLayout>
  );
}