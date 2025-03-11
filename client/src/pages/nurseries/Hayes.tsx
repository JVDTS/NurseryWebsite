import { useState } from "react";
import NurseryLayout from "@/components/NurseryLayout";
import NurseryDescription from "@/components/nursery/NurseryDescription";
import NurseryFacilities from "@/components/nursery/NurseryFacilities";
import NurseryLocation from "@/components/nursery/NurseryLocation";
import NurseryGallery from "@/components/nursery/NurseryGallery";
import { 
  Palette, 
  BookOpen, 
  Music, 
  Trees, 
  Utensils, 
  ShieldCheck, 
  Heart 
} from "lucide-react";

export default function HayesNursery() {
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
    </NurseryLayout>
  );
}