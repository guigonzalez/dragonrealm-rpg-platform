import { motion } from "framer-motion";

const features = [
  {
    icon: <i className="ri-sword-fill text-2xl text-primary"></i>,
    title: "Character Creation",
    description: "Create and customize your D&D 5e characters following the official rules with our step-by-step wizard."
  },
  {
    icon: <i className="ri-map-pin-fill text-2xl text-primary"></i>,
    title: "Campaign Management",
    description: "Build immersive worlds, manage NPCs, create encounters, and track your campaign's progress."
  },
  {
    icon: <i className="ri-file-paper-2-fill text-2xl text-primary"></i>,
    title: "Interactive Character Sheets",
    description: "Manage character stats, inventory, spells, and abilities with real-time tracking and updates."
  },
  {
    icon: <i className="ri-user-star-fill text-2xl text-primary"></i>,
    title: "NPC Creation",
    description: "Quickly generate and manage non-player characters with customizable templates and backstories."
  },
  {
    icon: <i className="ri-book-fill text-2xl text-primary"></i>,
    title: "Session Notes",
    description: "Keep track of your adventures with structured session notes, player achievements, and quest logs."
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-16">
      <div className="container mx-auto px-6">
        <motion.h2 
          className="font-lora font-bold text-3xl md:text-4xl text-center text-primary mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Powerful Tools for Players & Game Masters
        </motion.h2>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {/* Feature 1, 2, 3 */}
          {features.slice(0, 3).map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-background border border-secondary/20 rounded-lg p-6 shadow-md transition-transform duration-300 hover:-translate-y-1"
              variants={item}
            >
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="font-lora font-semibold text-xl mb-2 text-primary">{feature.title}</h3>
              <p className="font-opensans text-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {/* Feature 4, 5 */}
          {features.slice(3, 5).map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-background border border-secondary/20 rounded-lg p-6 shadow-md transition-transform duration-300 hover:-translate-y-1"
              variants={item}
            >
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="font-lora font-semibold text-xl mb-2 text-primary">{feature.title}</h3>
              <p className="font-opensans text-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
