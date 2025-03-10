import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
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
import { fadeUp } from "@/lib/animations";

interface FeatureCardProps {
  icon: React.ReactNode;
  color: string;
  colorLight: string;
  title: string;
  description: string;
  delay: number;
}

function FeatureCard({ icon, color, colorLight, title, description, delay }: FeatureCardProps) {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md p-6 card-hover"
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={fadeUp}
      custom={delay}
    >
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
      <h4 className={`font-heading font-bold text-4xl ${color} mb-2`}>{value}</h4>
      <p className="font-heading font-medium">{label}</p>
    </motion.div>
  );
}

export default function MissionSection() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const features = [
    {
      icon: <Brain className="text-3xl" />,
      color: "text-primary",
      colorLight: "bg-primary bg-opacity-20",
      title: "Emotional Intelligence",
      description: "We nurture children's emotional growth, helping them understand and express feelings in healthy ways.",
      delay: 0.1
    },
    {
      icon: <Leaf className="text-3xl" />,
      color: "text-secondary",
      colorLight: "bg-secondary bg-opacity-20",
      title: "Nature Connection",
      description: "Our outdoor curriculum gives children daily opportunities to explore and connect with the natural world.",
      delay: 0.2
    },
    {
      icon: <BookOpen className="text-3xl" />,
      color: "text-accent",
      colorLight: "bg-accent bg-opacity-20",
      title: "Personalized Learning",
      description: "We tailor activities to each child's interests, learning style and developmental needs.",
      delay: 0.3
    },
    {
      icon: <Users className="text-3xl" />,
      color: "text-purple-800",
      colorLight: "bg-purple-800 bg-opacity-20",
      title: "Community Focus",
      description: "We believe in partnership with families and our local community to provide the best care possible.",
      delay: 0.4
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
    <section id="mission" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
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
            We focus on children's mental and physical health in the early years
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
            />
          ))}
        </div>
        
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
