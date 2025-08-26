import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DollarSign, TrendingUp, Shield, Zap, HelpCircle } from "lucide-react";

interface PricingSectionProps {
  submission: any;
  onPricingChange: (pricing: any) => void;
}

export function PricingSection({ submission, onPricingChange }: PricingSectionProps) {
  const [hasReserve, setHasReserve] = useState(submission.has_reserve || false);
  const [showReserveInfo, setShowReserveInfo] = useState(false);
  const [pricing, setPricing] = useState({
    start_price: submission.start_price || '',
    reserve_price: submission.reserve_price || '',
    buy_now_price: submission.buy_now_price || '',
    market_estimate: submission.market_estimate || 1500000 // 1.5M RUB example
  });

  const formatRUB = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handlePricingChange = (field: string, value: string) => {
    const numValue = value ? parseInt(value.replace(/\D/g, '')) : 0;
    const newPricing = { ...pricing, [field]: numValue };
    setPricing(newPricing);
    onPricingChange({ ...newPricing, has_reserve: hasReserve });
  };

  const getRecommendedStartPrice = () => {
    return Math.floor(pricing.market_estimate * 0.5);
  };

  const getNoReserveImpact = () => {
    return Math.floor(pricing.market_estimate * 0.15); // 15% premium estimate
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Ценовая стратегия
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Установите конкурентные цены для максимизации стоимости продажи и привлечения серьезных покупателей.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Market Context */}
        <div className="bg-surface rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Рыночный контекст</h3>
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              Оценочная стоимость
            </Badge>
          </div>
          <div className="text-2xl font-bold text-primary mb-2">
            {formatRUB(pricing.market_estimate)}
          </div>
          <p className="text-sm text-muted-foreground">
            На основе похожих объявлений {submission.make} {submission.model} {submission.year}
          </p>
        </div>

        {/* Start Price */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="start_price">Стартовая цена ставки *</Label>
            <Badge variant="secondary">
              Рекомендуемая: {formatRUB(getRecommendedStartPrice())}
            </Badge>
          </div>
          <Input
            id="start_price"
            type="text"
            value={pricing.start_price ? formatRUB(pricing.start_price) : ''}
            onChange={(e) => handlePricingChange('start_price', e.target.value)}
            placeholder={formatRUB(getRecommendedStartPrice())}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Низкие стартовые цены привлекают больше участников торгов и могут повысить финальную цену продажи
          </p>
        </div>

        {/* Reserve Price Toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="has_reserve"
                checked={hasReserve}
                onCheckedChange={(checked) => {
                  setHasReserve(!!checked);
                  onPricingChange({ ...pricing, has_reserve: !!checked });
                }}
              />
              <Label htmlFor="has_reserve" className="font-medium">Установить резервную цену</Label>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReserveInfo(!showReserveInfo)}
              className="gap-1"
            >
              <HelpCircle className="h-4 w-4" />
              Подробнее
            </Button>
          </div>

          {showReserveInfo && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>С резервом vs Без резерва:</strong>
                <div className="mt-2 space-y-1 text-sm">
                  <p><strong>С резервом:</strong> Автомобиль не будет продан ниже минимальной цены. Меньшая активность участников.</p>
                  <p><strong>Без резерва:</strong> Автомобиль будет продан тому, кто предложит самую высокую цену. Больше активности и потенциальная премия.</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {hasReserve && (
            <div>
              <Label htmlFor="reserve_price">Резервная цена *</Label>
              <Input
                id="reserve_price"
                type="text"
                value={pricing.reserve_price ? formatRUB(pricing.reserve_price) : ''}
                onChange={(e) => handlePricingChange('reserve_price', e.target.value)}
                placeholder={formatRUB(pricing.market_estimate * 0.8)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Минимальная цена, которую вы готовы принять. Не видна участникам торгов до достижения.
              </p>
            </div>
          )}

          {!hasReserve && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-success" />
                <span className="font-medium text-success">Премия за отсутствие резерва</span>
              </div>
              <p className="text-sm text-success">
                Аукционы без резерва обычно продаются на {formatRUB(getNoReserveImpact())} дороже
                благодаря повышенному доверию и активности участников.
              </p>
            </div>
          )}
        </div>

        {/* Buy Now Price */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="buy_now_price">Цена "Купить сейчас" (Опционально)</Label>
            <Badge variant="outline">Премиум функция</Badge>
          </div>
          <Input
            id="buy_now_price"
            type="text"
            value={pricing.buy_now_price ? formatRUB(pricing.buy_now_price) : ''}
            onChange={(e) => handlePricingChange('buy_now_price', e.target.value)}
            placeholder={formatRUB(pricing.market_estimate * 1.1)}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Позволяет покупателям приобрести немедленно по этой цене (доступно только до первой ставки)
          </p>
        </div>

        {/* Pricing Validation */}
        {(pricing.start_price && pricing.reserve_price && hasReserve) && 
         (pricing.reserve_price < pricing.start_price) && (
          <Alert>
            <AlertDescription>
              Резервная цена должна быть равна или выше стартовой цены.
            </AlertDescription>
          </Alert>
        )}

        {(pricing.buy_now_price && pricing.reserve_price && hasReserve) && 
         (pricing.buy_now_price < pricing.reserve_price) && (
          <Alert>
            <AlertDescription>
              Цена "Купить сейчас" должна быть выше резервной цены.
            </AlertDescription>
          </Alert>
        )}

        {/* Strategy Recommendations */}
        <div className="bg-info/10 border border-info/20 rounded-lg p-4">
          <h3 className="font-medium text-info mb-2">Советы по ценовой стратегии</h3>
          <ul className="text-sm text-info space-y-1">
            <li>• Начинайте с низкой цены для создания ажиотажа и торговой активности</li>
            <li>• Объявления без резерва получают в 3 раза больше наблюдателей в среднем</li>
            <li>• Завершение в четверг-воскресенье обычно дает более высокие цены</li>
            <li>• Качественные фото могут увеличить финальную цену продажи на 10-15%</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}