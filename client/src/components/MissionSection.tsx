import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useRef } from "react";
import { 
  Brain, 
  Leaf, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Clock, 
  Users2, 
  Award 
} from "lucide-react";
import { fadeUp, fadeLeft, fadeRight } from "@/lib/animations";

interface FeatureCardProps {
  icon: React.ReactNode;
  color: string;
  colorLight: string;
  title: string;
  description: string;
  delay: number;
  imageSrc?: string;
}

function FeatureCard({ icon, color, colorLight, title, description, delay, imageSrc }: FeatureCardProps) {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md p-6 card-hover relative overflow-hidden"
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp}
      custom={delay}
    >
      {imageSrc && (
        <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full overflow-hidden opacity-10 z-0">
          <img 
            src={imageSrc} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="relative z-10">
        <div className={`w-16 h-16 ${colorLight} rounded-full flex items-center justify-center mb-6`}>
          <div className={color}>{icon}</div>
        </div>
        <h3 className="font-heading font-bold text-xl mb-3">{title}</h3>
        <p className="text-gray-600">
          {description}
        </p>
        <motion.a 
          href="#" 
          className={`inline-block mt-4 font-heading font-semibold ${color} flex items-center`}
          whileHover={{ x: 5 }}
        >
          Learn more
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </motion.a>
      </div>
    </motion.div>
  );
}

interface StatCardProps {
  color: string;
  colorLight: string;
  value: string;
  label: string;
  delay: number;
}

function StatCard({ color, colorLight, value, label, delay }: StatCardProps) {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <motion.div 
      className={`${colorLight} rounded-xl p-6 text-center`}
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp}
      custom={delay}
    >
      <h4 className="font-heading font-bold text-4xl text-gray-900 mb-2">{value}</h4>
      <p className="font-heading font-medium">{label}</p>
    </motion.div>
  );
}

export default function MissionSection() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });
  
  // Parallax effect
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const imageY1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const imageY2 = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const imageY3 = useTransform(scrollYProgress, [0, 1], [0, -70]);

  const features = [
    {
      icon: <Brain className="text-3xl" />,
      color: "text-primary",
      colorLight: "bg-primary bg-opacity-20",
      title: "Emotional Intelligence",
      description: "We nurture children's emotional growth, helping them understand and express feelings in healthy ways.",
      delay: 0.1,
      imageSrc: "https://images.unsplash.com/photo-1602046521161-1bf7fc364824?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
    },
    {
      icon: <Leaf className="text-3xl" />,
      color: "text-secondary",
      colorLight: "bg-secondary bg-opacity-20",
      title: "Nature Connection",
      description: "Our outdoor curriculum gives children daily opportunities to explore and connect with the natural world.",
      delay: 0.2,
      imageSrc: "https://images.unsplash.com/photo-1597258145619-75a5968d331a?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
    },
    {
      icon: <BookOpen className="text-3xl" />,
      color: "text-accent",
      colorLight: "bg-accent bg-opacity-20",
      title: "Personalized Learning",
      description: "We tailor activities to each child's interests, learning style and developmental needs.",
      delay: 0.3,
      imageSrc: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
    },
    {
      icon: <Users className="text-3xl" />,
      color: "text-purple-800",
      colorLight: "bg-purple-800 bg-opacity-20",
      title: "Community Focus",
      description: "We believe in partnership with families and our local community to provide the best care possible.",
      delay: 0.4,
      imageSrc: "https://images.unsplash.com/photo-1526634332515-d56c5fd16991?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
    }
  ];

  const stats = [
    {
      color: "text-primary",
      colorLight: "bg-primary bg-opacity-10",
      value: "96%",
      label: "Parent Satisfaction",
      delay: 0.1
    },
    {
      color: "text-secondary",
      colorLight: "bg-secondary bg-opacity-10",
      value: "15+",
      label: "Years Experience",
      delay: 0.2
    },
    {
      color: "text-accent",
      colorLight: "bg-accent bg-opacity-10",
      value: "3:1",
      label: "Child-Teacher Ratio",
      delay: 0.3
    },
    {
      color: "text-purple-800",
      colorLight: "bg-purple-800 bg-opacity-10",
      value: "250+",
      label: "Happy Children",
      delay: 0.4
    }
  ];

  return (
    <section id="mission" className="py-20 bg-gray-50 relative overflow-hidden" ref={sectionRef}>
      {/* Decorative circles in the background */}
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary bg-opacity-5 rounded-full"></div>
      <div className="absolute bottom-20 -right-32 w-96 h-96 bg-secondary bg-opacity-5 rounded-full"></div>
      
      {/* Floating images with parallax effect */}
      <motion.div 
        className="absolute top-20 -left-6 w-32 h-44 rounded-xl overflow-hidden shadow-lg hidden md:block"
        style={{ y: imageY1 }}
      >
        <img 
          src="https://images.unsplash.com/photo-1544294563-0d3452d0fbc1?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" 
          alt="Child playing" 
          className="w-full h-full object-cover"
        />
      </motion.div>
      
      <motion.div 
        className="absolute top-1/3 -right-6 w-40 h-40 rounded-full overflow-hidden shadow-lg hidden md:block"
        style={{ y: imageY2 }}
      >
        <img 
          src="https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" 
          alt="Children learning together" 
          className="w-full h-full object-cover"
        />
      </motion.div>
      
      <motion.div 
        className="absolute bottom-10 left-20 w-28 h-28 rounded-xl overflow-hidden shadow-lg hidden md:block"
        style={{ y: imageY3 }}
      >
        <img 
          src="https://images.unsplash.com/photo-1573496773905-f5b17e717f05?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" 
          alt="Child exploring" 
          className="w-full h-full object-cover"
        />
      </motion.div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center mb-16"
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
        >
          <div className="mb-4">
            <span className="inline-block px-4 py-1 bg-primary bg-opacity-20 text-primary font-heading font-semibold text-sm uppercase rounded-full">Our Mission</span>
          </div>
          
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-6 leading-tight">
            We focus on children's <span className="text-primary">mental</span> and <span className="text-secondary">physical</span> health in the early years
          </h2>
          
          <p className="text-gray-600 text-lg">
            Four key factors set us apart from other nurseries. Our holistic approach ensures children thrive in all aspects of development.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              color={feature.color}
              colorLight={feature.colorLight}
              title={feature.title}
              description={feature.description}
              delay={feature.delay}
              imageSrc={feature.imageSrc}
            />
          ))}
        </div>
        
        {/* Main image with children */}
        <motion.div 
          className="max-w-5xl mx-auto rounded-xl overflow-hidden shadow-xl mb-16 hidden md:block"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
        >
          <img 
            src="https://images.unsplash.com/photo-1540479859555-17af45c78602?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" 
            alt="Children doing arts and crafts" 
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              color={stat.color}
              colorLight={stat.colorLight}
              value={stat.value}
              label={stat.label}
              delay={stat.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
