import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useFilters } from "./FilterProvider";

export function ActiveFilters() {
  const { state, updateFilters, toggleArrayItem, resetFilters } = useFilters();

  const getActiveFilters = () => {
    const active: Array<{ key: string; label: string; onRemove: () => void }> = [];

    // Makes
    state.makes.forEach(make => {
      active.push({
        key: `make-${make}`,
        label: make,
        onRemove: () => toggleArrayItem("makes", make)
      });
    });

    // Models
    state.models.forEach(model => {
      active.push({
        key: `model-${model}`,
        label: model,
        onRemove: () => toggleArrayItem("models", model)
      });
    });

    // Price range
    if (state.priceFrom || state.priceTo) {
      const from = state.priceFrom ? `от ${state.priceFrom.toLocaleString()} ₽` : "";
      const to = state.priceTo ? `до ${state.priceTo.toLocaleString()} ₽` : "";
      active.push({
        key: "price",
        label: `Цена ${from} ${to}`.trim(),
        onRemove: () => updateFilters({ priceFrom: null, priceTo: null })
      });
    }

    // Year range
    if (state.yearFrom || state.yearTo) {
      const from = state.yearFrom ? `от ${state.yearFrom}` : "";
      const to = state.yearTo ? `до ${state.yearTo}` : "";
      active.push({
        key: "year",
        label: `Год ${from} ${to}`.trim(),
        onRemove: () => updateFilters({ yearFrom: null, yearTo: null })
      });
    }

    // Body types
    state.bodyTypes.forEach(type => {
      active.push({
        key: `body-${type}`,
        label: type,
        onRemove: () => toggleArrayItem("bodyTypes", type)
      });
    });

    // Transmissions
    state.transmissions.forEach(trans => {
      active.push({
        key: `trans-${trans}`,
        label: trans,
        onRemove: () => toggleArrayItem("transmissions", trans)
      });
    });

    // Auction states (only if not default)
    if (state.auctionStates.length !== 1 || !state.auctionStates.includes("live")) {
      state.auctionStates.forEach(status => {
        const label = status === "live" ? "В эфире" : 
                     status === "scheduled" ? "Запланирован" : "Завершён";
        active.push({
          key: `auction-${status}`,
          label,
          onRemove: () => toggleArrayItem("auctionStates", status)
        });
      });
    }

    // Reserve options
    state.reserveOptions.forEach(option => {
      const label = option === "no-reserve" ? "Без резерва" : 
                   option === "reserve-met" ? "Резерв достигнут" : "Резерв не достигнут";
      active.push({
        key: `reserve-${option}`,
        label,
        onRemove: () => toggleArrayItem("reserveOptions", option)
      });
    });

    // Ends within
    if (state.endsWithin) {
      const labels = {
        "15m": "15 минут",
        "1h": "1 час", 
        "24h": "24 часа",
        "3d": "3 дня"
      };
      active.push({
        key: "ends-within",
        label: `Заканчивается: ${labels[state.endsWithin as keyof typeof labels]}`,
        onRemove: () => updateFilters({ endsWithin: null })
      });
    }

    // Boolean filters
    if (state.withVideo) {
      active.push({
        key: "with-video",
        label: "С видео",
        onRemove: () => updateFilters({ withVideo: false })
      });
    }

    if (state.withInspection) {
      active.push({
        key: "with-inspection",
        label: "С отчётом эксперта",
        onRemove: () => updateFilters({ withInspection: false })
      });
    }

    if (state.originalTitle) {
      active.push({
        key: "original-title",
        label: "Оригинальный ПТС",
        onRemove: () => updateFilters({ originalTitle: false })
      });
    }

    return active;
  };

  const activeFilters = getActiveFilters();

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">Активные фильтры:</span>
      
      {activeFilters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="gap-1 pr-1"
        >
          {filter.label}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={filter.onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {activeFilters.length > 2 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          Сбросить все
        </Button>
      )}
    </div>
  );
}