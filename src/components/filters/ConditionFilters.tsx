import React from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useFilters } from "./FilterProvider";
import { AccidentStatus, SellerType } from "@/types/filters";

export function ConditionFilters() {
  const { state, updateFilters, toggleArrayItem } = useFilters();

  const ownersCounts = [1, 2, 3, 4, 5, 6];
  const accidentStatuses: AccidentStatus[] = ['no-accidents', 'minor-accidents', 'major-accidents'];
  const sellerTypes: SellerType[] = ['private', 'corporate', 'fleet', 'dealer'];

  const accidentStatusLabels = {
    'no-accidents': 'Без ДТП',
    'minor-accidents': 'Незначительные ДТП',
    'major-accidents': 'Серьёзные ДТП'
  };

  const sellerTypeLabels = {
    'private': 'Частное лицо',
    'corporate': 'Компания',
    'fleet': 'Автопарк',
    'dealer': 'Дилер'
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Состояние и история</h3>

        {/* Owners count */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Количество владельцев</Label>
          <div className="flex flex-wrap gap-2">
            {ownersCounts.map((count) => (
              <Badge
                key={count}
                variant={state.ownersCount.includes(count) ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent"
                onClick={() => toggleArrayItem("ownersCount", count)}
                data-testid={`owners-count-${count}`}
              >
                {count === 6 ? "6+" : count.toString()}
              </Badge>
            ))}
          </div>
        </div>

        {/* Accident status */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">История ДТП</Label>
          <div className="flex flex-wrap gap-2">
            {accidentStatuses.map((status) => (
              <Badge
                key={status}
                variant={state.accidentStatus.includes(status) ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent"
                onClick={() => toggleArrayItem("accidentStatus", status)}
                data-testid={`accident-status-${status}`}
              >
                {accidentStatusLabels[status]}
              </Badge>
            ))}
          </div>
        </div>

        {/* Original title */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Оригинальный ПТС</Label>
          <Switch
            checked={state.originalTitle}
            onCheckedChange={(checked) => updateFilters({ originalTitle: checked })}
            data-testid="switch-original-title"
          />
        </div>

        {/* VIN present */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">VIN номер указан</Label>
          <Switch
            checked={state.vinPresent}
            onCheckedChange={(checked) => updateFilters({ vinPresent: checked })}
            data-testid="switch-vin-present"
          />
        </div>

        {/* VIN verified */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">VIN номер проверен</Label>
          <Switch
            checked={state.vinVerified}
            onCheckedChange={(checked) => updateFilters({ vinVerified: checked })}
            data-testid="switch-vin-verified"
          />
        </div>

        {/* Service history */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Документированная история обслуживания</Label>
          <Switch
            checked={state.serviceHistory}
            onCheckedChange={(checked) => updateFilters({ serviceHistory: checked })}
            data-testid="switch-service-history"
          />
        </div>

        {/* Exclude commercial */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Исключить коммерческие авто</Label>
          <Switch
            checked={state.excludeCommercial}
            onCheckedChange={(checked) => updateFilters({ excludeCommercial: checked })}
            data-testid="switch-exclude-commercial"
          />
        </div>

        {/* Seller types */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Тип продавца</Label>
          <div className="flex flex-wrap gap-2">
            {sellerTypes.map((type) => (
              <Badge
                key={type}
                variant={state.sellerTypes.includes(type) ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent"
                onClick={() => toggleArrayItem("sellerTypes", type)}
                data-testid={`seller-type-${type}`}
              >
                {sellerTypeLabels[type]}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}