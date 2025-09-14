import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Heart, User, Gavel, Plus } from "lucide-react";
import { AuthDialog } from "./AuthDialog";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import AstacarIcon from "@/assets/logos/1_front_astacar_logo.svg?react";
import AstacarWordmark from "@/assets/logos/astacar_logo_font_mono.svg?react";


export const Header = () => {
  const navigate = useNavigate();


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link to="/" aria-label="Astacar — home" className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Astacar Icon */}
            <div className="h-8 md:h-10 w-8 md:w-10 text-[#4B0082]" data-testid="logo-icon">
              <AstacarIcon className="h-full w-full" aria-hidden="true" />
            </div>
            
            {/* Astacar Wordmark */}
            <div className="h-6 md:h-8 w-auto text-[#4B0082]" data-testid="logo-wordmark">
              <AstacarWordmark className="h-full w-auto" aria-hidden="true" />
            </div>
          </div>
          <Badge variant="outline" className="text-xs hidden sm:block">MVP</Badge>
        </Link>

        {/* Search - Hidden on mobile, shown on tablet+ */}
        <div className="flex-1 max-w-md mx-4 md:mx-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Поиск по марке, модели..."
              className="pl-10 bg-muted/50"
              aria-label="Поиск автомобилей"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-2 md:gap-4 ml-auto">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Каталог
            </Link>
            <Link to="/how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
              Как это работает
            </Link>
          </div>
          
          {/* User Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            <Button variant="ghost" size="icon" aria-label="Избранное">
              <Heart className="h-4 w-4" />
            </Button>
            
            <AuthDialog>
              <Button variant="ghost" size="icon" aria-label="Вход в аккаунт">
                <User className="h-4 w-4" />
              </Button>
            </AuthDialog>
            
            <Button 
              variant="default" 
              size="sm" 
              className="ml-2" 
              onClick={() => navigate('/sell')}
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Продать авто</span>
              <span className="sm:hidden">Продать</span>
            </Button>
          </div>
        </nav>
      </div>
      
      {/* Mobile Search - Shown on mobile only */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Поиск..."
            className="pl-10 bg-muted/50"
            aria-label="Поиск автомобилей"
          />
        </div>
      </div>
    </header>
  );
};