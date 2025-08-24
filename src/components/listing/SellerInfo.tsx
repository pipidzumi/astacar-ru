import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Star, 
  Calendar, 
  Shield, 
  MessageCircle, 
  TrendingUp,
  Award
} from "lucide-react";

interface SellerInfoProps {
  sellerId: string;
  sellerRating: number;
  sellerHistoryCount: number;
}

export const SellerInfo = ({ sellerId, sellerRating, sellerHistoryCount }: SellerInfoProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'fill-warning text-warning' 
            : i < rating 
              ? 'fill-warning/50 text-warning' 
              : 'text-muted-foreground'
        }`} 
      />
    ));
  };

  const getSellerBadge = () => {
    if (sellerHistoryCount >= 10) return { text: "Проверенный продавец", variant: "success" };
    if (sellerHistoryCount >= 5) return { text: "Опытный продавец", variant: "secondary" };
    return { text: "Новый продавец", variant: "outline" };
  };

  const badge = getSellerBadge();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Продавец
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seller Identity */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-gradient-primary rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="font-medium">{sellerId}</div>
            <Badge 
              variant={badge.variant as any}
              className={badge.variant === "success" ? "bg-success text-white" : ""}
            >
              <Shield className="h-3 w-3 mr-1" />
              {badge.text}
            </Badge>
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Рейтинг</span>
            <div className="flex items-center gap-1">
              {renderStars(sellerRating)}
              <span className="ml-1 font-medium">{sellerRating}</span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold">{sellerHistoryCount}</div>
            <div className="text-xs text-muted-foreground">Продаж</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">98%</div>
            <div className="text-xs text-muted-foreground">Успешных</div>
          </div>
        </div>

        {/* Achievements */}
        <div className="space-y-2">
          <h5 className="font-medium text-sm">Достижения</h5>
          <div className="flex flex-wrap gap-2">
            {sellerHistoryCount >= 5 && (
              <Badge variant="outline" className="text-xs">
                <Award className="h-3 w-3 mr-1" />
                5+ продаж
              </Badge>
            )}
            {sellerRating >= 4.5 && (
              <Badge variant="outline" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Высокий рейтинг
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              С нами 2 года
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full">
            <MessageCircle className="h-4 w-4 mr-2" />
            Написать продавцу
          </Button>
          <Button variant="ghost" size="sm" className="w-full">
            <TrendingUp className="h-4 w-4 mr-2" />
            Другие лоты продавца
          </Button>
        </div>

        {/* Safety Notice */}
        <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-info mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <div className="font-medium text-foreground mb-1">Безопасность</div>
              <div>Все платежи проходят через эскроу-сервис. Деньги передаются продавцу только после получения автомобиля.</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};