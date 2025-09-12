import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useFilters } from "./FilterProvider";
import { AuctionState, TimeFilter, ReserveOption } from "@/types/filters";

export function AuctionFacets() {
  const { state, updateFilters, toggleArrayItem, setRange } = useFilters();

  const auctionStates: AuctionState[] = ['live', 'scheduled', 'finished'];
  const timeFilters: TimeFilter[] = ['15m', '1h', '24h', '3d'];
  const reserveOptions: ReserveOption[] = ['no-reserve', 'reserve-met', 'reserve-not-met'];

  const auctionStateLabels = {
    'live': 'В эфире',
    'scheduled': 'Запланированы',
    'finished': 'Завершены'
  };

  const timeFilterLabels = {
    '15m': 'Через 15 мин',
    '1h': 'Через 1 час',
    '24h': 'Через 24 часа',
    '3d': 'Через 3 дня'
  };

  const reserveOptionLabels = {
    'no-reserve': 'Без резерва',
    'reserve-met': 'Резерв достигнут',
    'reserve-not-met': 'Резерв не достигнут'
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Параметры аукциона</h3>

        {/* Auction state */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Статус аукциона</Label>
          <div className="flex flex-wrap gap-2">
            {auctionStates.map((status) => (
              <Badge
                key={status}
                variant={state.auctionStates.includes(status) ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent"
                onClick={() => toggleArrayItem("auctionStates", status)}
                data-testid={`auction-state-${status}`}
              >
                {auctionStateLabels[status]}
              </Badge>
            ))}
          </div>
        </div>

        {/* Ends within */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Заканчивается через</Label>
          <div className="flex flex-wrap gap-2">
            {timeFilters.map((time) => (
              <Badge
                key={time}
                variant={state.endsWithin === time ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent"
                onClick={() => updateFilters({ 
                  endsWithin: state.endsWithin === time ? null : time 
                })}
                data-testid={`ends-within-${time}`}
              >
                {timeFilterLabels[time]}
              </Badge>
            ))}
          </div>
        </div>

        {/* Reserve options */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Резервная цена</Label>
          <div className="flex flex-wrap gap-2">
            {reserveOptions.map((option) => (
              <Badge
                key={option}
                variant={state.reserveOptions.includes(option) ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent"
                onClick={() => toggleArrayItem("reserveOptions", option)}
                data-testid={`reserve-option-${option}`}
              >
                {reserveOptionLabels[option]}
              </Badge>
            ))}
          </div>
        </div>

        {/* Current bid range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Текущая ставка, ₽</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="От"
              type="number"
              value={state.currentBidFrom || ""}
              onChange={(e) => setRange("currentBid", { 
                from: e.target.value ? parseInt(e.target.value) : null, 
                to: state.currentBidTo 
              })}
              data-testid="input-current-bid-from"
            />
            <Input
              placeholder="До"
              type="number"
              value={state.currentBidTo || ""}
              onChange={(e) => setRange("currentBid", { 
                from: state.currentBidFrom, 
                to: e.target.value ? parseInt(e.target.value) : null 
              })}
              data-testid="input-current-bid-to"
            />
          </div>
        </div>

        {/* Buy Now available */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Доступна опция "Купить сейчас"</Label>
          <Switch
            checked={state.buyNowAvailable}
            onCheckedChange={(checked) => updateFilters({ buyNowAvailable: checked })}
            data-testid="switch-buy-now-available"
          />
        </div>

        {/* With inspection */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">С отчётом эксперта</Label>
          <Switch
            checked={state.withInspection}
            onCheckedChange={(checked) => updateFilters({ withInspection: checked })}
            data-testid="switch-with-inspection"
          />
        </div>

        {/* With Q&A */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">С вопросами и ответами</Label>
          <Switch
            checked={state.withQA}
            onCheckedChange={(checked) => updateFilters({ withQA: checked })}
            data-testid="switch-with-qa"
          />
        </div>

        {/* KYC verified seller */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Верифицированный продавец</Label>
          <Switch
            checked={state.kycVerifiedSeller}
            onCheckedChange={(checked) => updateFilters({ kycVerifiedSeller: checked })}
            data-testid="switch-kyc-verified-seller"
          />
        </div>

        {/* Requires deposit */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Требуется залог</Label>
          <Switch
            checked={state.requiresDeposit}
            onCheckedChange={(checked) => updateFilters({ requiresDeposit: checked })}
            data-testid="switch-requires-deposit"
          />
        </div>
      </div>
    </div>
  );
}