import { useState } from "react";
import NurseryLayout from "@/components/NurseryLayout";
import NurseryDescription from "@/components/nursery/NurseryDescription";
import NurseryFacilities from "@/components/nursery/NurseryFacilities";
import NurseryLocation from "@/components/nursery/NurseryLocation";
import NurseryGallery from "@/components/nursery/NurseryGallery";
import { 
  Brain, 
  BookOpen, 
  Puzzle, 
  Trees, 
  HeartPulse, 
  ShieldCheck, 
  Heart 
} from "lucide-react";

export default function UxbridgeNursery() {
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
    >
      <NurseryDescription 
        description="Our Uxbridge nursery is a cozy, innovative environment with state-of-the-art learning facilities and a dedicated sensory room. We cater to children aged 2-5, providing a nurturing space where curious minds flourish. Our approach focuses on hands-on learning experiences that develop cognitive, social, and emotional skills while celebrating each child's unique personality and learning style."
        imageSrc="https://images.unsplash.com/photo-1527490087278-9c75be0b8052?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
      />
      
      <NurseryFacilities facilities={facilities} />
      
      <NurseryLocation 
        address="45 Uxbridge High Street, Uxbridge, Middlesex UB8 1JN"
        hoursText="Monday - Friday: 8:00 AM - 6:00 PM"
        phoneNumber="01895 123 456"
        mapImage="https://images.unsplash.com/photo-1577086664693-894d8405334a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
      />
      
      <NurseryGallery images={galleryImages} />
    </NurseryLayout>
  );
}