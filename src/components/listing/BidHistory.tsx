import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, Crown, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { ListingData } from "@/lib/mockData";

interface BidHistoryProps {
  bids: ListingData["bidding"]["bidHistory"];
}

export const BidHistory = ({ bids }: BidHistoryProps) => {
  const [showAll, setShowAll] = useState(false);
  const displayBids = showAll ? bids : bids.slice(0, 5);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 1) return "только что";
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          История ставок ({bids.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayBids.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Ставок пока нет</p>
            <p className="text-sm">Будьте первым!</p>
          </div>
        ) : (
          <>
            {displayBids.map((bid, index) => (
              <div 
                key={bid.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  bid.isWinning ? 'bg-success/10 border-success/20' : 'bg-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {bid.isWinning && <Crown className="h-4 w-4 text-success" />}
                    <span className="font-medium">
                      {bid.maskedBidderId}
                    </span>
                  </div>
                  {bid.isWinning && (
                    <Badge className="bg-success text-white">Лидирует</Badge>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="font-bold">₽{bid.amount.toLocaleString()}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(bid.placedAt)}
                  </div>
                </div>
              </div>
            ))}
            
            {bids.length > 5 && (
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
                className="w-full"
              >
                {showAll ? (
                  <>Скрыть старые ставки</>
                ) : (
                  <>
                    Показать все ставки ({bids.length})
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            )}
          </>
        )}

        {/* Bid Statistics */}
        {bids.length > 0 && (
          <div className="pt-3 border-t">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold">
                  ₽{Math.max(...bids.map(b => b.amount)).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Максимальная</div>
              </div>
              <div>
                <div className="text-lg font-bold">
                  ₽{Math.min(...bids.map(b => b.amount)).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Стартовая</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};