import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";
import ParentInfoLayout from "@/components/ParentInfoLayout";
import { fadeUp, staggerContainer, childFadeIn } from "@/lib/animations";

export default function SampleMenuPage() {
  const weekMenu = [
    {
      day: "Monday",
      breakfast: "Whole grain cereal with fresh fruit",
      snack: "Apple slices with yogurt dip",
      lunch: "Vegetable pasta bake with garden salad",
      afternoonSnack: "Homemade oat cookies with milk",
      tea: "Cheese and tomato sandwiches with cucumber sticks"
    },
    {
      day: "Tuesday",
      breakfast: "Porridge with banana and honey",
      snack: "Carrot and pepper sticks with hummus",
      lunch: "Mild chicken curry with brown rice and steamed broccoli",
      afternoonSnack: "Fresh fruit platter",
      tea: "Baked beans on toast with grated cheese"
    },
    {
      day: "Wednesday",
      breakfast: "Whole grain toast with scrambled eggs",
      snack: "Orange segments and grapes",
      lunch: "Fish fingers with mashed potatoes and garden peas",
      afternoonSnack: "Homemade fruit muffins",
      tea: "Vegetable soup with bread rolls"
    },
    {
      day: "Thursday",
      breakfast: "Greek yogurt with fresh berries and granola",
      snack: "Cucumber and cheese cubes",
      lunch: "Shepherd's pie with seasonal vegetables",
      afternoonSnack: "Rice cakes with cream cheese",
      tea: "Tuna and sweetcorn wraps with cherry tomatoes"
    },
    {
      day: "Friday",
      breakfast: "Fruit smoothie with whole grain toast fingers",
      snack: "Banana and raisins",
      lunch: "Homemade pizza with vegetable toppings and side salad",
      afternoonSnack: "Natural popcorn",
      tea: "Egg and cress sandwiches with vegetable sticks"
    }
  ];

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
          <h2 className="text-2xl font-heading font-bold text-primary mb-4">Our Approach to Nutrition</h2>
          <p className="text-muted-foreground mb-6">
            At Coat of Many Colours Nursery, we believe that providing nutritious, well-balanced meals is essential for children's growth, 
            development, and learning. Our menus are carefully planned to ensure children receive a variety of foods from all food groups, 
            introducing them to different flavors, textures, and cuisines.
          </p>
          <div className="bg-white shadow-md rounded-lg p-6 border border-primary/10">
            <h3 className="text-xl font-heading font-bold mb-3 text-primary">Key Features of Our Menu</h3>
            <ul className="grid gap-3 md:grid-cols-2">
              <li className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <div className="h-3 w-3 rounded-full bg-primary"></div>
                </div>
                <span>Fresh, seasonal ingredients</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <div className="h-3 w-3 rounded-full bg-primary"></div>
                </div>
                <span>Low salt and sugar content</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <div className="h-3 w-3 rounded-full bg-primary"></div>
                </div>
                <span>Variety of protein sources</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <div className="h-3 w-3 rounded-full bg-primary"></div>
                </div>
                <span>Whole grains and complex carbohydrates</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <div className="h-3 w-3 rounded-full bg-primary"></div>
                </div>
                <span>Plenty of fruits and vegetables</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <div className="h-3 w-3 rounded-full bg-primary"></div>
                </div>
                <span>Accommodations for dietary requirements</span>
              </li>
            </ul>
          </div>
        </motion.div>
        
        <motion.div variants={fadeUp} className="mb-10">
          <h2 className="text-2xl font-heading font-bold text-primary mb-6">Sample Weekly Menu</h2>
          <div className="space-y-6">
            {weekMenu.map((day, index) => (
              <motion.div 
                key={day.day} 
                variants={childFadeIn}
                custom={index}
                className="bg-white shadow-md rounded-lg overflow-hidden border border-primary/10"
              >
                <div className="bg-primary text-white py-3 px-6">
                  <h3 className="text-xl font-heading font-bold">{day.day}</h3>
                </div>
                <div className="p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Breakfast</h4>
                      <p className="text-muted-foreground">{day.breakfast}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Morning Snack</h4>
                      <p className="text-muted-foreground">{day.snack}</p>
                    </div>
                    <div className="md:col-span-2">
                      <h4 className="font-semibold text-primary mb-2">Lunch</h4>
                      <p className="text-muted-foreground">{day.lunch}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Afternoon Snack</h4>
                      <p className="text-muted-foreground">{day.afternoonSnack}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Tea</h4>
                      <p className="text-muted-foreground">{day.tea}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <motion.div variants={fadeUp}>
          <h2 className="text-2xl font-heading font-bold text-primary mb-4">Additional Information</h2>
          
          <div className="bg-white shadow-md rounded-lg p-6 border border-primary/10 mb-6">
            <h3 className="text-xl font-heading font-bold mb-3">Dietary Requirements</h3>
            <p className="mb-4">
              We cater for a range of dietary requirements including allergies, intolerances, cultural preferences, and vegetarian/vegan diets.
              Please inform us of any special requirements when registering your child, and we will work with you to ensure their needs are met.
            </p>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 border border-primary/10 mb-6">
            <h3 className="text-xl font-heading font-bold mb-3">Mealtimes at the Nursery</h3>
            <p className="mb-4">
              Mealtimes are important social occasions at our nursery. Children and staff eat together, encouraging good table manners, 
              healthy eating habits, and conversation. Older children are encouraged to serve themselves and help with setting up and clearing away.
            </p>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 border border-primary/10">
            <h3 className="text-xl font-heading font-bold mb-3">Baby Food</h3>
            <p className="mb-4">
              For babies, we follow parents' instructions regarding feeding schedules and preferences. We can provide puréed versions 
              of our menu items or accommodate parent-provided food. We support weaning and will work closely with parents during this important transition.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </ParentInfoLayout>
  );
}