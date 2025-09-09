import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { FilterDrawer } from "./filters/FilterDrawer";
import { FilterSidebar } from "./filters/FilterSidebar";
import { QuickPresets } from "./filters/QuickPresets";
import { ActiveFilters } from "./filters/ActiveFilters";
import { FilterProvider, useFilters } from "./filters/FilterProvider";

function FilterBarContent() {
  const { state, updateFilters } = useFilters();
  const isMobile = useIsMobile();

  return (
    <div className="bg-surface-elevated border-b p-4">
      <div className="container">
        {/* Quick Presets */}
        <div className="mb-4">
          <QuickPresets />
        </div>

        {/* Active Filters */}
        <div className="mb-4">
          <ActiveFilters />
        </div>

        {/* Mobile: Show filter drawer button and sort */}
        {isMobile ? (
          <div className="flex items-center justify-between gap-4">
            <FilterDrawer />
            
            <Select value={state.sort} onValueChange={(value) => updateFilters({ sort: value })}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">По релевантности</SelectItem>
                <SelectItem value="ending-soon">Скоро закончатся</SelectItem>
                <SelectItem value="newly-listed">Новые объявления</SelectItem>
                <SelectItem value="price-low">Цена: по возрастанию</SelectItem>
                <SelectItem value="price-high">Цена: по убыванию</SelectItem>
                <SelectItem value="most-bids">Больше ставок</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          /* Desktop: Show results count and sort */
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Найдено <span className="font-medium text-foreground">127</span> автомобилей
            </p>
            
            <Select value={state.sort} onValueChange={(value) => updateFilters({ sort: value })}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">По релевантности</SelectItem>
                <SelectItem value="ending-soon">Скоро закончатся</SelectItem>
                <SelectItem value="newly-listed">Новые объявления</SelectItem>
                <SelectItem value="price-low">Цена: по возрастанию</SelectItem>
                <SelectItem value="price-high">Цена: по убыванию</SelectItem>
                <SelectItem value="most-bids">Больше ставок</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}

export const FilterBar = () => {
  return (
    <FilterProvider>
      <FilterBarContent />
    </FilterProvider>
  );
};