import { motion } from "framer-motion";
import { UtensilsCrossed, Download } from "lucide-react";
import ParentInfoLayout from "@/components/ParentInfoLayout";
import { fadeUp, staggerContainer, childFadeIn } from "@/lib/animations";
import { Button } from "@/components/ui/button";

export default function SampleMenuPage() {
  return (
    <ParentInfoLayout 
      title="Sample Menu" 
      subtitle="Nutritious and delicious meals and snacks for our little ones"
      icon={<UtensilsCrossed />}
    >
      <motion.div
        className="max-w-4xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp} className="mb-10">
          <h2 className="text-2xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-rainbow-red via-rainbow-orange to-rainbow-yellow mb-4">Our Approach to Nutrition</h2>
          <p className="text-muted-foreground mb-6">
            At Coat of Many Colours Nursery, we believe that providing nutritious, well-balanced meals is essential for children's growth, 
            development, and learning. Our menus are carefully planned to ensure children receive a variety of foods from all food groups, 
            introducing them to different flavors, textures, and cuisines.
          </p>
          <div className="bg-white shadow-md rounded-lg p-6 border border-rainbow-pink/10">
            <h3 className="text-xl font-heading font-bold mb-3 text-rainbow-pink">Key Features of Our Menu</h3>
            <ul className="grid gap-3 md:grid-cols-2">
              <li className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-rainbow-red/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <div className="h-3 w-3 rounded-full bg-rainbow-red"></div>
                </div>
                <span>Fresh, seasonal ingredients</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-rainbow-orange/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <div className="h-3 w-3 rounded-full bg-rainbow-orange"></div>
                </div>
                <span>Reduced sugar and salt content</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-rainbow-yellow/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <div className="h-3 w-3 rounded-full bg-rainbow-yellow"></div>
                </div>
                <span>Variety of cultural dishes</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-rainbow-green/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <div className="h-3 w-3 rounded-full bg-rainbow-green"></div>
                </div>
                <span>Support for developmental eating milestones</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-rainbow-blue/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <div className="h-3 w-3 rounded-full bg-rainbow-blue"></div>
                </div>
                <span>Emphasis on fruits and vegetables</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-rainbow-purple/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <div className="h-3 w-3 rounded-full bg-rainbow-purple"></div>
                </div>
                <span>Accommodations for dietary requirements</span>
              </li>
            </ul>
          </div>
        </motion.div>
        
        <motion.div variants={fadeUp} className="mb-10">
          <h2 className="text-2xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-rainbow-green via-rainbow-blue to-rainbow-purple mb-6">Our Menu Cycles</h2>
          <p className="text-muted-foreground mb-6">
            We operate on a seasonal menu cycle, ensuring children enjoy meals that are appropriate for the time of year,
            using the freshest ingredients available. Our menus are carefully planned to provide balanced nutrition while
            introducing children to a variety of tastes and textures.
          </p>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <motion.div 
              variants={childFadeIn}
              custom={0}
              className="bg-white shadow-md rounded-lg overflow-hidden border border-rainbow-orange/20"
            >
              <div className="bg-rainbow-orange text-white py-3 px-6">
                <h3 className="text-xl font-heading font-bold">Summer Menu</h3>
              </div>
              <div className="p-6">
                <p className="text-muted-foreground mb-4">
                  Our summer menu features lighter meals with seasonal fruits and vegetables, 
                  helping children stay hydrated and energized during warmer months.
                </p>
                <a 
                  href="/files/menus/Summer-Menu.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-rainbow-orange/10 hover:bg-rainbow-orange/20 text-rainbow-orange px-4 py-2 rounded-md transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Summer Menu</span>
                </a>
              </div>
            </motion.div>
            
            <motion.div 
              variants={childFadeIn}
              custom={1}
              className="bg-white shadow-md rounded-lg overflow-hidden border border-rainbow-blue/20"
            >
              <div className="bg-rainbow-blue text-white py-3 px-6">
                <h3 className="text-xl font-heading font-bold">Winter Menu</h3>
              </div>
              <div className="p-6">
                <p className="text-muted-foreground mb-4">
                  Our winter menu includes heartier, warming meals rich in nutrients to support children's
                  immune systems and energy levels during colder months.
                </p>
                <a 
                  href="/files/menus/Winter-Menu.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-rainbow-blue/10 hover:bg-rainbow-blue/20 text-rainbow-blue px-4 py-2 rounded-md transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Winter Menu</span>
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeUp} className="bg-gradient-to-r from-rainbow-purple/5 to-rainbow-pink/5 rounded-lg p-6 border border-rainbow-purple/10">
          <h3 className="text-xl font-heading font-bold mb-3 text-rainbow-purple">Dietary Requirements and Allergies</h3>
          <p className="text-muted-foreground mb-4">
            We cater to a range of dietary requirements and allergies. Please inform our staff about any specific needs your child may have, and we'll work 
            with you to ensure their nutritional needs are met safely and deliciously.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-white p-4 rounded-md shadow-sm border border-rainbow-red/10">
              <h4 className="font-semibold text-rainbow-red mb-2">Allergies</h4>
              <p className="text-sm text-muted-foreground">We take food allergies very seriously and maintain strict protocols to prevent cross-contamination.</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm border border-rainbow-blue/10">
              <h4 className="font-semibold text-rainbow-blue mb-2">Religious Requirements</h4>
              <p className="text-sm text-muted-foreground">We respect and accommodate various religious dietary practices and requirements.</p>
            </div>
            <div className="bg-white p-4 rounded-md shadow-sm border border-rainbow-green/10">
              <h4 className="font-semibold text-rainbow-green mb-2">Special Diets</h4>
              <p className="text-sm text-muted-foreground">Vegetarian, vegan, and other special diets can be accommodated with advance notice.</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </ParentInfoLayout>
  );
}