import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Timer
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ListingData } from "@/lib/mockData";
import { supabase } from "@/integrations/supabase/client";

interface BiddingInterfaceProps {
  listing: ListingData;
  serverTime: Date;
  onBidUpdate: (bid: { id: string; amount: number; maskedBidderId: string; placedAt: string; isWinning: boolean }) => void;
}

export const BiddingInterface = ({ listing, serverTime, onBidUpdate }: BiddingInterfaceProps) => {
  const [bidAmount, setBidAmount] = useState("");
  const [maxAutobid, setMaxAutobid] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [isBidding, setIsBidding] = useState(false);
  const { toast } = useToast();

  const minNextBid = listing.pricing.currentPrice + listing.pricing.minBidStep;
  const hasDeposit = listing.bidding.myDepositStatus === "holding";
  
  const getTimeLeft = () => {
    const endTime = new Date(listing.schedule.endAt);
    const timeLeft = endTime.getTime() - serverTime.getTime();
    
    if (timeLeft <= 0) return null;
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, totalMinutes: Math.floor(timeLeft / (1000 * 60)) };
  };

  const timeLeft = getTimeLeft();
  const isEndingSoon = timeLeft && timeLeft.totalMinutes <= listing.policy.antiSnipingMinutes;

  const handleDeposit = async () => {
    setIsDepositing(true);
    try {
      // FIXED: Use secure backend endpoint
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Ошибка",
          description: "Требуется авторизация",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('secure-bidding', {
        body: { 
          listing_id: listing.id,
          action: 'create-deposit'
        }
      });

      if (error) throw error;

      toast({
        title: "Депозит внесён",
        description: `Сумма ₽${data.deposit.amount?.toLocaleString()} заблокирована на вашей карте`,
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось внести депозит. Попробуйте ещё раз.",
        variant: "destructive",
      });
    } finally {
      setIsDepositing(false);
    }
  };

  const handleBid = async () => {
    const amount = parseInt(bidAmount.replace(/\s/g, ""));
    
    // Client-side validation for UX
    if (amount < minNextBid) {
      toast({
        title: "Неверная сумма",
        description: `Минимальная ставка: ₽${minNextBid.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    if (amount % listing.pricing.minBidStep !== 0) {
      toast({
        title: "Неверная сумма",
        description: `Ставка должна быть кратна ₽${listing.pricing.minBidStep.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    setIsBidding(true);
    try {
      // FIXED: Use secure backend with server-side validation
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Ошибка",
          description: "Требуется авторизация",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('secure-bidding', {
        body: { 
          listing_id: listing.id,
          amount: amount,
          action: 'place-bid'
        }
      });

      if (error) throw error;
      
      const newBid = {
        id: `bid-${Date.now()}`,
        amount: data.amount,
        maskedBidderId: "Вы",
        placedAt: new Date().toISOString(),
        isWinning: true,
      };
      
      onBidUpdate(newBid);
      setBidAmount("");
      
      toast({
        title: "Ставка принята",
        description: data.anti_snipe_triggered 
          ? `Аукцион продлён на ${listing.policy.antiSnipingMinutes} минут` 
          : "Вы лидируете в торгах",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось сделать ставку. Попробуйте ещё раз.",
        variant: "destructive",
      });
    } finally {
      setIsBidding(false);
    }
  };

  const formatBidInput = (value: string) => {
    const number = parseInt(value.replace(/\D/g, ""));
    return isNaN(number) ? "" : number.toLocaleString();
  };

  if (listing.status === "finished") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Аукцион завершён
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div>
              <div className="text-2xl font-bold">₽{listing.pricing.currentPrice.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Финальная цена</div>
            </div>
            {listing.meta.winnerId && (
              <Badge className="bg-success text-white">
                Победитель: {listing.meta.winnerId === "current-user" ? "Вы" : "Участник №8"}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Сделать ставку
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Price */}
        <div className="text-center">
          <div className="text-3xl font-bold mb-1">
            ₽{listing.pricing.currentPrice.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            Текущая ставка
          </div>
        </div>

        {/* Timer */}
        {timeLeft && (
          <div className={`text-center p-3 rounded-lg border ${
            isEndingSoon ? 'bg-warning/10 border-warning/20' : 'bg-muted'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Timer className={`h-4 w-4 ${isEndingSoon ? 'text-warning' : ''}`} />
              <span className={`font-mono text-lg font-bold ${isEndingSoon ? 'text-warning' : ''}`}>
                {timeLeft.days > 0 && `${timeLeft.days}д `}
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {isEndingSoon && (
                <>
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                  Ставки в последние {listing.policy.antiSnipingMinutes} мин продлевают аукцион
                </>
              )}
            </div>
          </div>
        )}

        {/* Reserve Status */}
        {listing.pricing.reservePrice && !listing.meta.noReserve && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm">Резервная цена</span>
            <Badge variant={listing.pricing.currentPrice >= listing.pricing.reservePrice ? "default" : "outline"}>
              {listing.pricing.currentPrice >= listing.pricing.reservePrice ? "Достигнута" : "Не достигнута"}
            </Badge>
          </div>
        )}

        {/* Deposit Section */}
        {!hasDeposit && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-info/10 border border-info/20 rounded-lg">
              <Shield className="h-5 w-5 text-info mt-0.5" />
              <div className="text-sm">
                <div className="font-medium mb-1">Требуется депозит</div>
                <div className="text-muted-foreground">
                  ₽{listing.policy.depositPolicy.amount?.toLocaleString()} — полностью возвращается, если не выиграете
                </div>
              </div>
            </div>
            <Button 
              onClick={handleDeposit} 
              disabled={isDepositing}
              className="w-full"
            >
              <Shield className="h-4 w-4 mr-2" />
              {isDepositing ? "Обработка..." : "Внести депозит"}
            </Button>
          </div>
        )}

        {/* Bidding Section */}
        {hasDeposit && (
          <>
            <Separator />
            <div className="space-y-4">
              <div>
                <Label htmlFor="bid-amount" className="text-sm font-medium">
                  Ваша ставка (минимум ₽{minNextBid.toLocaleString()})
                </Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₽</span>
                  <Input
                    id="bid-amount"
                    type="text"
                    placeholder={minNextBid.toLocaleString()}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(formatBidInput(e.target.value))}
                    className="pl-8"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBidAmount(minNextBid.toLocaleString())}
                  >
                    +₽{listing.pricing.minBidStep.toLocaleString()}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBidAmount((minNextBid + listing.pricing.minBidStep * 2).toLocaleString())}
                  >
                    +₽{(listing.pricing.minBidStep * 3).toLocaleString()}
                  </Button>
                </div>
              </div>

              <Button 
                onClick={handleBid}
                disabled={!bidAmount || isBidding}
                className="w-full"
                size="lg"
              >
                {isBidding ? "Отправка..." : "Сделать ставку"}
              </Button>
            </div>

            {/* Autobid Section */}
            <Separator />
            <div className="space-y-3">
              <Label className="text-sm font-medium">Максимальная автоставка</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₽</span>
                <Input
                  type="text"
                  placeholder="Необязательно"
                  value={maxAutobid}
                  onChange={(e) => setMaxAutobid(formatBidInput(e.target.value))}
                  className="pl-8"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Система будет автоматически перебивать ставки до указанной суммы
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Установить автоставку
              </Button>
            </div>
          </>
        )}

        {/* Buy Now */}
        {listing.pricing.buyNowPrice && hasDeposit && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Купить сейчас</div>
                <div className="text-2xl font-bold text-success">
                  ₽{listing.pricing.buyNowPrice.toLocaleString()}
                </div>
              </div>
              <Button variant="secondary" size="lg" className="w-full">
                <DollarSign className="h-4 w-4 mr-2" />
                Купить сейчас
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};