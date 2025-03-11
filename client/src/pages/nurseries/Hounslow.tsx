import { useState } from "react";
import NurseryLayout from "@/components/NurseryLayout";
import NurseryDescription from "@/components/nursery/NurseryDescription";
import NurseryFacilities from "@/components/nursery/NurseryFacilities";
import NurseryLocation from "@/components/nursery/NurseryLocation";
import NurseryGallery from "@/components/nursery/NurseryGallery";
import { 
  Trees, 
  Leaf, 
  CloudSun, 
  BookOpen, 
  PawPrint, 
  ShieldCheck,
  HeartHandshake
} from "lucide-react";

export default function HounslowNursery() {
  const facilities = [
    {
      icon: <Trees className="text-primary w-6 h-6" />,
      title: "Forest School Area",
      description: "Dedicated outdoor learning environment where children connect with nature and develop confidence through hands-on activities."
    },
    {
      icon: <Leaf className="text-primary w-6 h-6" />,
      title: "Community Garden",
      description: "Child-friendly gardening spaces where children learn about growing plants, sustainability, and healthy eating."
    },
    {
      icon: <CloudSun className="text-primary w-6 h-6" />,
      title: "All-Weather Play Zone",
      description: "Specially designed outdoor area for play in all weather conditions, encouraging year-round outdoor learning."
    },
    {
      icon: <BookOpen className="text-primary w-6 h-6" />,
      title: "Nature Library",
      description: "Collection of nature-focused books and resources to deepen children's understanding of the natural world."
    },
    {
      icon: <PawPrint className="text-primary w-6 h-6" />,
      title: "Wildlife Observation Area",
      description: "Safe spaces where children can observe local wildlife, building respect and appreciation for animals."
    },
    {
      icon: <HeartHandshake className="text-primary w-6 h-6" />,
      title: "Community Connection",
      description: "Regular engagement with the local community through visits, partnerships and joint environmental projects."
    }
  ];

  const galleryImages = [
    "https://images.unsplash.com/photo-1543248939-4296e1fea89b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1560969184-10fe8719e047?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1516214104703-d870798883c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1604881988758-f76ad2f7aac1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1508184964240-ee96bb9677a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    "https://images.unsplash.com/photo-1517164850305-99a3e65bb47e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  ];

  return (
    <NurseryLayout 
      title="Hounslow Nursery" 
      heroImage="https://images.unsplash.com/photo-1543248939-4296e1fea89b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    >
      <NurseryDescription 
        description="Our Hounslow nursery is a nature-focused environment with extensive outdoor play areas and forest school activities. Designed for children aged 1-5, our approach emphasizes environmental awareness, exploration, and adventure. Children spend significant time outdoors in all seasons, developing resilience, physical skills, and a deep connection to the natural world, complemented by thoughtful indoor spaces that extend their learning."
        imageSrc="https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
      />
      
      <NurseryFacilities facilities={facilities} />
      
      <NurseryLocation 
        address="78 Hounslow Road, Hounslow, Middlesex TW3 3DB"
        hoursText="Monday - Friday: 7:30 AM - 6:30 PM"
        phoneNumber="020 8123 4567"
        mapImage="https://images.unsplash.com/photo-1505322747495-6afdd3b70760?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
      />
      
      <NurseryGallery images={galleryImages} />
    </NurseryLayout>
  );
}