import { motion } from "framer-motion";
import { fadeUp, staggerContainer, childFadeIn } from "@/lib/animations";
import { Instagram } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface NurseryGalleryProps {
  nurseryLocation: string;
}

interface GalleryImage {
  id: number;
  title: string;
  description?: string;
  filename: string;
  imageUrl: string;
  nurseryId: number;
}

export default function NurseryGallery({ nurseryLocation }: NurseryGalleryProps) {
  // Fetch gallery images for this specific nursery
  const { data: galleryData, isLoading } = useQuery<{ images: GalleryImage[] }>({
    queryKey: [`/api/nurseries/${nurseryLocation}/gallery`],
    queryFn: async () => {
      const response = await fetch(`/api/nurseries/${nurseryLocation}/gallery`);
      if (!response.ok) {
        throw new Error('Failed to fetch gallery');
      }
      return response.json();
    }
  });

  const images = galleryData?.images || [];

  if (isLoading) {
    return (
      <section className="py-16 px-4 md:px-10 lg:px-20 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-primary">Gallery</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p>Loading gallery...</p>
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return (
      <section className="py-16 px-4 md:px-10 lg:px-20 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-primary">Gallery</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <a href="https://www.instagram.com/cmcnursery/?hl=en-gb" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 mb-6 hover:text-primary transition-colors">
            <Instagram className="text-primary w-5 h-5" />
            <p className="text-gray-700">Follow us on Instagram for more updates</p>
          </a>
          <p className="text-gray-600">No images available yet. Check back soon for new photos!</p>
        </div>
      </section>
    );
  }
  return (
    <section className="py-16 px-4 md:px-10 lg:px-20 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <h2 className="text-3xl font-bold mb-4 text-primary">Gallery</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <a href="https://www.instagram.com/cmcnursery/?hl=en-gb" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 mb-6 hover:text-primary transition-colors">
            <Instagram className="text-primary w-5 h-5" />
            <p className="text-gray-700">Follow us on Instagram for more updates</p>
          </a>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              className="relative overflow-hidden rounded-xl aspect-square group"
              variants={childFadeIn}
              custom={index}
            >
              <img
                src={image.imageUrl}
                alt={image.title || `Gallery image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button className="bg-white text-primary px-4 py-2 rounded-full font-medium transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  View Larger
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}