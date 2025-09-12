import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, X } from "lucide-react";
import { useFilters } from "./FilterProvider";
import { FilterSections } from "./FilterSections";

export function FilterDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { state, applyFilters, resetFilters } = useFilters();

  const getActiveFiltersCount = () => {
    let count = 0;
    if (state.makes.length > 0) count++;
    if (state.models.length > 0) count++;
    if (state.priceFrom || state.priceTo) count++;
    if (state.yearFrom || state.yearTo) count++;
    if (state.bodyTypes.length > 0) count++;
    if (state.transmissions.length > 0) count++;
    if (state.auctionStates.length > 1) count++; // More than default "live"
    return count;
  };

  const activeCount = getActiveFiltersCount();

  const handleApply = () => {
    applyFilters();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Фильтры
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="border-b pb-4 mb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Фильтры</SheetTitle>
            {activeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Сбросить
              </Button>
            )}
          </div>
        </SheetHeader>

        <FilterSections />

        {/* Bottom actions */}
        <div className="bg-background border-t p-4 mt-6 -mx-6">
          <div className="flex gap-3">
            <Button 
              onClick={handleApply} 
              className="flex-1"
              disabled={state.isApplying}
            >
              {state.isApplying ? "Применяем..." : "Показать результаты"}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Отмена
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}