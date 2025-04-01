import { motion } from "framer-motion";
import { PoundSterling } from "lucide-react";
import ParentInfoLayout from "@/components/ParentInfoLayout";
import { fadeIn, fadeUp, staggerContainer, childFadeIn } from "@/lib/animations";

export default function FeesPage() {
  return (
    <ParentInfoLayout 
      title="Our Fees" 
      subtitle="Transparent pricing information for all our nurseries"
      icon={<PoundSterling />}
    >
      <motion.div
        className="max-w-4xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp} className="mb-12">
          <h2 className="text-2xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-rainbow-red via-rainbow-orange to-rainbow-yellow mb-4">Registration & Deposit</h2>
          <p className="text-muted-foreground mb-6">
            At Coat of Many Colours Nursery, we strive to provide high-quality childcare at competitive rates. 
            Our fees include all meals, snacks, nappies, wipes, and standard activities. 
            We offer various attendance options to suit your family's needs.
          </p>
          
          <div className="grid gap-8 md:grid-cols-3">
            <motion.div variants={childFadeIn} className="bg-white shadow-md rounded-lg p-6 border border-rainbow-red/20">
              <h3 className="text-xl font-heading font-bold mb-3 text-rainbow-red">Full Time</h3>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Deposit:</span>
                  <span className="font-semibold">£350.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Registration Fee:</span>
                  <span className="font-semibold">£25.00</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={childFadeIn} className="bg-white shadow-md rounded-lg p-6 border border-rainbow-orange/20">
              <h3 className="text-xl font-heading font-bold mb-3 text-rainbow-orange">Part Time</h3>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Deposit:</span>
                  <span className="font-semibold">£225.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Registration Fee:</span>
                  <span className="font-semibold">£25.00</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={childFadeIn} className="bg-white shadow-md rounded-lg p-6 border border-rainbow-yellow/20">
              <h3 className="text-xl font-heading font-bold mb-3 text-rainbow-yellow">30 Hour Funding ONLY</h3>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Deposit:</span>
                  <span className="font-semibold">£150.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Registration Fee:</span>
                  <span className="font-semibold">£25.00</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeUp} className="mb-12">
          <h2 className="text-2xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-rainbow-green via-rainbow-blue to-rainbow-purple mb-4">Fee Structure (3 months to 5 years)</h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            <motion.div variants={childFadeIn} className="bg-white shadow-md rounded-lg p-6 border border-rainbow-green/20">
              <h3 className="text-xl font-heading font-bold mb-3 text-rainbow-green">Daily Rates</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-foreground">Full Day (7:30am - 6:00pm)</p>
                  <div className="flex justify-between mt-2">
                    <span>Daily Rate:</span>
                    <span className="font-semibold">£70.00 per day</span>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-foreground">AM Session (7:30am - 1:00pm)</p>
                  <div className="flex justify-between mt-2">
                    <span>Session Rate:</span>
                    <span className="font-semibold">£45.00 per session</span>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium text-foreground">PM Session (1:00pm - 6:00pm)</p>
                  <div className="flex justify-between mt-2">
                    <span>Session Rate:</span>
                    <span className="font-semibold">£45.00 per session</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 my-2 pt-2">
                  <p className="font-medium text-foreground">Additional Hours</p>
                  <div className="flex justify-between mt-2">
                    <span>Hourly Rate:</span>
                    <span className="font-semibold">£10.00 per hour</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={childFadeIn} className="bg-white shadow-md rounded-lg p-6 border border-rainbow-blue/20">
              <h3 className="text-xl font-heading font-bold mb-3 text-rainbow-blue">Full Time Fees</h3>
              <p className="text-sm text-muted-foreground mb-4">All full time fees are based on 52 weeks of the year and are divided by 12 months.</p>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Weekly Rate:</span>
                  <span className="font-semibold">£350.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Rate:</span>
                  <span className="font-semibold">£1,516.66</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeUp} className="mb-12">
          <h2 className="text-2xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-rainbow-purple via-rainbow-pink to-rainbow-red mb-4">Funding Information</h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            <motion.div variants={childFadeIn} className="bg-white shadow-md rounded-lg p-6 border border-rainbow-purple/20">
              <h3 className="text-xl font-heading font-bold mb-3 text-rainbow-purple">Funding Rates</h3>
              <p className="text-sm text-muted-foreground mb-4">Additional session prices per day (based on 5 days per week):</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-rainbow-purple">2-Year-Old 15 Hours Funding</h4>
                  <div className="flex justify-between mt-1">
                    <span>38 weeks (Term time):</span>
                    <span className="font-semibold">£68.19</span>
                  </div>
                  <div className="flex justify-between">
                    <span>52 weeks:</span>
                    <span className="font-semibold">£62.30</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-rainbow-purple">3-Year-Old 15 Hours Funding</h4>
                  <div className="flex justify-between mt-1">
                    <span>38 weeks (Term time):</span>
                    <span className="font-semibold">£60.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>52 weeks:</span>
                    <span className="font-semibold">£62.30</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-rainbow-purple">3-Year-Old 30 Hours Funding</h4>
                  <div className="flex justify-between mt-1">
                    <span>38 weeks (Term time):</span>
                    <span className="font-semibold">£50.10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>52 weeks:</span>
                    <span className="font-semibold">£58.92</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="italic text-sm">For 30 hours ONLY: Meals & Consumables fee of £10 per day applies.</p>
                <p className="italic text-sm mt-2">For fewer days per week, please ask for alternative costs.</p>
              </div>
            </motion.div>
            
            <motion.div variants={childFadeIn} className="bg-white shadow-md rounded-lg p-6 border border-rainbow-pink/20">
              <h3 className="text-xl font-heading font-bold mb-3 text-rainbow-pink">Funding Session Times</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-rainbow-pink">15 Hours Funding ONLY</h4>
                  <p className="text-sm font-medium mt-2">AM Session Options:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>8:00am - 1:00pm for 3 days per week</li>
                    <li>9:00am - 12:00pm for 5 days per week</li>
                  </ul>
                  
                  <p className="text-sm font-medium mt-3">PM Session Options:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>1:00pm - 6:00pm for 3 days per week</li>
                    <li>1:00pm - 4:00pm for 5 days per week</li>
                  </ul>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <h4 className="font-medium text-rainbow-pink">30 Hours Funding ONLY</h4>
                  <p className="text-sm font-medium mt-2">AM Session Options:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>8:00am - 2:00pm for 5 days per week</li>
                    <li>8:00am - 6:00pm for 3 days per week</li>
                  </ul>
                  
                  <p className="text-sm font-medium mt-3">PM Session Options:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>12:00pm - 6:00pm for 5 days per week</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeUp}>
          <h2 className="text-2xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-rainbow-orange via-rainbow-yellow to-rainbow-green mb-4">Payment Information</h2>
          
          <div className="bg-white shadow-md rounded-lg p-6 border border-rainbow-orange/20 mb-6">
            <h3 className="text-xl font-heading font-bold mb-3 text-rainbow-orange">Bank Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Account Name:</p>
                <p className="text-muted-foreground">The Kingsborough Centre</p>
              </div>
              <div>
                <p className="font-medium">Bank Name:</p>
                <p className="text-muted-foreground">Barclays Bank</p>
              </div>
              <div>
                <p className="font-medium">Bank Address:</p>
                <p className="text-muted-foreground">142 High Street Uxbridge, UB8 2JX</p>
              </div>
              <div>
                <p className="font-medium">Account Number:</p>
                <p className="text-muted-foreground">60792977</p>
              </div>
              <div>
                <p className="font-medium">Sort Code:</p>
                <p className="text-muted-foreground">20-89-16</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 border border-rainbow-yellow/20">
            <h3 className="text-xl font-heading font-bold mb-3 text-rainbow-yellow">Terms & Conditions</h3>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Fees are payable monthly in advance by the 1st of each month.</li>
              <li>We accept direct bank transfers, childcare vouchers, and credit/debit card payments.</li>
              <li>Full time fees are calculated over 52 weeks and divided by 12 months.</li>
              <li>One month's notice is required for any changes to your child's attendance pattern.</li>
              <li>Nappies and wipes are provided as part of our service.</li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </ParentInfoLayout>
  );
}