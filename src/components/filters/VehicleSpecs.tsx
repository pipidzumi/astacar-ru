import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFilters } from "./FilterProvider";
import { BodyType, TransmissionType, DriveType, FuelType } from "@/types/filters";

export function VehicleSpecs() {
  const { state, toggleArrayItem, setRange } = useFilters();

  const bodyTypes: BodyType[] = ['sedan', 'hatchback', 'wagon', 'coupe', 'cabrio', 'liftback', 'pickup', 'minivan', 'suv'];
  const transmissions: TransmissionType[] = ['mt', 'at', 'cvt', 'amt', 'dct'];
  const driveTypes: DriveType[] = ['fwd', 'rwd', 'awd', '4wd'];
  const fuelTypes: FuelType[] = ['gasoline', 'diesel', 'hybrid', 'electric', 'gas'];

  const bodyTypeLabels = {
    'sedan': 'Седан',
    'hatchback': 'Хэтчбек',
    'wagon': 'Универсал',
    'coupe': 'Купе',
    'cabrio': 'Кабриолет',
    'liftback': 'Лифтбек',
    'pickup': 'Пикап',
    'minivan': 'Минивэн',
    'suv': 'Внедорожник'
  };

  const transmissionLabels = {
    'mt': 'Механика',
    'at': 'Автомат',
    'cvt': 'Вариатор',
    'amt': 'Робот',
    'dct': 'Преселектив'
  };

  const driveTypeLabels = {
    'fwd': 'Передний',
    'rwd': 'Задний',
    'awd': 'Полный',
    '4wd': '4WD'
  };

  const fuelTypeLabels = {
    'gasoline': 'Бензин',
    'diesel': 'Дизель',
    'hybrid': 'Гибрид',
    'electric': 'Электро',
    'gas': 'Газ'
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Характеристики</h3>

        {/* Body type */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Тип кузова</Label>
          <div className="flex flex-wrap gap-2">
            {bodyTypes.map((type) => (
              <Badge
                key={type}
                variant={state.bodyTypes.includes(type) ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent"
                onClick={() => toggleArrayItem("bodyTypes", type)}
                data-testid={`body-type-${type}`}
              >
                {bodyTypeLabels[type]}
              </Badge>
            ))}
          </div>
        </div>

        {/* Transmission */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Коробка передач</Label>
          <div className="flex flex-wrap gap-2">
            {transmissions.map((transmission) => (
              <Badge
                key={transmission}
                variant={state.transmissions.includes(transmission) ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent"
                onClick={() => toggleArrayItem("transmissions", transmission)}
                data-testid={`transmission-${transmission}`}
              >
                {transmissionLabels[transmission]}
              </Badge>
            ))}
          </div>
        </div>

        {/* Drive type */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Привод</Label>
          <div className="flex flex-wrap gap-2">
            {driveTypes.map((drive) => (
              <Badge
                key={drive}
                variant={state.driveTypes.includes(drive) ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent"
                onClick={() => toggleArrayItem("driveTypes", drive)}
                data-testid={`drive-type-${drive}`}
              >
                {driveTypeLabels[drive]}
              </Badge>
            ))}
          </div>
        </div>

        {/* Fuel type */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Тип топлива</Label>
          <div className="flex flex-wrap gap-2">
            {fuelTypes.map((fuel) => (
              <Badge
                key={fuel}
                variant={state.fuelTypes.includes(fuel) ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent"
                onClick={() => toggleArrayItem("fuelTypes", fuel)}
                data-testid={`fuel-type-${fuel}`}
              >
                {fuelTypeLabels[fuel]}
              </Badge>
            ))}
          </div>
        </div>

        {/* Engine displacement */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Объем двигателя, л</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="От"
              type="number"
              step="0.1"
              min="0.5"
              max="8.0"
              value={state.displacementFrom || ""}
              onChange={(e) => setRange("displacement", { 
                from: e.target.value ? parseFloat(e.target.value) : null, 
                to: state.displacementTo 
              })}
              data-testid="input-displacement-from"
            />
            <Input
              placeholder="До"
              type="number"
              step="0.1"
              min="0.5"
              max="8.0"
              value={state.displacementTo || ""}
              onChange={(e) => setRange("displacement", { 
                from: state.displacementFrom, 
                to: e.target.value ? parseFloat(e.target.value) : null 
              })}
              data-testid="input-displacement-to"
            />
          </div>
        </div>

        {/* Engine power */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Мощность, л.с.</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="От"
              type="number"
              min="50"
              max="2000"
              value={state.powerFrom || ""}
              onChange={(e) => setRange("power", { 
                from: e.target.value ? parseInt(e.target.value) : null, 
                to: state.powerTo 
              })}
              data-testid="input-power-from"
            />
            <Input
              placeholder="До"
              type="number"
              min="50"
              max="2000"
              value={state.powerTo || ""}
              onChange={(e) => setRange("power", { 
                from: state.powerFrom, 
                to: e.target.value ? parseInt(e.target.value) : null 
              })}
              data-testid="input-power-to"
            />
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Цвет</Label>
          <div className="flex flex-wrap gap-2">
            {['Белый', 'Черный', 'Серый', 'Серебристый', 'Красный', 'Синий', 'Зеленый', 'Коричневый', 'Желтый', 'Оранжевый'].map((color) => (
              <Badge
                key={color}
                variant={state.colors.includes(color) ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent"
                onClick={() => toggleArrayItem("colors", color)}
                data-testid={`color-${color}`}
              >
                {color}
              </Badge>
            ))}
          </div>
        </div>

        {/* Steering wheel */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Руль</Label>
          <div className="flex gap-2">
            <Badge
              variant={state.steeringWheel === "left" ? "default" : "outline"}
              className="cursor-pointer hover:bg-accent"
              onClick={() => state.steeringWheel === "left" ? 
                setRange("steeringWheel", { from: null, to: null }) : 
                setRange("steeringWheel", { from: "left" as any, to: null })
              }
              data-testid="steering-wheel-left"
            >
              Левый
            </Badge>
            <Badge
              variant={state.steeringWheel === "right" ? "default" : "outline"}
              className="cursor-pointer hover:bg-accent"
              onClick={() => state.steeringWheel === "right" ? 
                setRange("steeringWheel", { from: null, to: null }) : 
                setRange("steeringWheel", { from: "right" as any, to: null })
              }
              data-testid="steering-wheel-right"
            >
              Правый
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}