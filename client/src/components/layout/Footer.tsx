import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <i className="ri-dragonfight-fill text-3xl text-accent"></i>
              <h2 className="font-lora font-bold text-xl">DragonRealm</h2>
            </div>
            <p className="font-opensans text-white/80 mb-4">Enhancing your D&D experience with powerful digital tools for Game Masters and Players.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-accent"><i className="ri-twitter-fill text-xl"></i></a>
              <a href="#" className="text-white hover:text-accent"><i className="ri-discord-fill text-xl"></i></a>
              <a href="#" className="text-white hover:text-accent"><i className="ri-instagram-fill text-xl"></i></a>
              <a href="#" className="text-white hover:text-accent"><i className="ri-youtube-fill text-xl"></i></a>
            </div>
          </div>
          
          <div>
            <h3 className="font-lora font-semibold text-lg mb-4">Product</h3>
            <ul className="font-opensans space-y-2">
              <li><a href="#features" className="text-white/80 hover:text-accent">Features</a></li>
              <li><a href="#pricing" className="text-white/80 hover:text-accent">Pricing</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent">Beta Program</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent">Roadmap</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-lora font-semibold text-lg mb-4">Resources</h3>
            <ul className="font-opensans space-y-2">
              <li><a href="#" className="text-white/80 hover:text-accent">Documentation</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent">Community</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent">Video Tutorials</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent">API</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-lora font-semibold text-lg mb-4">Contact</h3>
            <ul className="font-opensans space-y-2">
              <li><a href="#" className="text-white/80 hover:text-accent">Support</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent">Sales</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent">Report a Bug</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent">Request a Feature</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="font-opensans text-sm text-white/60 mb-4 md:mb-0">© 2023 DragonRealm. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="font-opensans text-sm text-white/60 hover:text-white">Privacy Policy</a>
            <a href="#" className="font-opensans text-sm text-white/60 hover:text-white">Terms of Service</a>
            <a href="#" className="font-opensans text-sm text-white/60 hover:text-white">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
