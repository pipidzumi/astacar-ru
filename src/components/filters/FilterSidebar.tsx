import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useFilters } from "./FilterProvider";
import { FilterSections } from "./FilterSections";

export function FilterSidebar() {
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Фильтры</CardTitle>
          {activeCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="h-6 px-2 text-xs">
                {activeCount}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-muted-foreground hover:text-foreground h-6 px-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <FilterSections />
        
        <div className="pt-4 border-t">
          <Button 
            onClick={applyFilters} 
            className="w-full"
            disabled={state.isApplying}
          >
            {state.isApplying ? "Применяем..." : "Применить"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}