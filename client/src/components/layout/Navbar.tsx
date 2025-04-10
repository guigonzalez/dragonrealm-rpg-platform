import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import LanguageSelector from "@/components/LanguageSelector";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const { t } = useTranslation();

  const isHome = location === "/";
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/assets/logo.png" alt="DragonRealm" className="h-8 md:h-8" />
          </Link>
        </div>
        
        <nav className="hidden md:flex space-x-8 items-center">
          {isHome ? (
            <>
              <a href="#features" className="font-opensans hover:text-accent transition-colors">{t('landing.featuresTitle')}</a>
              <a href="#how-it-works" className="font-opensans hover:text-accent transition-colors">{t('landing.howItWorks')}</a>
              <a href="#pricing" className="font-opensans hover:text-accent transition-colors">{t('landing.pricing')}</a>
            </>
          ) : (
            user && (
              <>
                <Link href="/dashboard" className="font-opensans hover:text-accent transition-colors">
                  {t('common.dashboard')}
                </Link>
                <Link href="/character-creation" className="font-opensans hover:text-accent transition-colors">
                  {t('character.createCharacter')}
                </Link>
              </>
            )
          )}
          
          <div className="flex items-center space-x-2">
            <LanguageSelector />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-accent text-primary">
                        {getInitials(user.displayName || user.username)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName || user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.href = '/dashboard'}>
                    {t('common.dashboard')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    {t('common.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => {
                  window.location.href = '/auth';
                }} 
                className="magic-button bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90 transition-colors"
              >
                {t('auth.login')}
              </Button>
            )}
          </div>
        </nav>
        
        <button onClick={toggleMobileMenu} className="md:hidden text-white focus:outline-none">
          <Menu className="h-6 w-6" />
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-primary/90">
          <div className="container mx-auto px-6 py-3 flex flex-col space-y-4">
            {isHome ? (
              <>
                <a 
                  href="#features" 
                  className="font-opensans text-white hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('landing.featuresTitle')}
                </a>
                <a 
                  href="#how-it-works" 
                  className="font-opensans text-white hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('landing.howItWorks')}
                </a>
                <a 
                  href="#pricing" 
                  className="font-opensans text-white hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('landing.pricing')}
                </a>
              </>
            ) : (
              user && (
                <>
                  <Link 
                    href="/dashboard" 
                    className="font-opensans text-white hover:text-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('common.dashboard')}
                  </Link>
                  <Link 
                    href="/character-creation" 
                    className="font-opensans text-white hover:text-accent transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('character.createCharacter')}
                  </Link>
                </>
              )
            )}
            
            <div className="flex items-center py-2">
              <LanguageSelector />
              <span className="ml-2 text-white">
                {t('common.language')}
              </span>
            </div>
            
            {user ? (
              <>
                <div className="font-opensans text-white">
                  {user.displayName || user.username}
                </div>
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="font-opensans text-white hover:text-accent transition-colors text-left"
                >
                  {t('common.logout')}
                </button>
              </>
            ) : (
              <Link 
                href="/auth"
                className="magic-button font-opensans bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90 transition-colors text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('auth.login')}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
