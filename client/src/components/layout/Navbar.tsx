import { useState } from "react";
import { Link, useLocation } from "wouter";
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

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

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
          <i className="ri-dragonfight-fill text-3xl text-accent"></i>
          <Link href="/">
            <h1 className="font-lora font-bold text-xl md:text-2xl cursor-pointer">DragonRealm</h1>
          </Link>
        </div>
        
        <nav className="hidden md:flex space-x-8 items-center">
          {isHome ? (
            <>
              <a href="#features" className="font-opensans hover:text-accent transition-colors">Features</a>
              <a href="#how-it-works" className="font-opensans hover:text-accent transition-colors">How It Works</a>
              <a href="#pricing" className="font-opensans hover:text-accent transition-colors">Pricing</a>
            </>
          ) : (
            user && (
              <>
                <Link href="/dashboard">
                  <a className="font-opensans hover:text-accent transition-colors">Dashboard</a>
                </Link>
                <Link href="/character-creation">
                  <a className="font-opensans hover:text-accent transition-colors">Create Character</a>
                </Link>
              </>
            )
          )}
          
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
                <Link href="/dashboard">
                  <DropdownMenuItem>Dashboard</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button className="magic-button bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90 transition-colors">
                Sign In
              </Button>
            </Link>
          )}
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
                  Features
                </a>
                <a 
                  href="#how-it-works" 
                  className="font-opensans text-white hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </a>
                <a 
                  href="#pricing" 
                  className="font-opensans text-white hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </a>
              </>
            ) : (
              user && (
                <>
                  <Link href="/dashboard">
                    <a 
                      className="font-opensans text-white hover:text-accent transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </a>
                  </Link>
                  <Link href="/character-creation">
                    <a 
                      className="font-opensans text-white hover:text-accent transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Create Character
                    </a>
                  </Link>
                </>
              )
            )}
            
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
                  Log out
                </button>
              </>
            ) : (
              <Link href="/auth">
                <a 
                  className="magic-button font-opensans bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90 transition-colors text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </a>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
