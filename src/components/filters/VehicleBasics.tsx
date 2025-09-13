import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { useFilters } from "./FilterProvider";
import { useDebounce } from "@/hooks/useDebounce";

export function VehicleBasics() {
  const { state, updateFilters, toggleArrayItem, setRange, vehicleOptions, loadVehicleOptions } = useFilters();
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");

  // Debounced range setters to prevent excessive updates
  const { debouncedCallback: debouncedSetRange } = useDebounce(setRange, 500);

  // Load initial vehicle options
  useEffect(() => {
    loadVehicleOptions();
  }, [loadVehicleOptions]);

  // Load models when make changes
  useEffect(() => {
    if (selectedMake) {
      loadVehicleOptions(selectedMake);
    }
  }, [selectedMake, loadVehicleOptions]);

  // Load generations when model changes
  useEffect(() => {
    if (selectedMake && selectedModel) {
      loadVehicleOptions(selectedMake, selectedModel);
    }
  }, [selectedMake, selectedModel, loadVehicleOptions]);

  const handleAddMake = () => {
    if (selectedMake && !state.makes.includes(selectedMake)) {
      toggleArrayItem("makes", selectedMake);
      setSelectedMake("");
    }
  };

  const handleAddModel = () => {
    if (selectedModel && !state.models.includes(selectedModel)) {
      toggleArrayItem("models", selectedModel);
      setSelectedModel("");
    }
  };

  const availableModels = selectedMake ? vehicleOptions.modelsByMake[selectedMake] || [] : [];
  const availableGenerations = selectedMake && selectedModel 
    ? vehicleOptions.generationsByModel[`${selectedMake}|${selectedModel}`] || []
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Основные параметры</h3>
        
        {/* Make selector with chips */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Марка</Label>
          <div className="flex gap-2">
            <Select value={selectedMake} onValueChange={setSelectedMake}>
              <SelectTrigger className="flex-1" data-testid="select-make">
                <SelectValue placeholder="Выберите марку" />
              </SelectTrigger>
              <SelectContent>
                {vehicleOptions.makes.map((make) => (
                  <SelectItem key={make} value={make} data-testid={`make-option-${make}`}>
                    {make}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAddMake} 
              disabled={!selectedMake || state.makes.includes(selectedMake)}
              size="icon"
              variant="outline"
              data-testid="button-add-make"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Selected makes */}
          {state.makes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {state.makes.map((make) => (
                <Badge key={make} variant="default" className="pr-1" data-testid={`chip-make-${make}`}>
                  {make}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => toggleArrayItem("makes", make)}
                    data-testid={`remove-make-${make}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Model selector with chips */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Модель</Label>
          <div className="flex gap-2">
            <Select 
              value={selectedModel} 
              onValueChange={setSelectedModel}
              disabled={!selectedMake}
            >
              <SelectTrigger className="flex-1" data-testid="select-model">
                <SelectValue placeholder="Выберите модель" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model} value={model} data-testid={`model-option-${model}`}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAddModel} 
              disabled={!selectedModel || state.models.includes(selectedModel)}
              size="icon"
              variant="outline"
              data-testid="button-add-model"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Selected models */}
          {state.models.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {state.models.map((model) => (
                <Badge key={model} variant="default" className="pr-1" data-testid={`chip-model-${model}`}>
                  {model}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => toggleArrayItem("models", model)}
                    data-testid={`remove-model-${model}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Generation selector */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Поколение</Label>
          {availableGenerations.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableGenerations.map((generation) => (
                <Badge
                  key={generation}
                  variant={state.generations.includes(generation) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => toggleArrayItem("generations", generation)}
                  data-testid={`generation-${generation}`}
                >
                  {generation}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {selectedMake && selectedModel 
                ? "Загружаем поколения..." 
                : "Выберите марку и модель для отображения поколений"
              }
            </div>
          )}
          
          {/* Selected generations */}
          {state.generations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {state.generations.map((generation) => (
                <Badge key={generation} variant="secondary" className="pr-1" data-testid={`chip-generation-${generation}`}>
                  {generation}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => toggleArrayItem("generations", generation)}
                    data-testid={`remove-generation-${generation}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Year range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Год выпуска</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="От"
              type="number"
              min="1990"
              max="2025"
              value={state.yearFrom || ""}
              onChange={(e) => debouncedSetRange("year", { 
                from: e.target.value ? parseInt(e.target.value) : null, 
                to: state.yearTo 
              })}
              data-testid="input-year-from"
            />
            <Input
              placeholder="До"
              type="number"
              min="1990"
              max="2025"
              value={state.yearTo || ""}
              onChange={(e) => debouncedSetRange("year", { 
                from: state.yearFrom, 
                to: e.target.value ? parseInt(e.target.value) : null 
              })}
              data-testid="input-year-to"
            />
          </div>
        </div>

        {/* Price range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Цена, ₽</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="От"
              type="number"
              value={state.priceFrom || ""}
              onChange={(e) => debouncedSetRange("price", { 
                from: e.target.value ? parseInt(e.target.value) : null, 
                to: state.priceTo 
              })}
              data-testid="input-price-from"
            />
            <Input
              placeholder="До"
              type="number"
              value={state.priceTo || ""}
              onChange={(e) => debouncedSetRange("price", { 
                from: state.priceFrom, 
                to: e.target.value ? parseInt(e.target.value) : null 
              })}
              data-testid="input-price-to"
            />
          </div>
        </div>

        {/* Mileage range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Пробег, км</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="От"
              type="number"
              value={state.mileageFrom || ""}
              onChange={(e) => debouncedSetRange("mileage", { 
                from: e.target.value ? parseInt(e.target.value) : null, 
                to: state.mileageTo 
              })}
              data-testid="input-mileage-from"
            />
            <Input
              placeholder="До"
              type="number"
              value={state.mileageTo || ""}
              onChange={(e) => debouncedSetRange("mileage", { 
                from: state.mileageFrom, 
                to: e.target.value ? parseInt(e.target.value) : null 
              })}
              data-testid="input-mileage-to"
            />
          </div>
        </div>
      </div>
    </div>
  );
}