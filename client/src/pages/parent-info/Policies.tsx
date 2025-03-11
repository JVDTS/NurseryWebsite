import { motion } from "framer-motion";
import { FileText, Shield, HeartPulse, UserPlus, FileCheck, MessageCircle, Download } from "lucide-react";
import ParentInfoLayout from "@/components/ParentInfoLayout";
import { fadeUp, staggerContainer, childFadeIn } from "@/lib/animations";
import { Button } from "@/components/ui/button";

export default function PoliciesPage() {
  const policyCategories = [
    {
      title: "Safeguarding & Welfare",
      icon: <Shield className="h-8 w-8" />,
      color: "bg-red-100 text-red-600",
      policies: [
        "Safeguarding Children Policy",
        "Child Protection Procedures",
        "Prevent Duty Policy",
        "Online Safety Policy",
        "Mobile Phone and Camera Policy",
        "Intimate Care Policy",
        "Safe Recruitment Policy",
        "Whistleblowing Policy",
        "Lock-down Procedure"
      ]
    },
    {
      title: "Health & Safety",
      icon: <HeartPulse className="h-8 w-8" />,
      color: "bg-green-100 text-green-600",
      policies: [
        "Health and Safety Policy",
        "Risk Assessment Policy",
        "Fire Safety Policy",
        "Emergency Evacuation Procedure",
        "First Aid Policy",
        "Medication Administration Policy",
        "Accident and Incident Policy",
        "Food Hygiene Policy",
        "Allergen Management Policy",
        "Illness and Infectious Disease Policy"
      ]
    },
    {
      title: "Admissions & Registration",
      icon: <UserPlus className="h-8 w-8" />,
      color: "bg-blue-100 text-blue-600",
      policies: [
        "Admissions Policy",
        "Registration Procedure",
        "Settling-in Policy",
        "Fees and Payment Policy",
        "Late Collection Policy",
        "Non-collection of Children Policy",
        "Termination of Place Policy"
      ]
    },
    {
      title: "Learning & Development",
      icon: <FileCheck className="h-8 w-8" />,
      color: "bg-purple-100 text-purple-600",
      policies: [
        "Curriculum Policy",
        "Observation and Assessment Policy",
        "Equal Opportunities Policy",
        "Special Educational Needs and Disability (SEND) Policy",
        "Behavior Management Policy",
        "Biting Policy",
        "Outdoor Play Policy",
        "Sleep and Rest Policy"
      ]
    },
    {
      title: "Parent Partnership",
      icon: <MessageCircle className="h-8 w-8" />,
      color: "bg-amber-100 text-amber-600",
      policies: [
        "Parent Partnership Policy",
        "Complaints Procedure",
        "Confidentiality Policy",
        "Data Protection Policy",
        "GDPR Compliance Policy",
        "Social Media Policy",
        "Nursery Outings Policy"
      ]
    }
  ];

  return (
    <ParentInfoLayout 
      title="Nursery Policies" 
      subtitle="Our framework for providing safe, high-quality childcare and education"
      icon={<FileText />}
    >
      <motion.div
        className="max-w-4xl mx-auto"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp} className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-primary mb-4">About Our Policies</h2>
          <div className="bg-white shadow-md rounded-lg p-6 border border-primary/10">
            <p className="mb-4">
              At Coat of Many Colours Nursery, we maintain a comprehensive set of policies and procedures that guide our operations 
              and ensure we provide the highest standards of care and education. These policies are regularly reviewed and updated 
              to reflect current best practices and regulatory requirements.
            </p>
            <p className="mb-4">
              All our policies are available in full upon request. Parents are provided with key policies during the registration process, 
              and complete copies are available in our policy folders at each nursery location.
            </p>
            <p>
              Below is an overview of our main policy categories. For more information about any specific policy, 
              please speak to your nursery manager.
            </p>
          </div>
        </motion.div>
        
        <motion.div variants={fadeUp} className="mb-12 space-y-8">
          {policyCategories.map((category, index) => (
            <motion.div 
              key={category.title} 
              variants={childFadeIn}
              custom={index}
              className="bg-white shadow-md rounded-lg overflow-hidden border border-primary/10"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-4 md:items-center mb-6">
                  <div className={`${category.color} p-4 rounded-full`}>
                    {category.icon}
                  </div>
                  <h3 className="text-2xl font-heading font-bold">{category.title}</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-3">
                  {category.policies.map((policy, i) => (
                    <div 
                      key={i}
                      className="flex items-center gap-2 p-3 rounded-md hover:bg-gray-50"
                    >
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span>{policy}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div variants={fadeUp}>
          <h2 className="text-2xl font-heading font-bold text-primary mb-4">Regulatory Framework</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white shadow-md rounded-lg p-6 border border-primary/10">
              <h3 className="text-xl font-heading font-bold mb-3">Ofsted Registration</h3>
              <p className="text-muted-foreground mb-4">
                Our nurseries are registered with Ofsted and operate in compliance with the Early Years Foundation Stage (EYFS) 
                statutory framework and the Childcare Register requirements.
              </p>
              <div className="flex items-center justify-center p-4 bg-gray-50 rounded-md">
                <span className="font-semibold">Ofsted Registration Number:</span>
                <span className="ml-2">EY553721</span>
              </div>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-6 border border-primary/10">
              <h3 className="text-xl font-heading font-bold mb-3">Inspection Reports</h3>
              <p className="text-muted-foreground mb-4">
                Our most recent Ofsted inspection reports are available on the Ofsted website and displayed at each nursery. 
                We are proud of our quality ratings and continuously work to maintain and improve our standards.
              </p>
              <button className="w-full py-2 bg-primary text-white rounded-md font-semibold hover:bg-primary/90 transition-colors">
                View Latest Ofsted Report
              </button>
            </div>
          </div>
          
          <div className="mt-6 bg-white shadow-md rounded-lg p-6 border border-primary/10">
            <h3 className="text-xl font-heading font-bold mb-3">Policy Updates and Revisions</h3>
            <p className="mb-4">
              Our policies are reviewed at least annually, and more frequently if required by regulatory changes or operational needs. 
              Parents will be informed of any significant policy changes, and the latest versions are always available upon request.
            </p>
            <div className="p-4 bg-primary/10 rounded-md mb-6">
              <h4 className="font-semibold text-primary mb-2">Request a Policy</h4>
              <p className="text-sm mb-4">
                If you would like to receive a copy of any specific policy or the complete policy manual, please complete a policy 
                request form at reception or speak to the nursery manager.
              </p>
              <Button className="w-full flex items-center justify-center gap-2">
                <Download className="h-4 w-4" />
                Download Complete Policy Document (PDF)
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </ParentInfoLayout>
  );
}