import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, X, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { useFilters } from "./FilterProvider";
import { QuickPresets } from "./QuickPresets";
import { PrimaryFilters } from "./PrimaryFilters";
import { AdvancedFilters } from "./AdvancedFilters";
import { SavedSearches } from "./SavedSearches";
import { useIsMobile } from "@/hooks/use-mobile";
import { getAdvancedFiltersExpanded, setAdvancedFiltersExpanded } from "@/utils/advancedFiltersState";

export function HorizontalFilterBar() {
  const { state, updateFilters, resetFilters, applyFilters, toggleArrayItem } = useFilters();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(() => getAdvancedFiltersExpanded());
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const isMobile = useIsMobile();

  // Persist advanced filters state
  useEffect(() => {
    setAdvancedFiltersExpanded(isAdvancedOpen);
  }, [isAdvancedOpen]);

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

  // Get count of active advanced filters only
  const getActiveAdvancedFiltersCount = () => {
    let count = 0;
    if (state.bodyTypes.length > 0) count++;
    if (state.transmissions.length > 0) count++;
    if (state.driveTypes.length > 0) count++;
    if (state.fuelTypes.length > 0) count++;
    if (state.mileageFrom || state.mileageTo) count++;
    if (state.displacementFrom || state.displacementTo) count++;
    if (state.powerFrom || state.powerTo) count++;
    if (state.auctionStates.length > 1) count++; // More than just 'live'
    if (state.reserveOptions.length > 1) count++; // More than default
    if (state.endsWithin && state.endsWithin !== "24h") count++; // Excluding the quick filter
    if (state.currentBidFrom || state.currentBidTo) count++;
    if (state.ownersCount.length > 0) count++;
    if (state.originalTitle) count++;
    if (state.vinVerified) count++;
    if (state.excludeCommercial) count++;
    if (state.withVideo) count++;
    if (state.withQA) count++;
    if (state.minPhotos > 0) count++;
    return count;
  };

  const activeCount = getActiveFiltersCount();

  const getActiveFilterChips = () => {
    const chips = [];
    
    // Vehicle basics
    state.makes.forEach(make => chips.push({ type: 'makes', value: make, label: `Марка: ${make}` }));
    state.models.forEach(model => chips.push({ type: 'models', value: model, label: `Модель: ${model}` }));
    state.generations.forEach(gen => chips.push({ type: 'generations', value: gen, label: `Поколение: ${gen}` }));
    
    // Vehicle specifications
    state.bodyTypes.forEach(type => {
      const typeLabels = {
        sedan: 'Седан', hatchback: 'Хэтчбек', wagon: 'Универсал', coupe: 'Купе',
        cabrio: 'Кабриолет', liftback: 'Лифтбек', pickup: 'Пикап', minivan: 'Минивэн', suv: 'Внедорожник'
      };
      chips.push({ type: 'bodyTypes', value: type, label: `Кузов: ${typeLabels[type] || type}` });
    });
    
    state.transmissions.forEach(trans => {
      const transLabels = { mt: 'Механика', at: 'Автомат', cvt: 'Вариатор', amt: 'Робот', dct: 'Преселектив' };
      chips.push({ type: 'transmissions', value: trans, label: `КПП: ${transLabels[trans] || trans}` });
    });
    
    state.driveTypes.forEach(drive => {
      const driveLabels = { fwd: 'Передний', rwd: 'Задний', awd: 'Полный', '4wd': '4WD' };
      chips.push({ type: 'driveTypes', value: drive, label: `Привод: ${driveLabels[drive] || drive}` });
    });
    
    state.fuelTypes.forEach(fuel => {
      const fuelLabels = { gasoline: 'Бензин', diesel: 'Дизель', hybrid: 'Гибрид', electric: 'Электро', gas: 'ГБО' };
      chips.push({ type: 'fuelTypes', value: fuel, label: `Топливо: ${fuelLabels[fuel] || fuel}` });
    });
    
    if (state.steeringWheel) {
      chips.push({ 
        type: 'steeringWheel', 
        value: state.steeringWheel, 
        label: `Руль: ${state.steeringWheel === 'left' ? 'Левый' : 'Правый'}` 
      });
    }
    
    state.colors.forEach(color => chips.push({ type: 'colors', value: color, label: `Цвет: ${color}` }));
    
    // Condition and history
    state.ownersCount.forEach(count => chips.push({ 
      type: 'ownersCount', 
      value: count, 
      label: `Владельцев: ${count}` 
    }));
    
    state.accidentStatus.forEach(status => {
      const statusLabels = { 'no-accidents': 'Не битая', 'minor-accidents': 'Незначительные повреждения', 'major-accidents': 'Серьёзные повреждения' };
      chips.push({ type: 'accidentStatus', value: status, label: statusLabels[status] || status });
    });
    
    if (state.originalTitle) chips.push({ type: 'originalTitle', value: 'true', label: 'Оригинальный ПТС' });
    if (state.vinPresent) chips.push({ type: 'vinPresent', value: 'true', label: 'VIN указан' });
    if (state.vinVerified) chips.push({ type: 'vinVerified', value: 'true', label: 'VIN проверен' });
    if (state.serviceHistory) chips.push({ type: 'serviceHistory', value: 'true', label: 'История обслуживания' });
    if (state.excludeCommercial) chips.push({ type: 'excludeCommercial', value: 'true', label: 'Исключить коммерческие' });
    
    // Auction facets
    state.auctionStates.forEach(status => {
      if (status !== 'live') { // Don't show 'live' as it's default
        chips.push({ 
          type: 'auctionStates', 
          value: status, 
          label: status === "scheduled" ? "Запланированные" : "Завершённые" 
        });
      }
    });
    
    state.reserveOptions.forEach(option => {
      const optionLabels = {
        'no-reserve': 'Без резерва',
        'reserve-met': 'Резерв достигнут', 
        'reserve-not-met': 'Резерв не достигнут'
      };
      chips.push({ type: 'reserveOptions', value: option, label: optionLabels[option] || option });
    });
    
    if (state.endsWithin) {
      const timeLabels = { '15m': '15 минут', '1h': '1 час', '24h': '24 часа', '3d': '3 дня' };
      chips.push({ type: 'endsWithin', value: state.endsWithin, label: `Завершается через: ${timeLabels[state.endsWithin]}` });
    }
    
    if (state.endDateFrom || state.endDateTo) {
      const fromStr = state.endDateFrom ? new Date(state.endDateFrom).toLocaleDateString() : null;
      const toStr = state.endDateTo ? new Date(state.endDateTo).toLocaleDateString() : null;
      if (fromStr && toStr) {
        chips.push({ type: 'endDate', value: 'endDate', label: `Дата окончания: ${fromStr} - ${toStr}` });
      } else if (fromStr) {
        chips.push({ type: 'endDate', value: 'endDate', label: `Дата окончания: с ${fromStr}` });
      } else if (toStr) {
        chips.push({ type: 'endDate', value: 'endDate', label: `Дата окончания: до ${toStr}` });
      }
    }
    
    if (state.buyNowAvailable) chips.push({ type: 'buyNowAvailable', value: 'true', label: 'Купить сейчас' });
    if (state.withInspection) chips.push({ type: 'withInspection', value: 'true', label: 'С отчётом эксперта' });
    if (state.withQA) chips.push({ type: 'withQA', value: 'true', label: 'Вопросы-ответы' });
    
    // Trust and verification
    if (state.kycVerifiedSeller) chips.push({ type: 'kycVerifiedSeller', value: 'true', label: 'Проверенный продавец' });
    if (state.kycVerifiedBuyer) chips.push({ type: 'kycVerifiedBuyer', value: 'true', label: 'Проверенный покупатель' });
    if (state.requiresDeposit) chips.push({ type: 'requiresDeposit', value: 'true', label: 'Требуется депозит' });
    
    // Seller types
    state.sellerTypes.forEach(type => {
      const typeLabels = { private: 'Частные', corporate: 'Корпоративные', fleet: 'Автопарк', dealer: 'Дилеры' };
      chips.push({ type: 'sellerTypes', value: type, label: typeLabels[type] || type });
    });
    
    // Ad sources
    state.adSources.forEach(source => {
      const sourceLabels = { 'auto.ru': 'Авто.ру', 'avito': 'Авито', 'drom': 'Дром', 'astacar': 'Астакар' };
      chips.push({ type: 'adSources', value: source, label: `Источник: ${sourceLabels[source] || source}` });
    });
    
    // Location
    state.regions.forEach(region => chips.push({ type: 'regions', value: region, label: `Регион: ${region}` }));
    state.cities.forEach(city => chips.push({ type: 'cities', value: city, label: `Город: ${city}` }));
    if (state.selectedCityId) {
      chips.push({ type: 'selectedCityId', value: state.selectedCityId, label: `Выбранный город` });
    }
    if (state.radius && state.radius > 0) {
      chips.push({ type: 'radius', value: state.radius.toString(), label: `Радиус: ${state.radius} км` });
    }
    if (state.pickupRequired) chips.push({ type: 'pickupRequired', value: 'true', label: 'Требуется самовывоз' });
    if (state.deliveryAvailable) chips.push({ type: 'deliveryAvailable', value: 'true', label: 'Доставка доступна' });
    
    // Range filters with improved UX
    if (state.priceFrom || state.priceTo) {
      let label = 'Цена: ';
      if (state.priceFrom && state.priceTo) {
        label += `${state.priceFrom.toLocaleString()}₽ - ${state.priceTo.toLocaleString()}₽`;
      } else if (state.priceFrom) {
        label += `от ${state.priceFrom.toLocaleString()}₽`;
      } else {
        label += `до ${state.priceTo.toLocaleString()}₽`;
      }
      chips.push({ type: 'price', value: 'price', label });
    }
    
    if (state.yearFrom || state.yearTo) {
      let label = 'Год: ';
      if (state.yearFrom && state.yearTo) {
        label += `${state.yearFrom} - ${state.yearTo}`;
      } else if (state.yearFrom) {
        label += `от ${state.yearFrom}`;
      } else {
        label += `до ${state.yearTo}`;
      }
      chips.push({ type: 'year', value: 'year', label });
    }
    
    if (state.mileageFrom || state.mileageTo) {
      let label = 'Пробег: ';
      if (state.mileageFrom && state.mileageTo) {
        label += `${state.mileageFrom.toLocaleString()} - ${state.mileageTo.toLocaleString()} км`;
      } else if (state.mileageFrom) {
        label += `от ${state.mileageFrom.toLocaleString()} км`;
      } else {
        label += `до ${state.mileageTo.toLocaleString()} км`;
      }
      chips.push({ type: 'mileage', value: 'mileage', label });
    }
    
    if (state.displacementFrom || state.displacementTo) {
      let label = 'Объём: ';
      if (state.displacementFrom && state.displacementTo) {
        label += `${state.displacementFrom} - ${state.displacementTo} л`;
      } else if (state.displacementFrom) {
        label += `от ${state.displacementFrom} л`;
      } else {
        label += `до ${state.displacementTo} л`;
      }
      chips.push({ type: 'displacement', value: 'displacement', label });
    }
    
    if (state.powerFrom || state.powerTo) {
      let label = 'Мощность: ';
      if (state.powerFrom && state.powerTo) {
        label += `${state.powerFrom} - ${state.powerTo} л.с.`;
      } else if (state.powerFrom) {
        label += `от ${state.powerFrom} л.с.`;
      } else {
        label += `до ${state.powerTo} л.с.`;
      }
      chips.push({ type: 'power', value: 'power', label });
    }
    
    if (state.currentBidFrom || state.currentBidTo) {
      let label = 'Текущая ставка: ';
      if (state.currentBidFrom && state.currentBidTo) {
        label += `${state.currentBidFrom.toLocaleString()}₽ - ${state.currentBidTo.toLocaleString()}₽`;
      } else if (state.currentBidFrom) {
        label += `от ${state.currentBidFrom.toLocaleString()}₽`;
      } else {
        label += `до ${state.currentBidTo.toLocaleString()}₽`;
      }
      chips.push({ type: 'currentBid', value: 'currentBid', label });
    }
    
    // Media quality
    if (state.minPhotos && state.minPhotos > 0) {
      chips.push({ type: 'minPhotos', value: state.minPhotos.toString(), label: `Фото: мин. ${state.minPhotos}` });
    }
    
    if (state.withVideo) chips.push({ type: 'withVideo', value: 'true', label: 'С видео' });
    
    if (state.mediaQualityScore && state.mediaQualityScore > 0) {
      chips.push({ type: 'mediaQualityScore', value: state.mediaQualityScore.toString(), label: `Качество медиа: ${state.mediaQualityScore}` });
    }

    return chips;
  };

  const removeChip = (chip: any) => {
    // Array-based filters
    if (['makes', 'models', 'generations', 'bodyTypes', 'transmissions', 'driveTypes', 'fuelTypes', 
         'colors', 'ownersCount', 'accidentStatus', 'auctionStates', 'reserveOptions', 'sellerTypes',
         'adSources', 'regions', 'cities'].includes(chip.type)) {
      toggleArrayItem(chip.type, chip.value);
    }
    // Boolean filters
    else if (chip.type === 'originalTitle') updateFilters({ originalTitle: false });
    else if (chip.type === 'vinPresent') updateFilters({ vinPresent: false });
    else if (chip.type === 'vinVerified') updateFilters({ vinVerified: false });
    else if (chip.type === 'serviceHistory') updateFilters({ serviceHistory: false });
    else if (chip.type === 'excludeCommercial') updateFilters({ excludeCommercial: false });
    else if (chip.type === 'buyNowAvailable') updateFilters({ buyNowAvailable: false });
    else if (chip.type === 'withInspection') updateFilters({ withInspection: false });
    else if (chip.type === 'withQA') updateFilters({ withQA: false });
    else if (chip.type === 'withVideo') updateFilters({ withVideo: false });
    else if (chip.type === 'kycVerifiedSeller') updateFilters({ kycVerifiedSeller: false });
    else if (chip.type === 'kycVerifiedBuyer') updateFilters({ kycVerifiedBuyer: false });
    else if (chip.type === 'requiresDeposit') updateFilters({ requiresDeposit: false });
    else if (chip.type === 'pickupRequired') updateFilters({ pickupRequired: false });
    else if (chip.type === 'deliveryAvailable') updateFilters({ deliveryAvailable: false });
    // Single value filters
    else if (chip.type === 'steeringWheel') updateFilters({ steeringWheel: null });
    else if (chip.type === 'endsWithin') updateFilters({ endsWithin: null });
    else if (chip.type === 'selectedCityId') updateFilters({ selectedCityId: null });
    // Range filters
    else if (chip.type === 'price') updateFilters({ priceFrom: null, priceTo: null });
    else if (chip.type === 'year') updateFilters({ yearFrom: null, yearTo: null });
    else if (chip.type === 'mileage') updateFilters({ mileageFrom: null, mileageTo: null });
    else if (chip.type === 'displacement') updateFilters({ displacementFrom: null, displacementTo: null });
    else if (chip.type === 'power') updateFilters({ powerFrom: null, powerTo: null });
    else if (chip.type === 'currentBid') updateFilters({ currentBidFrom: null, currentBidTo: null });
    else if (chip.type === 'endDate') updateFilters({ endDateFrom: null, endDateTo: null });
    // Special filters
    else if (chip.type === 'radius') updateFilters({ radius: 0 });
    else if (chip.type === 'minPhotos') updateFilters({ minPhotos: 0 });
    else if (chip.type === 'mediaQualityScore') updateFilters({ mediaQualityScore: 0 });
  };

  const activeChips = getActiveFilterChips();

  if (isMobile) {
    return (
      <div className="border-b bg-white">
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
                  <AdvancedFilters />
                </div>

                {/* Bottom actions */}
                <div className="bg-background border-t p-4 flex gap-3">
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
    <div className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        {/* Quick Presets */}
        <div className="mb-4">
          <QuickPresets />
        </div>

        {/* Primary filters row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <PrimaryFilters />

          {/* More filters toggle button */}
          <Button 
            variant="outline" 
            className="relative"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            aria-controls="advanced-filters-section"
            aria-expanded={isAdvancedOpen}
            data-testid="button-toggle-advanced-filters"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {isAdvancedOpen ? "Меньше фильтров" : "Больше фильтров"}
            {isAdvancedOpen ? 
              <ChevronUp className="h-4 w-4 ml-2" /> : 
              <ChevronDown className="h-4 w-4 ml-2" />
            }
            {!isAdvancedOpen && getActiveAdvancedFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-2 text-xs">
                {getActiveAdvancedFiltersCount()}
              </Badge>
            )}
          </Button>

          {/* Saved Searches */}
          <SavedSearches />
        </div>

        {/* Expandable advanced filters section */}
        <div 
          id="advanced-filters-section"
          className={`overflow-hidden transition-all duration-250 ease-in-out ${
            isAdvancedOpen 
              ? 'max-h-[2000px] opacity-100' 
              : 'max-h-0 opacity-0'
          }`}
          role="region"
          aria-label="Advanced filters"
        >
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Дополнительные фильтры</h3>
              {activeCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-muted-foreground hover:text-foreground"
                  data-testid="button-reset-all-filters"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Сбросить все
                </Button>
              )}
            </div>
            <AdvancedFilters />
          </div>
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
              Активные фильтры:
            </div>
            {activeChips.map((chip, index) => (
              <Badge key={index} variant="secondary" className="pr-1" data-testid={`chip-active-filter-${index}`}>
                {chip.label}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                  onClick={() => removeChip(chip)}
                  data-testid={`button-remove-chip-${index}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            {activeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-muted-foreground hover:text-foreground ml-4"
                data-testid="button-reset-filters-from-chips"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Сбросить все
              </Button>
            )}
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