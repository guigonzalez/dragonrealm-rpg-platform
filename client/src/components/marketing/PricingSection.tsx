import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 * index,
      duration: 0.5,
    }
  })
};

export default function PricingSection() {
  return (
    <section id="pricing" className="py-16 bg-secondary/10">
      <div className="container mx-auto px-6">
        <motion.h2 
          className="font-lora font-bold text-3xl md:text-4xl text-center text-primary mb-4"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Choose Your Adventure Plan
        </motion.h2>
        <motion.p 
          className="font-opensans text-center text-foreground max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Select the perfect plan for your D&D journey, from solo adventurers to massive campaigns.
        </motion.p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <motion.div 
            className="bg-white rounded-lg border border-secondary/20 shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-2"
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
          >
            <div className="bg-secondary/5 p-6 text-center border-b border-secondary/20">
              <h3 className="font-lora font-bold text-2xl text-primary mb-2">Adventurer</h3>
              <p className="font-opensans text-foreground/70 mb-4">For solo players</p>
              <div className="flex justify-center items-baseline">
                <span className="font-lora font-bold text-4xl text-primary">$0</span>
                <span className="font-opensans text-foreground/70 ml-1">/month</span>
              </div>
            </div>
            
            <div className="p-6">
              <ul className="font-opensans space-y-3 mb-6">
                <li className="flex items-center text-foreground">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>1 character sheet</span>
                </li>
                <li className="flex items-center text-foreground">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>Basic character builder</span>
                </li>
                <li className="flex items-center text-foreground">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>Dice roller & basic tools</span>
                </li>
                <li className="flex items-center text-foreground/50">
                  <span className="text-red-500 mr-2">✕</span>
                  <span>Campaign management</span>
                </li>
                <li className="flex items-center text-foreground/50">
                  <span className="text-red-500 mr-2">✕</span>
                  <span>NPC creator</span>
                </li>
              </ul>
              
              <Button 
                variant="outline"
                className="w-full py-3 px-0 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
              >
                Get Started Free
              </Button>
            </div>
          </motion.div>
          
          {/* Standard Plan */}
          <motion.div 
            className="bg-white rounded-lg border-2 border-primary shadow-xl overflow-hidden transition-transform duration-300 hover:-translate-y-2 relative"
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
          >
            <div className="absolute top-0 right-0 bg-accent text-white text-xs font-opensans font-semibold px-3 py-1 rounded-bl-lg">POPULAR</div>
            
            <div className="bg-primary/10 p-6 text-center border-b border-primary/20">
              <h3 className="font-lora font-bold text-2xl text-primary mb-2">Dungeon Master</h3>
              <p className="font-opensans text-foreground/70 mb-4">For game masters</p>
              <div className="flex justify-center items-baseline">
                <span className="font-lora font-bold text-4xl text-primary">$9.99</span>
                <span className="font-opensans text-foreground/70 ml-1">/month</span>
              </div>
            </div>
            
            <div className="p-6">
              <ul className="font-opensans space-y-3 mb-6">
                <li className="flex items-center text-foreground">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>5 character sheets</span>
                </li>
                <li className="flex items-center text-foreground">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>Advanced character builder</span>
                </li>
                <li className="flex items-center text-foreground">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>Campaign management</span>
                </li>
                <li className="flex items-center text-foreground">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>NPC creator & database</span>
                </li>
                <li className="flex items-center text-foreground">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>Encounter builder</span>
                </li>
              </ul>
              
              <Button className="w-full py-3 magic-button">
                Choose Plan
              </Button>
            </div>
          </motion.div>
          
          {/* Premium Plan */}
          <motion.div 
            className="bg-white rounded-lg border border-secondary/20 shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-2"
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={cardVariants}
          >
            <div className="bg-secondary/5 p-6 text-center border-b border-secondary/20">
              <h3 className="font-lora font-bold text-2xl text-primary mb-2">Legend</h3>
              <p className="font-opensans text-foreground/70 mb-4">For professional campaigns</p>
              <div className="flex justify-center items-baseline">
                <span className="font-lora font-bold text-4xl text-primary">$19.99</span>
                <span className="font-opensans text-foreground/70 ml-1">/month</span>
              </div>
            </div>
            
            <div className="p-6">
              <ul className="font-opensans space-y-3 mb-6">
                <li className="flex items-center text-foreground">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>Unlimited character sheets</span>
                </li>
                <li className="flex items-center text-foreground">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>Premium character builder</span>
                </li>
                <li className="flex items-center text-foreground">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>Advanced campaign tools</span>
                </li>
                <li className="flex items-center text-foreground">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>Custom content creation</span>
                </li>
                <li className="flex items-center text-foreground">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>Priority support</span>
                </li>
              </ul>
              
              <Button 
                variant="outline"
                className="w-full py-3 px-0 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
              >
                Choose Plan
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
