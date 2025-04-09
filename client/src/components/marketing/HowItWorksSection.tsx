import { motion } from "framer-motion";

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 bg-secondary/10">
      <div className="container mx-auto px-6">
        <motion.h2 
          className="font-lora font-bold text-3xl md:text-4xl text-center text-primary mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          How DragonRealm Works
        </motion.h2>
        
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <motion.div 
            className="md:w-1/2"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="scroll-container bg-background/80 border border-secondary/30 rounded-lg shadow-lg p-8">
              <div className="space-y-6">
                <motion.div 
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">1</div>
                  <div>
                    <h3 className="font-lora font-semibold text-xl text-primary">Create an Account</h3>
                    <p className="font-opensans text-foreground mt-2">Sign up with your email or use OAuth with Google or Discord to get started.</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">2</div>
                  <div>
                    <h3 className="font-lora font-semibold text-xl text-primary">Build Your Campaign or Character</h3>
                    <p className="font-opensans text-foreground mt-2">Game Masters can create campaigns, while players can build characters following D&D 5e rules.</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">3</div>
                  <div>
                    <h3 className="font-lora font-semibold text-xl text-primary">Invite Players & Collaborate</h3>
                    <p className="font-opensans text-foreground mt-2">Share your campaign with players or join existing campaigns with character sheets.</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">4</div>
                  <div>
                    <h3 className="font-lora font-semibold text-xl text-primary">Play & Track Progress</h3>
                    <p className="font-opensans text-foreground mt-2">Use the app during your sessions to manage encounters, track character stats, and record notes.</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="md:w-1/2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="bg-accent/10 p-2 rounded-t-lg flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="ml-2 text-xs text-foreground opacity-70">DragonRealm App</div>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1585504198199-20277593b94f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="DragonRealm App Interface" 
                className="w-full h-auto rounded-b-lg shadow-sm"
              />
              <div className="mt-4 flex justify-between">
                <div className="font-opensans text-sm text-foreground">Character Sheet Demo</div>
                <div className="font-opensans text-sm text-primary">Dwarven Paladin Lv.5</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
