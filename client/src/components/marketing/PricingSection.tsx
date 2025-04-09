import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  
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
          {t("landing.pricingSection.title")}
        </motion.h2>
        <motion.p 
          className="font-opensans text-center text-foreground max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {t("landing.pricingSection.subtitle")}
        </motion.p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
              <h3 className="font-lora font-bold text-2xl text-primary mb-2">{t("landing.pricingSection.freePlan.title")}</h3>
              <p className="font-opensans text-foreground/70 mb-4">{t("landing.pricingSection.freePlan.description")}</p>
              <div className="flex justify-center items-baseline">
                <span className="font-lora font-bold text-4xl text-primary">{t("landing.pricingSection.freePlan.price")}</span>
                <span className="font-opensans text-foreground/70 ml-1">{t("landing.pricingSection.freePlan.period")}</span>
              </div>
            </div>
            
            <div className="p-6">
              <ul className="font-opensans space-y-3 mb-6">
                <li className="flex items-center text-foreground">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>5 {t("landing.pricingSection.freePlan.features.characterSheet")}</span>
                </li>
                <li className="flex items-center text-foreground">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>{t("landing.pricingSection.freePlan.features.characterBuilder")}</span>
                </li>
                <li className="flex items-center text-foreground">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>{t("landing.pricingSection.freePlan.features.diceRoller")}</span>
                </li>
                <li className="flex items-center text-foreground">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>1 {t("landing.pricingSection.freePlan.features.campaignManagement")}</span>
                </li>
                <li className="flex items-center text-foreground">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>5 {t("landing.pricingSection.freePlan.features.npcCreator")}</span>
                </li>
              </ul>
              
              <Button 
                variant="outline"
                className="w-full py-3 px-0 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
              >
                {t("landing.pricingSection.freePlan.button")}
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
            <div className="absolute top-0 left-0 bg-red-600 text-white text-xs font-opensans font-semibold px-3 py-1 rounded-br-lg">{t("landing.pricingSection.standardPlan.comingSoon")}</div>
            
            <div className="bg-primary/10 p-6 text-center border-b border-primary/20">
              <h3 className="font-lora font-bold text-2xl text-primary mb-2">{t("landing.pricingSection.standardPlan.title")}</h3>
              <p className="font-opensans text-foreground/70 mb-4">{t("landing.pricingSection.standardPlan.description")}</p>
              <div className="flex justify-center items-baseline">
                <span className="font-lora font-bold text-4xl text-primary">{t("landing.pricingSection.standardPlan.price")}</span>
                <span className="font-opensans text-foreground/70 ml-1">{t("landing.pricingSection.standardPlan.period")}</span>
              </div>
            </div>
            
            <div className="p-6">
              <ul className="font-opensans space-y-3 mb-6">
                <li className="flex items-center text-foreground">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>{t("landing.pricingSection.standardPlan.features.unlimitedCharSheets")}</span>
                </li>
                <li className="flex items-center text-foreground">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>{t("landing.pricingSection.standardPlan.features.advancedBuilder")}</span>
                </li>
                <li className="flex items-center text-foreground">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>{t("landing.pricingSection.standardPlan.features.unlimitedCampaigns")}</span>
                </li>
                <li className="flex items-center text-foreground">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span>{t("landing.pricingSection.standardPlan.features.npcCreator")}</span>
                </li>
              </ul>
              
              <Button className="w-full py-3 magic-button" disabled>
                {t("landing.pricingSection.standardPlan.button")}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
