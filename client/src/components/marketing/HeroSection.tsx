import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="bg-background">
      <div className="container mx-auto px-6 py-12 md:py-24 flex flex-col md:flex-row items-center">
        <motion.div 
          className="md:w-1/2 mb-8 md:mb-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-lora font-bold text-4xl md:text-5xl text-primary mb-4">Your Ultimate D&D Companion</h1>
          <p className="font-opensans text-lg mb-6">Elevate your tabletop role-playing experience with comprehensive campaign management, character creation tools, and interactive character sheets.</p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/auth">
              <Button className="magic-button bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors">
                Get Started
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" className="bg-transparent border-2 border-primary text-primary px-6 py-3 rounded-md hover:bg-primary hover:text-white transition-colors">
                Learn More
              </Button>
            </a>
          </div>
        </motion.div>
        
        <motion.div 
          className="md:w-1/2 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="parchment bg-secondary/20 p-6 rounded-md shadow-lg transform rotate-2">
            <img src="https://images.unsplash.com/photo-1605118892221-e2b18e0a9838?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="D&D gamers playing with app" className="rounded-md shadow-sm" />
          </div>
          <motion.div 
            className="parchment bg-secondary/20 p-6 rounded-md shadow-lg transform -rotate-3 absolute top-10 -right-5"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <img src="https://images.unsplash.com/photo-1547638375-ebf04735d792?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Character sheet on app" className="rounded-md shadow-sm" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
