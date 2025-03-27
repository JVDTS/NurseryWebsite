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
          <h2 className="text-2xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-rainbow-red via-rainbow-orange to-rainbow-yellow mb-4">Fee Structure</h2>
          <p className="text-muted-foreground mb-6">
            At Coat of Many Colours Nursery, we strive to provide high-quality childcare at competitive rates. 
            Our fees include all meals, snacks, and standard activities. 
            We offer various attendance options to suit your family's needs.
          </p>
          
          <div className="grid gap-8 md:grid-cols-2">
            <motion.div variants={childFadeIn} className="bg-white shadow-md rounded-lg p-6 border border-rainbow-red/20">
              <h3 className="text-xl font-heading font-bold mb-3 text-rainbow-red">Full Day Care</h3>
              <p className="font-medium text-foreground">8:00am - 6:00pm</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Daily Rate:</span>
                  <span className="font-semibold">£58.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Weekly Rate (5 days):</span>
                  <span className="font-semibold">£275.00</span>
                </div>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="flex justify-between">
                  <span>Monthly (4 weeks):</span>
                  <span className="font-semibold">£1,100.00</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={childFadeIn} className="bg-white shadow-md rounded-lg p-6 border border-rainbow-orange/20">
              <h3 className="text-xl font-heading font-bold mb-3 text-rainbow-orange">Half Day Care</h3>
              <p className="font-medium text-foreground">8:00am - 1:00pm or 1:00pm - 6:00pm</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Morning Session:</span>
                  <span className="font-semibold">£35.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Afternoon Session:</span>
                  <span className="font-semibold">£35.00</span>
                </div>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="flex justify-between">
                  <span>Weekly (5 half days):</span>
                  <span className="font-semibold">£165.00</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeUp} className="mb-12">
          <h2 className="text-2xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-rainbow-green via-rainbow-blue to-rainbow-purple mb-4">Additional Services</h2>
          
          <div className="bg-white shadow-md rounded-lg p-6 border border-rainbow-green/20 mb-6">
            <h3 className="text-xl font-heading font-bold mb-3 text-rainbow-green">Early Drop-off / Late Pick-up</h3>
            <p className="mb-4">Subject to availability and by prior arrangement only.</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Additional Hour Rate:</span>
                <span className="font-semibold">£8.00 per hour</span>
              </div>
              <div className="flex justify-between">
                <span>Late Collection Fee (without notice):</span>
                <span className="font-semibold">£15.00 per 15 minutes</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 border border-rainbow-blue/20">
            <h3 className="text-xl font-heading font-bold mb-3 text-rainbow-blue">Special Activities and Trips</h3>
            <p className="mb-4">Occasionally, we organize special activities and trips that may incur additional costs.</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Local Trips:</span>
                <span className="font-semibold">£5.00 - £10.00</span>
              </div>
              <div className="flex justify-between">
                <span>Special Workshops:</span>
                <span className="font-semibold">Varies by activity</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeUp} className="mb-12">
          <h2 className="text-2xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-rainbow-pink via-rainbow-red to-rainbow-orange mb-4">Discounts</h2>
          
          <div className="bg-white shadow-md rounded-lg p-6 border border-rainbow-pink/20">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Sibling Discount:</span>
                <span className="px-3 py-1 bg-rainbow-red/10 rounded-full text-rainbow-red font-semibold">10% off for second child</span>
              </div>
              <div className="flex justify-between items-center">
                <span>NHS/Emergency Services Discount:</span>
                <span className="px-3 py-1 bg-rainbow-orange/10 rounded-full text-rainbow-orange font-semibold">5% off</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Advance Payment Discount (3 months):</span>
                <span className="px-3 py-1 bg-rainbow-pink/10 rounded-full text-rainbow-pink font-semibold">3% off</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={fadeUp}>
          <h2 className="text-2xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-rainbow-blue via-rainbow-purple to-rainbow-pink mb-4">Payment Information</h2>
          
          <div className="bg-white shadow-md rounded-lg p-6 border border-rainbow-blue/20 mb-6">
            <h3 className="text-xl font-heading font-bold mb-3 text-rainbow-blue">Terms</h3>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Fees are payable monthly in advance by the 1st of each month.</li>
              <li>We accept direct bank transfers, childcare vouchers, and credit/debit card payments.</li>
              <li>Late payment may incur a 5% administrative fee.</li>
              <li>Fees are reviewed annually, with any changes taking effect in September.</li>
              <li>One month's notice is required for any changes to your child's attendance pattern.</li>
            </ul>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 border border-rainbow-purple/20">
            <h3 className="text-xl font-heading font-bold mb-3 text-rainbow-purple">Funding and Schemes</h3>
            <p className="mb-4">We accept various government funding schemes:</p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>15 hours free entitlement for 3-4 year olds</li>
              <li>30 hours extended entitlement for eligible 3-4 year olds</li>
              <li>2-year-old funding for eligible families</li>
              <li>Tax-Free Childcare</li>
              <li>Childcare vouchers</li>
            </ul>
            <p className="mt-4 italic">Please speak to our nursery manager for more information about eligibility and how to apply.</p>
          </div>
        </motion.div>
      </motion.div>
    </ParentInfoLayout>
  );
}