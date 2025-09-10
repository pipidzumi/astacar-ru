import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, X, RotateCcw, ChevronDown } from "lucide-react";
import { useFilters } from "./FilterProvider";
import { QuickPresets } from "./QuickPresets";
import { FilterSections } from "./FilterSections";
import { useIsMobile } from "@/hooks/use-mobile";

export function HorizontalFilterBar() {
  const { state, updateFilters, resetFilters, applyFilters, toggleArrayItem } = useFilters();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();

  // Sticky behavior for desktop
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const makesList = ["BMW", "Mercedes-Benz", "Audi", "Toyota", "Volkswagen", "Porsche", "Lexus", "Volvo"];

  const getActiveFiltersCount = () => {
    let count = 0;
    if (state.makes.length > 0) count++;
    if (state.models.length > 0) count++;
    if (state.priceFrom || state.priceTo) count++;
    if (state.yearFrom || state.yearTo) count++;
    if (state.bodyTypes.length > 0) count++;
    if (state.transmissions.length > 0) count++;
    if (state.auctionStates.length > 1) count++;
    if (state.reserveOptions.length > 0) count++;
    if (state.endsWithin) count++;
    if (state.ownersCount.length > 0) count++;
    if (state.originalTitle || state.vinVerified || state.excludeCommercial) count++;
    if (state.withVideo || state.withInspection || state.withQA) count++;
    if (state.minPhotos > 0) count++;
    return count;
  };

  const activeCount = getActiveFiltersCount();

  const getActiveFilterChips = () => {
    const chips = [];
    
    state.makes.forEach(make => chips.push({ type: 'makes', value: make, label: make }));
    state.bodyTypes.forEach(type => chips.push({ type: 'bodyTypes', value: type, label: type }));
    state.transmissions.forEach(trans => chips.push({ type: 'transmissions', value: trans, label: trans }));
    state.auctionStates.forEach(status => chips.push({ 
      type: 'auctionStates', 
      value: status, 
      label: status === "live" ? "В эфире" : status === "scheduled" ? "Запланирован" : "Завершён" 
    }));
    state.reserveOptions.forEach(option => chips.push({ 
      type: 'reserveOptions', 
      value: option, 
      label: option === "no-reserve" ? "Без резерва" : 
             option === "reserve-met" ? "Резерв достигнут" : "Резерв не достигнут" 
    }));
    
    if (state.priceFrom || state.priceTo) {
      chips.push({ 
        type: 'price', 
        value: 'price', 
        label: `Цена: ${state.priceFrom || 0}₽ - ${state.priceTo || '∞'}₽` 
      });
    }
    
    if (state.yearFrom || state.yearTo) {
      chips.push({ 
        type: 'year', 
        value: 'year', 
        label: `Год: ${state.yearFrom || 1990} - ${state.yearTo || 2024}` 
      });
    }

    return chips;
  };

  const removeChip = (chip: any) => {
    if (chip.type === 'makes' || chip.type === 'bodyTypes' || chip.type === 'transmissions' || 
        chip.type === 'auctionStates' || chip.type === 'reserveOptions') {
      toggleArrayItem(chip.type, chip.value);
    } else if (chip.type === 'price') {
      updateFilters({ priceFrom: null, priceTo: null });
    } else if (chip.type === 'year') {
      updateFilters({ yearFrom: null, yearTo: null });
    }
  };

  const activeChips = getActiveFilterChips();

  if (isMobile) {
    return (
      <div className={`sticky top-0 z-30 border-b bg-white/95 backdrop-blur-sm transition-shadow duration-200 ${
        isScrolled ? 'shadow-md' : ''
      }`}>
        <div className="mx-auto max-w-7xl px-4 py-3">
          {/* Quick Presets */}
          <div className="mb-3">
            <QuickPresets />
          </div>

          {/* Primary filter row */}
          <div className="flex items-center gap-3 mb-3">
            {/* Make filter */}
            <Select 
              value={state.makes[0] || ""} 
              onValueChange={(value) => value ? toggleArrayItem("makes", value) : null}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Марка" />
              </SelectTrigger>
              <SelectContent>
                {makesList.map((make) => (
                  <SelectItem key={make} value={make}>{make}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price range */}
            <div className="flex items-center gap-1">
              <Input
                placeholder="Цена от"
                type="number"
                className="w-24 text-xs"
                value={state.priceFrom || ""}
                onChange={(e) => updateFilters({ priceFrom: e.target.value ? parseInt(e.target.value) : null })}
              />
              <span className="text-xs text-muted-foreground">-</span>
              <Input
                placeholder="до"
                type="number"
                className="w-20 text-xs"
                value={state.priceTo || ""}
                onChange={(e) => updateFilters({ priceTo: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>

            {/* All filters button */}
            <Sheet open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <SlidersHorizontal className="h-4 w-4 mr-1" />
                  Все фильтры
                  {activeCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                      {activeCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
                <SheetHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <SheetTitle>Фильтры</SheetTitle>
                    {activeCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Сбросить
                      </Button>
                    )}
                  </div>
                </SheetHeader>
                
                <div className="space-y-6">
                  <FilterSections />
                </div>

                {/* Sticky bottom actions */}
                <div className="sticky bottom-0 left-0 right-0 bg-background border-t p-4 flex gap-3">
                  <Button 
                    onClick={() => {
                      applyFilters();
                      setIsMobileDrawerOpen(false);
                    }}
                    className="flex-1"
                    disabled={state.isApplying}
                  >
                    {state.isApplying ? "Применяем..." : "Показать результаты"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="px-6"
                  >
                    Отмена
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeChips.map((chip, index) => (
                <Badge key={index} variant="secondary" className="pr-1">
                  {chip.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => removeChip(chip)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <div className={`sticky top-0 z-30 border-b bg-white/95 backdrop-blur-sm transition-shadow duration-200 ${
      isScrolled ? 'shadow-md' : ''
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        {/* Quick Presets */}
        <div className="mb-4">
          <QuickPresets />
        </div>

        {/* Main filters row */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {/* Make & Model */}
          <div className="flex items-center gap-2">
            <Select 
              value={state.makes[0] || ""} 
              onValueChange={(value) => value ? toggleArrayItem("makes", value) : null}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Марка" />
              </SelectTrigger>
              <SelectContent>
                {makesList.map((make) => (
                  <SelectItem key={make} value={make}>{make}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price range */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Цена от"
              type="number"
              className="w-28"
              value={state.priceFrom || ""}
              onChange={(e) => updateFilters({ priceFrom: e.target.value ? parseInt(e.target.value) : null })}
            />
            <span className="text-muted-foreground">-</span>
            <Input
              placeholder="до"
              type="number"
              className="w-28"
              value={state.priceTo || ""}
              onChange={(e) => updateFilters({ priceTo: e.target.value ? parseInt(e.target.value) : null })}
            />
          </div>

          {/* Year range */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Год от"
              type="number"
              min="1990"
              max="2024"
              className="w-24"
              value={state.yearFrom || ""}
              onChange={(e) => updateFilters({ yearFrom: e.target.value ? parseInt(e.target.value) : null })}
            />
            <span className="text-muted-foreground">-</span>
            <Input
              placeholder="до"
              type="number"
              min="1990"
              max="2024"
              className="w-24"
              value={state.yearTo || ""}
              onChange={(e) => updateFilters({ yearTo: e.target.value ? parseInt(e.target.value) : null })}
            />
          </div>

          {/* Quick filter chips */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={state.reserveOptions.includes("no-reserve") ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleArrayItem("reserveOptions", "no-reserve")}
            >
              Без резерва
            </Badge>
            <Badge
              variant={state.endsWithin === "24h" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => updateFilters({ endsWithin: state.endsWithin === "24h" ? null : "24h" })}
            >
              Скоро закончатся
            </Badge>
            <Badge
              variant={state.withInspection ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => updateFilters({ withInspection: !state.withInspection })}
            >
              С отчётом эксперта
            </Badge>
          </div>

          {/* More filters popover */}
          <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                Больше фильтров
                <ChevronDown className="h-4 w-4 ml-1" />
                {activeCount > 3 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                    +{activeCount - 3}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[800px] p-6" align="start">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Дополнительные фильтры</h3>
                {activeCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Сбросить все
                  </Button>
                )}
              </div>
              <FilterSections />
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsAdvancedOpen(false)}>
                  Отмена
                </Button>
                <Button 
                  onClick={() => {
                    applyFilters();
                    setIsAdvancedOpen(false);
                  }}
                  disabled={state.isApplying}
                >
                  {state.isApplying ? "Применяем..." : "Применить"}
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Reset button */}
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Сбросить
            </Button>
          )}
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeChips.map((chip, index) => (
              <Badge key={index} variant="secondary" className="pr-1">
                {chip.label}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                  onClick={() => removeChip(chip)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Results count and sort */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
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
      </div>
    </div>
  );
}