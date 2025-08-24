import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, Clock, Eye, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface AuctionCardProps {
  id: string;
  title: string;
  year: number;
  mileage: number;
  currentBid: number;
  startPrice: number;
  imageUrl: string;
  status: "live" | "ending" | "closed" | "no-reserve";
  timeLeft?: string;
  bidCount: number;
  viewCount: number;
  reserveMet?: boolean;
}

export const AuctionCard = ({ 
  id,
  title, 
  year, 
  mileage, 
  currentBid, 
  startPrice,
  imageUrl, 
  status, 
  timeLeft, 
  bidCount,
  viewCount,
  reserveMet 
}: AuctionCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "live": return "auction-live";
      case "ending": return "auction-ending";
      case "closed": return "auction-closed";
      case "no-reserve": return "auction-reserve";
      default: return "muted";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "live": return "Активный";
      case "ending": return "Заканчивается";
      case "closed": return "Завершён";
      case "no-reserve": return "Без резерва";
      default: return status;
    }
  };

  return (
    <Link to={`/listing/${id}`}>
      <Card className="group overflow-hidden border-0 shadow-card hover:shadow-premium transition-all duration-300 hover:-translate-y-1 cursor-pointer">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Status Badge */}
        <Badge 
          className={cn(
            "absolute top-3 left-3 font-medium text-white border-0",
            status === "live" && "bg-auction-live",
            status === "ending" && "bg-auction-ending", 
            status === "closed" && "bg-auction-closed",
            status === "no-reserve" && "bg-auction-reserve"
          )}
        >
          {getStatusText(status)}
        </Badge>

        {/* Favorite Button */}
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute top-3 right-3 bg-white/80 hover:bg-white backdrop-blur-sm"
        >
          <Heart className="h-4 w-4" />
        </Button>

        {/* Time Left Overlay */}
        {timeLeft && status !== "closed" && (
          <div className="absolute bottom-3 left-3 bg-black/80 text-white px-2 py-1 rounded text-sm font-medium backdrop-blur-sm">
            <Clock className="h-3 w-3 inline mr-1" />
            {timeLeft}
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        {/* Details */}
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <span>{year} г.</span>
          <span>{mileage.toLocaleString()} км</span>
        </div>

        {/* Price Section */}
        <div className="mt-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Текущая ставка</span>
            {reserveMet && (
              <Badge variant="outline" className="text-xs text-success">
                Резерв достигнут
              </Badge>
            )}
          </div>
          <div className="text-2xl font-bold text-foreground">
            ₽{currentBid.toLocaleString()}
          </div>
          {currentBid > startPrice && (
            <div className="flex items-center gap-1 text-sm text-success">
              <TrendingUp className="h-3 w-3" />
              +₽{(currentBid - startPrice).toLocaleString()}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {viewCount}
          </span>
          <span>{bidCount} ставок</span>
        </div>

        {/* Action Button */}
        <Button 
          variant={status === "closed" ? "outline" : "default"} 
          size="sm"
          disabled={status === "closed"}
        >
          {status === "closed" ? "Завершён" : "Сделать ставку"}
        </Button>
      </CardFooter>
    </Card>
    </Link>
  );
};