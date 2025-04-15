import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { fadeUp } from "@/lib/animations";

interface GalleryImageProps {
  src: string;
  alt: string;
  delay: number;
}

const galleryImages: GalleryImageProps[] = [
  {
    src: "https://images.unsplash.com/photo-1546484959-f9a381d1330d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    alt: "Children enjoying art activities",
    delay: 0.1
  },
  {
    src: "https://images.unsplash.com/photo-1551966775-a4ddc8df052b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    alt: "Outdoor play area",
    delay: 0.2
  },
  {
    src: "https://images.unsplash.com/photo-1567593810070-7a3d471af022?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    alt: "Reading corner with books",
    delay: 0.3
  },
  {
    src: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    alt: "Children's art display",
    delay: 0.4
  },
  {
    src: "https://images.unsplash.com/photo-1485145782098-4f5fd605a66b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    alt: "Music and movement session",
    delay: 0.5
  },
  {
    src: "https://images.unsplash.com/photo-1526634332515-d56c5fd16991?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    alt: "Sensory play activities",
    delay: 0.6
  },
  {
    src: "https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    alt: "Gardening activities",
    delay: 0.7
  },
  {
    src: "https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    alt: "Science exploration",
    delay: 0.8
  }
];

function GalleryImage({ src, alt, delay }: GalleryImageProps) {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <motion.div 
      className="overflow-hidden rounded-lg h-64 card-hover"
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp}
      custom={delay}
    >
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
      />
    </motion.div>
  );
}

export default function GallerySection() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-16"
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
        >
          <div className="mb-4">
            <span className="inline-block px-4 py-1 bg-purple-800 bg-opacity-20 text-purple-800 font-heading font-semibold text-sm uppercase rounded-full">Gallery</span>
          </div>
          
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6 leading-tight">
            A glimpse inside our vibrant nursery world
          </h2>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryImages.map((image, index) => (
            <GalleryImage
              key={index}
              src={image.src}
              alt={image.alt}
              delay={image.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
