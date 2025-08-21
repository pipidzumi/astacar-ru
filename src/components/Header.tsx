import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Heart, User, Gavel, Plus } from "lucide-react";
import { AuthDialog } from "./AuthDialog";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Gavel className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Astacar
            </span>
          </div>
          <Badge variant="outline" className="text-xs">MVP</Badge>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Поиск по марке, модели..."
              className="pl-10 bg-muted/50"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            Каталог
          </Button>
          <Button variant="ghost" size="sm">
            Как это работает
          </Button>
          
          {/* User Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
            
            <AuthDialog>
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </AuthDialog>
            
            <Button variant="default" size="sm" className="ml-2">
              <Plus className="h-4 w-4 mr-1" />
              Продать авто
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};