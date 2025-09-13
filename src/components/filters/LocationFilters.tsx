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

  // Comprehensive Russian regions and cities data
  const regions = [
    { id: "moscow", name: "Москва" },
    { id: "spb", name: "Санкт-Петербург" },
    { id: "moscow-region", name: "Московская область" },
    { id: "leningrad-region", name: "Ленинградская область" },
    { id: "krasnodar", name: "Краснодарский край" },
    { id: "tatarstan", name: "Республика Татарстан" },
    { id: "sverdlovsk", name: "Свердловская область" },
    { id: "novosibirsk", name: "Новосибирская область" },
    { id: "rostov", name: "Ростовская область" },
    { id: "samara", name: "Самарская область" },
    { id: "chelyabinsk", name: "Челябинская область" },
    { id: "bashkortostan", name: "Республика Башкортостан" },
    { id: "voronezh", name: "Воронежская область" },
    { id: "volgograd", name: "Волгоградская область" },
    { id: "nizhny-novgorod", name: "Нижегородская область" },
  ];

  const citiesByRegion: Record<string, any[]> = {
    "moscow": [
      { id: "moscow-city", name: "Москва", latitude: 55.7558, longitude: 37.6176, population: 12506468 }
    ],
    "spb": [
      { id: "spb-city", name: "Санкт-Петербург", latitude: 59.9311, longitude: 30.3609, population: 5398064 }
    ],
    "moscow-region": [
      { id: "podolsk", name: "Подольск", latitude: 55.4297, longitude: 37.5441, population: 193751 },
      { id: "khimki", name: "Химки", latitude: 55.8970, longitude: 37.4297, population: 259550 },
      { id: "balashikha", name: "Балашиха", latitude: 55.7963, longitude: 37.9381, population: 507366 },
      { id: "mytishchi", name: "Мытищи", latitude: 55.9116, longitude: 37.7307, population: 222624 },
      { id: "korolev", name: "Королёв", latitude: 55.9233, longitude: 37.8555, population: 225796 }
    ],
    "leningrad-region": [
      { id: "gatchina", name: "Гатчина", latitude: 59.5763, longitude: 30.1280, population: 92937 },
      { id: "vyborg", name: "Выборг", latitude: 60.7118, longitude: 28.7336, population: 76315 },
      { id: "tosno", name: "Тосно", latitude: 59.5406, longitude: 30.8773, population: 35484 }
    ],
    "krasnodar": [
      { id: "krasnodar-city", name: "Краснодар", latitude: 45.0448, longitude: 38.9760, population: 932629 },
      { id: "sochi", name: "Сочи", latitude: 43.6028, longitude: 39.7342, population: 443562 },
      { id: "novorossiysk", name: "Новороссийск", latitude: 44.7230, longitude: 37.7681, population: 275366 },
      { id: "armavir", name: "Армавир", latitude: 44.9892, longitude: 41.1234, population: 188832 }
    ],
    "tatarstan": [
      { id: "kazan", name: "Казань", latitude: 55.8304, longitude: 49.0661, population: 1259173 },
      { id: "naberezhnye-chelny", name: "Набережные Челны", latitude: 55.7433, longitude: 52.4297, population: 533839 },
      { id: "nizhnekamsk", name: "Нижнекамск", latitude: 55.6363, longitude: 51.8208, population: 238485 }
    ],
    "sverdlovsk": [
      { id: "ekaterinburg", name: "Екатеринбург", latitude: 56.8431, longitude: 60.6454, population: 1493749 },
      { id: "nizhny-tagil", name: "Нижний Тагил", latitude: 57.9197, longitude: 59.9679, population: 346853 },
      { id: "kamensk-uralsky", name: "Каменск-Уральский", latitude: 56.4186, longitude: 61.9329, population: 168897 }
    ],
    "novosibirsk": [
      { id: "novosibirsk-city", name: "Новосибирск", latitude: 55.0084, longitude: 82.9357, population: 1633595 },
      { id: "berdsk", name: "Бердск", latitude: 54.7649, longitude: 83.0953, population: 102652 }
    ],
    "rostov": [
      { id: "rostov-na-donu", name: "Ростов-на-Дону", latitude: 47.2357, longitude: 39.7015, population: 1137904 },
      { id: "taganrog", name: "Таганрог", latitude: 47.2118, longitude: 38.8976, population: 245120 },
      { id: "shakhty", name: "Шахты", latitude: 47.7094, longitude: 40.2144, population: 235607 }
    ],
    "samara": [
      { id: "samara-city", name: "Самара", latitude: 53.2001, longitude: 50.1500, population: 1156644 },
      { id: "tolyatti", name: "Тольятти", latitude: 53.5303, longitude: 49.3461, population: 684709 },
      { id: "syzran", name: "Сызрань", latitude: 53.1647, longitude: 48.4686, population: 171174 }
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
    return `${radius.toLocaleString()} км`;
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get selected city data for enhanced UI
  const getSelectedCityData = () => {
    if (!state.selectedCityId) return null;
    return Object.values(citiesByRegion).flat().find((c: any) => c.id === state.selectedCityId);
  };

  const selectedCityData = getSelectedCityData();

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

        {/* City selection for radius search */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Поиск по городу с радиусом</Label>
          <div className="flex gap-2">
            <Select 
              value={state.selectedCityId || ""} 
              onValueChange={(cityId) => handleCitySelection(cityId)}
            >
              <SelectTrigger className="flex-1" data-testid="select-radius-city">
                <SelectValue placeholder="Выберите город для поиска в радиусе" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(citiesByRegion).map(([regionId, cities]) => (
                  <div key={regionId}>
                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground bg-muted/50">
                      {regions.find(r => r.id === regionId)?.name}
                    </div>
                    {cities.map((city: any) => (
                      <SelectItem key={city.id} value={city.id} data-testid={`radius-city-${city.id}`}>
                        <div className="flex items-center justify-between w-full">
                          <span>{city.name}</span>
                          {city.population && (
                            <span className="text-xs text-muted-foreground ml-2">
                              {(city.population / 1000000).toFixed(1)}M
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
            {state.selectedCityId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation(null)}
                data-testid="remove-selected-city"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Selected city info */}
          {selectedCityData && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{selectedCityData.name}</span>
                {selectedCityData.population && (
                  <Badge variant="outline" className="text-xs">
                    {(selectedCityData.population / 1000000).toFixed(1)}M жителей
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Координаты: {selectedCityData.latitude?.toFixed(4)}, {selectedCityData.longitude?.toFixed(4)}
              </div>
              <div className="text-sm text-blue-600 mt-1">
                Радиус поиска: {formatRadius(state.radius)}
              </div>
            </div>
          )}
        </div>

        {/* Popular cities quick selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Популярные города</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "moscow-city", name: "Москва", population: 12506468 },
              { id: "spb-city", name: "СПб", population: 5398064 },
              { id: "ekaterinburg", name: "Екатеринбург", population: 1493749 },
              { id: "novosibirsk-city", name: "Новосибирск", population: 1633595 },
              { id: "kazan", name: "Казань", population: 1259173 },
              { id: "rostov-na-donu", name: "Ростов-на-Дону", population: 1137904 },
              { id: "samara-city", name: "Самара", population: 1156644 },
              { id: "krasnodar-city", name: "Краснодар", population: 932629 }
            ].map((city) => (
              <Button
                key={city.id}
                variant={state.selectedCityId === city.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleCitySelection(city.id)}
                className="justify-start text-left"
                data-testid={`popular-city-${city.id}`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  <span className="text-sm">{city.name}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Radius selector */}
        {(state.selectedCityId || state.cities.length > 0) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Радиус поиска</Label>
              <Badge variant="outline" className="text-sm font-medium">
                {formatRadius(state.radius)}
              </Badge>
            </div>
            
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
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Быстрый выбор:</div>
              <div className="flex flex-wrap gap-2">
                {radiusOptions.map((radius) => (
                  <Badge
                    key={radius}
                    variant={state.radius === radius ? "default" : "outline"}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => updateFilters({ radius })}
                    data-testid={`radius-${radius}`}
                  >
                    {formatRadius(radius)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Distance calculation helper */}
            {selectedCityData && state.cities.length > 0 && (
              <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                  Расстояния от {selectedCityData.name}:
                </div>
                <div className="flex flex-wrap gap-1">
                  {state.cities.slice(0, 3).map((cityId) => {
                    const city = Object.values(citiesByRegion).flat().find((c: any) => c.id === cityId);
                    if (!city || !selectedCityData.latitude || !selectedCityData.longitude) return null;
                    const distance = calculateDistance(
                      selectedCityData.latitude,
                      selectedCityData.longitude,
                      city.latitude,
                      city.longitude
                    );
                    return (
                      <span key={cityId} className="text-xs text-blue-600 dark:text-blue-400">
                        {city.name}: {Math.round(distance)} км
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
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