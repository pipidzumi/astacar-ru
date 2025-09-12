import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, X } from "lucide-react";
import { useFilters } from "./FilterProvider";

export function LocationFilters() {
  const { state, updateFilters, toggleArrayItem, setLocation } = useFilters();
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [availableCities, setAvailableCities] = useState<any[]>([]);

  // Mock regions and cities data
  const regions = [
    { id: "moscow", name: "Москва" },
    { id: "spb", name: "Санкт-Петербург" },
    { id: "moscow-region", name: "Московская область" },
    { id: "leningrad-region", name: "Ленинградская область" },
    { id: "krasnodar", name: "Краснодарский край" },
    { id: "tatarstan", name: "Республика Татарстан" },
  ];

  const citiesByRegion: Record<string, any[]> = {
    "moscow": [
      { id: "moscow-city", name: "Москва", latitude: 55.7558, longitude: 37.6176 }
    ],
    "spb": [
      { id: "spb-city", name: "Санкт-Петербург", latitude: 59.9311, longitude: 30.3609 }
    ],
    "moscow-region": [
      { id: "podolsk", name: "Подольск", latitude: 55.4297, longitude: 37.5441 },
      { id: "khimki", name: "Химки", latitude: 55.8970, longitude: 37.4297 },
      { id: "balashikha", name: "Балашиха", latitude: 55.7963, longitude: 37.9381 }
    ],
    "krasnodar": [
      { id: "krasnodar-city", name: "Краснодар", latitude: 45.0448, longitude: 38.9760 },
      { id: "sochi", name: "Сочи", latitude: 43.6028, longitude: 39.7342 }
    ]
  };

  // Update available cities when region changes
  useEffect(() => {
    if (selectedRegion) {
      setAvailableCities(citiesByRegion[selectedRegion] || []);
    } else {
      setAvailableCities([]);
    }
    setSelectedCity("");
  }, [selectedRegion]);

  const handleAddRegion = () => {
    if (selectedRegion && !state.regions.includes(selectedRegion)) {
      toggleArrayItem("regions", selectedRegion);
      setSelectedRegion("");
    }
  };

  const handleAddCity = () => {
    if (selectedCity && !state.cities.includes(selectedCity)) {
      toggleArrayItem("cities", selectedCity);
      setSelectedCity("");
    }
  };

  const handleCitySelection = (cityId: string) => {
    setLocation(cityId, state.radius);
  };

  const radiusOptions = [25, 50, 100, 200, 500, 1000];

  const formatRadius = (radius: number) => {
    return radius >= 1000 ? `${radius / 1000}000 км` : `${radius} км`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Местоположение и доставка</h3>

        {/* Region selector */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Регион</Label>
          <div className="flex gap-2">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="flex-1" data-testid="select-region">
                <SelectValue placeholder="Выберите регион" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id} data-testid={`region-option-${region.id}`}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAddRegion} 
              disabled={!selectedRegion || state.regions.includes(selectedRegion)}
              size="icon"
              variant="outline"
              data-testid="button-add-region"
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Selected regions */}
          {state.regions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {state.regions.map((regionId) => {
                const region = regions.find(r => r.id === regionId);
                return (
                  <Badge key={regionId} variant="default" className="pr-1" data-testid={`chip-region-${regionId}`}>
                    {region?.name || regionId}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1 hover:bg-transparent"
                      onClick={() => toggleArrayItem("regions", regionId)}
                      data-testid={`remove-region-${regionId}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {/* City selector */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Город</Label>
          <div className="flex gap-2">
            <Select 
              value={selectedCity} 
              onValueChange={setSelectedCity}
              disabled={!selectedRegion}
            >
              <SelectTrigger className="flex-1" data-testid="select-city">
                <SelectValue placeholder="Выберите город" />
              </SelectTrigger>
              <SelectContent>
                {availableCities.map((city) => (
                  <SelectItem key={city.id} value={city.id} data-testid={`city-option-${city.id}`}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAddCity} 
              disabled={!selectedCity || state.cities.includes(selectedCity)}
              size="icon"
              variant="outline"
              data-testid="button-add-city"
            >
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Selected cities */}
          {state.cities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {state.cities.map((cityId) => {
                const city = availableCities.find(c => c.id === cityId) || 
                  Object.values(citiesByRegion).flat().find((c: any) => c.id === cityId);
                return (
                  <Badge key={cityId} variant="default" className="pr-1" data-testid={`chip-city-${cityId}`}>
                    {city?.name || cityId}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1 hover:bg-transparent"
                      onClick={() => toggleArrayItem("cities", cityId)}
                      data-testid={`remove-city-${cityId}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected city for radius */}
        {state.selectedCityId && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Выбранный город для поиска в радиусе</Label>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" data-testid="chip-selected-city">
                {Object.values(citiesByRegion).flat().find((c: any) => c.id === state.selectedCityId)?.name || state.selectedCityId}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation(null)}
                data-testid="remove-selected-city"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Radius selector */}
        {(state.selectedCityId || state.cities.length > 0) && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Радиус поиска: {formatRadius(state.radius)}</Label>
            <div className="px-2">
              <Slider
                value={[state.radius]}
                onValueChange={([value]) => updateFilters({ radius: value })}
                min={25}
                max={1000}
                step={25}
                className="w-full"
                data-testid="slider-radius"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>25 км</span>
                <span>500 км</span>
                <span>1000 км</span>
              </div>
            </div>
            
            {/* Quick radius buttons */}
            <div className="flex flex-wrap gap-2">
              {radiusOptions.map((radius) => (
                <Badge
                  key={radius}
                  variant={state.radius === radius ? "default" : "outline"}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => updateFilters({ radius })}
                  data-testid={`radius-${radius}`}
                >
                  {formatRadius(radius)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Delivery options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Требуется самовывоз</Label>
            <Switch
              checked={state.pickupRequired}
              onCheckedChange={(checked) => updateFilters({ pickupRequired: checked })}
              data-testid="switch-pickup-required"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Доставка возможна</Label>
            <Switch
              checked={state.deliveryAvailable}
              onCheckedChange={(checked) => updateFilters({ deliveryAvailable: checked })}
              data-testid="switch-delivery-available"
            />
          </div>
        </div>
      </div>
    </div>
  );
}