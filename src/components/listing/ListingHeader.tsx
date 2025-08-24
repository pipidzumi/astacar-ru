import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share, Heart, Clock, Users, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import type { ListingData } from "@/lib/mockData";

interface ListingHeaderProps {
  listing: ListingData;
  serverTime: Date;
}

export const ListingHeader = ({ listing, serverTime }: ListingHeaderProps) => {
  const getStatusBadge = () => {
    switch (listing.status) {
      case "live":
        return <Badge className="bg-auction-live text-white">Активный</Badge>;
      case "finished":
        return <Badge className="bg-auction-closed text-white">Завершён</Badge>;
      default:
        return <Badge variant="outline">{listing.status}</Badge>;
    }
  };

  const getTimeLeft = () => {
    const endTime = new Date(listing.schedule.endAt);
    const timeLeft = endTime.getTime() - serverTime.getTime();
    
    if (timeLeft <= 0) return "Завершён";
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}д ${hours}ч`;
    if (hours > 0) return `${hours}ч ${minutes}м`;
    return `${minutes}м`;
  };

  const bidCount = listing.bidding.bidHistory.length;
  
  return (
    <div className="mb-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link to="/" className="hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4 inline mr-1" />
          Каталог
        </Link>
        <span>/</span>
        <span>Лот #{listing.id}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{listing.vehicle.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{listing.vehicle.year} г.</span>
            <span>{listing.vehicle.mileage.toLocaleString()} км</span>
            <span>{listing.meta.location}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {listing.meta.noReserve && (
            <Badge className="bg-auction-reserve text-white">Без резерва</Badge>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-surface-elevated rounded-lg border">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            ₽{listing.pricing.currentPrice.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Текущая ставка</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-lg font-semibold">
            <Users className="h-4 w-4" />
            {bidCount}
          </div>
          <div className="text-sm text-muted-foreground">Ставок</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-lg font-semibold">
            <Clock className="h-4 w-4" />
            {getTimeLeft()}
          </div>
          <div className="text-sm text-muted-foreground">Осталось</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-lg font-semibold">
            <Eye className="h-4 w-4" />
            245
          </div>
          <div className="text-sm text-muted-foreground">Просмотров</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4">
        <Button variant="outline" size="sm">
          <Heart className="h-4 w-4 mr-2" />
          В избранное
        </Button>
        <Button variant="outline" size="sm">
          <Share className="h-4 w-4 mr-2" />
          Поделиться
        </Button>
      </div>
    </div>
  );
};