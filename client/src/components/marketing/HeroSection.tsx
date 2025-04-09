import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function HeroSection() {
  const { t } = useTranslation();
  
  return (
    <section className="bg-background">
      <div className="container mx-auto px-6 py-12 md:py-24 flex flex-col md:flex-row items-center">
        <motion.div 
          className="md:w-1/2 mb-8 md:mb-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-lora font-bold text-4xl md:text-5xl text-primary mb-4">{t('landing.heroTitle')}</h1>
          <p className="font-opensans text-lg mb-6">{t('landing.heroSubtitle')}</p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              onClick={() => window.location.href = '/auth'}
              className="magic-button bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
            >
              {t('landing.getStarted')}
            </Button>
            <a href="#features">
              <Button variant="outline" className="bg-transparent border-2 border-primary text-primary px-6 py-3 rounded-md hover:bg-primary hover:text-white transition-colors">
                {t('landing.learnMore')}
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
            <img src="https://images.pexels.com/photos/5428088/pexels-photo-5428088.jpeg?auto=compress&cs=tinysrgb&w=800" alt="D&D dice and figurines" className="rounded-md shadow-sm object-cover h-48 w-full" />
          </div>
          <motion.div 
            className="parchment bg-secondary/20 p-6 rounded-md shadow-lg transform -rotate-3 absolute top-10 -right-5"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <img src="https://images.pexels.com/photos/2509934/pexels-photo-2509934.jpeg?auto=compress&cs=tinysrgb&w=800" alt="RPG board game with dice" className="rounded-md shadow-sm object-cover h-40 w-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
