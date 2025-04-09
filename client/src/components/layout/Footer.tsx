import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { FaDiscord, FaInstagram, FaYoutube } from "react-icons/fa";

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <i className="ri-dragonfight-fill text-3xl text-accent"></i>
              <h2 className="font-lora font-bold text-xl">DragonRealm</h2>
            </div>
            <p className="font-opensans text-white/80 mb-4">{t("landing.footer.description")}</p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-accent"><FaDiscord className="text-xl" aria-label={t("landing.footer.socialLinks.discord")} /></a>
              <a href="#" className="text-white hover:text-accent"><FaInstagram className="text-xl" aria-label={t("landing.footer.socialLinks.instagram")} /></a>
              <a href="#" className="text-white hover:text-accent"><FaYoutube className="text-xl" aria-label={t("landing.footer.socialLinks.youtube")} /></a>
            </div>
          </div>
          
          <div>
            <h3 className="font-lora font-semibold text-lg mb-4">{t("landing.footer.product")}</h3>
            <ul className="font-opensans space-y-2">
              <li><a href="#features" className="text-white/80 hover:text-accent">{t("landing.footer.features")}</a></li>
              <li><a href="#pricing" className="text-white/80 hover:text-accent">{t("landing.footer.pricing")}</a></li>
              <li><a href="#demo" className="text-white/80 hover:text-accent">{t("landing.footer.demo")}</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-lora font-semibold text-lg mb-4">{t("landing.footer.resources")}</h3>
            <ul className="font-opensans space-y-2">
              <li><a href="#" className="text-white/80 hover:text-accent">{t("landing.footer.documentation")}</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent">{t("landing.footer.videoTutorials")}</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-lora font-semibold text-lg mb-4">{t("landing.footer.contact")}</h3>
            <ul className="font-opensans space-y-2">
              <li><a href="#" className="text-white/80 hover:text-accent">{t("landing.footer.support")}</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent">{t("landing.footer.reportBug")}</a></li>
              <li><a href="#" className="text-white/80 hover:text-accent">{t("landing.footer.requestFeature")}</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="font-opensans text-sm text-white/60 mb-4 md:mb-0">{t("landing.footer.copyright")}</p>
          <div className="flex space-x-6">
            <a href="#" className="font-opensans text-sm text-white/60 hover:text-white">{t("landing.footer.privacy")}</a>
            <a href="#" className="font-opensans text-sm text-white/60 hover:text-white">{t("landing.footer.terms")}</a>
            <a href="#" className="font-opensans text-sm text-white/60 hover:text-white">{t("landing.footer.cookies")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
