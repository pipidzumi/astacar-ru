import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Heart, User, Gavel, Plus } from "lucide-react";
import { AuthDialog } from "./AuthDialog";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";


export const Header = () => {
  const navigate = useNavigate();

  // Array of all icon components - inline SVGs for proper currentColor styling
  const iconComponents = [
    // 1 - Steering Wheel
    () => <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13v2h2V7h-2zm0 8v2h2v-2h-2zm-4-5h2v2H7v-2zm8 0h2v2h-2v-2zm-3-1c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>,
    // 2 - Speedometer  
    () => <path d="M12 2C6.48 2 2 6.48 2 12c0 2.21.74 4.26 2 5.9L12 12l8-5.9c1.26-1.64 2-3.69 2-5.9 0-5.52-4.48-10-10-10zm0 2c4.41 0 8 3.59 8 8 0 1.78-.61 3.42-1.64 4.72L12 12 5.64 16.72C4.61 15.42 4 13.78 4 12c0-4.41 3.59-8 8-8zm-6.93 14.36C6.82 19.74 9.24 21 12 21s5.18-1.26 6.93-2.64L12 12l-6.93 6.36z"/>,
    // 3 - Car Key
    () => <path d="M12.65 10A5.99 5.99 0 0 0 7 4 6 6 0 0 0 1 10c0 2.61 1.67 4.83 4 5.65V17l2 2h2v2h2v2h7v-3l-2.35-2.35zM7 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>,
    // 4 - Auction Gavel
    () => <path d="M1 21h22v2H1v-2zM5.245 8.07l2.83-2.827 14.14 14.142-2.827 2.828L5.245 8.07zM12.317 1l5.657 5.656-2.83 2.83-5.654-5.66L12.317 1z"/>,
    // 5 - Car Front
    () => <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>,
    // 6 - Car Side Profile (NEW - no longer duplicate)
    () => <path d="M19 17h-2v-1c0-.55-.45-1-1-1s-1 .45-1 1v1h-8v-1c0-.55-.45-1-1-1s-1 .45-1 1v1H3v-6h2.05l1.93-6.7c.21-.72.89-1.3 1.65-1.3h6.74c.76 0 1.44.58 1.65 1.3L19 11v6zm-8-3h2v1h-2v-1zm-6 1c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm14 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>,
    // 7 - Shield Protection  
    () => <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>,
    // 8 - Location Pin
    () => <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>,
    // 9 - Checkmark Badge
    () => <path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-6.29-2.12L10 16.59l-3.71-3.71 1.42-1.41L10 14.17l5.29-5.29 1.42 1.41z"/>,
    // 10 - Star Badge
    () => <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>,
    // 11 - Odometer  
    () => <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>,
    // 12 - Wrench Tool
    () => <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
  ];
  
  // Random icon selection on component mount
  const [selectedIconIndex, setSelectedIconIndex] = useState(0);
  
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * iconComponents.length);
    setSelectedIconIndex(randomIndex);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link to="/" aria-label="Astacar — home" className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Random Icon */}
            <div className="h-8 md:h-10 w-8 md:w-10 text-[#4B0082]" data-testid="logo-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
                <title>Astacar</title>
                {iconComponents[selectedIconIndex]()}
              </svg>
            </div>
            
            {/* Gradient Wordmark */}
            <div className="h-8 md:h-10" data-testid="logo-wordmark">
              <svg viewBox="0 0 180 36" className="h-full w-auto" aria-hidden="true">
                <defs>
                  <linearGradient id="astacarGradientHeader" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4B0082"/>
                    <stop offset="50%" stopColor="#32DCFA"/>
                    <stop offset="100%" stopColor="#00FFAF"/>
                  </linearGradient>
                </defs>
                <title>ASTACAR</title>
                {/* A */}
                <path d="M8 28L12 10L16 28H19L13 6H11L5 28H8ZM9.5 22H14.5L12 14L9.5 22Z" fill="url(#astacarGradientHeader)"/>
                {/* S */}
                <path d="M26 14C26 12 27 10 29 10C30.5 10 31.5 11 31.5 12.5H34C34 9.5 32 7.5 29 7.5C25.5 7.5 23.5 10 23.5 14C23.5 18 25.5 20 29 20C30.5 20 31.5 19 31.5 17.5H34C34 20.5 32 22.5 29 22.5C25.5 22.5 23.5 20.5 23.5 16.5C23.5 16 23.5 15 26 14Z" fill="url(#astacarGradientHeader)"/>
                {/* T */}
                <path d="M36 10V7.5H48V10H44V28H41V10H36Z" fill="url(#astacarGradientHeader)"/>
                {/* A */}
                <path d="M54 28L58 10L62 28H65L59 6H57L51 28H54ZM55.5 22H60.5L58 14L55.5 22Z" fill="url(#astacarGradientHeader)"/>
                {/* C */}
                <path d="M73 28C77 28 80 25 80 20.5H77.5C77.5 23.5 75.5 25.5 73 25.5C70 25.5 68 23 68 17.5C68 12 70 9.5 73 9.5C75.5 9.5 77.5 11.5 77.5 14.5H80C80 9.5 77 7 73 7C68 7 65.5 11 65.5 17.5C65.5 24 68 28 73 28Z" fill="url(#astacarGradientHeader)"/>
                {/* A */}
                <path d="M87 28L91 10L95 28H98L92 6H90L84 28H87ZM88.5 22H93.5L91 14L88.5 22Z" fill="url(#astacarGradientHeader)"/>
                {/* R */}
                <path d="M104 7.5V28H107V19.5H111L115 28H118L113.5 19C116 18.5 117.5 16.5 117.5 13.5C117.5 9.5 115 7.5 111 7.5H104ZM107 10H111C113 10 114.5 11 114.5 13.5C114.5 16 113 17 111 17H107V10Z" fill="url(#astacarGradientHeader)"/>
              </svg>
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