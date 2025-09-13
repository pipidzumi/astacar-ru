import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useFilters } from "./FilterProvider";

export function AdvancedFilters() {
  const { state, updateFilters, toggleArrayItem } = useFilters();

  const bodyTypes = ["sedan", "hatchback", "wagon", "coupe", "cabrio", "liftback", "pickup", "minivan", "suv"];
  const transmissions = ["mt", "at", "cvt", "amt", "dct"];
  const driveTypes = ["fwd", "rwd", "awd", "4wd"];
  const fuelTypes = ["gasoline", "diesel", "hybrid", "electric", "gas"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full pt-4" role="region" aria-label="Advanced filters">
      {/* Vehicle Characteristics */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">Характеристики автомобиля</h3>
        
        {/* Body type */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Тип кузова</Label>
          <div className="flex flex-wrap gap-2">
            {bodyTypes.map((type) => (
              <Badge
                key={type}
                variant={state.bodyTypes.includes(type as any) ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent"
                data-testid={`badge-body-type-${type}`}
                onClick={() => toggleArrayItem("bodyTypes", type)}
              >
                {type === "sedan" ? "Седан" : 
                 type === "hatchback" ? "Хэтчбек" : 
                 type === "wagon" ? "Универсал" :
                 type === "coupe" ? "Купе" :
                 type === "cabrio" ? "Кабриолет" :
                 type === "liftback" ? "Лифтбек" :
                 type === "pickup" ? "Пикап" :
                 type === "minivan" ? "Минивэн" :
                 type === "suv" ? "Внедорожник" : type}
              </Badge>
            ))}
          </div>
        </div>

        {/* Transmission */}
        <div>
          <Label className="text-sm font-medium mb-2 block">КПП</Label>
          <div className="flex flex-wrap gap-2">
            {transmissions.map((trans) => (
              <Badge
                key={trans}
                variant={state.transmissions.includes(trans as any) ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent"
                data-testid={`badge-transmission-${trans}`}
                onClick={() => toggleArrayItem("transmissions", trans)}
              >
                {trans === "mt" ? "Механика" :
                 trans === "at" ? "Автомат" :
                 trans === "cvt" ? "Вариатор" :
                 trans === "amt" ? "Робот" :
                 trans === "dct" ? "Преселектив" : trans}
              </Badge>
            ))}
          </div>
        </div>

        {/* Drive type */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Привод</Label>
          <div className="flex flex-wrap gap-2">
            {driveTypes.map((drive) => (
              <Badge
                key={drive}
                variant={state.driveTypes.includes(drive as any) ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent"
                data-testid={`badge-drive-${drive}`}
                onClick={() => toggleArrayItem("driveTypes", drive)}
              >
                {drive === "fwd" ? "Передний" :
                 drive === "rwd" ? "Задний" :
                 drive === "awd" ? "Полный" :
                 drive === "4wd" ? "4WD" : drive}
              </Badge>
            ))}
          </div>
        </div>

        {/* Fuel type */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Топливо</Label>
          <div className="flex flex-wrap gap-2">
            {fuelTypes.map((fuel) => (
              <Badge
                key={fuel}
                variant={state.fuelTypes.includes(fuel as any) ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent"
                data-testid={`badge-fuel-${fuel}`}
                onClick={() => toggleArrayItem("fuelTypes", fuel)}
              >
                {fuel === "gasoline" ? "Бензин" :
                 fuel === "diesel" ? "Дизель" :
                 fuel === "hybrid" ? "Гибрид" :
                 fuel === "electric" ? "Электро" :
                 fuel === "gas" ? "ГБО" : fuel}
              </Badge>
            ))}
          </div>
        </div>

        {/* Mileage range */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Пробег, км</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="От"
              type="number"
              data-testid="input-mileage-from"
              value={state.mileageFrom || ""}
              onChange={(e) => updateFilters({ mileageFrom: e.target.value ? parseInt(e.target.value) : null })}
            />
            <Input
              placeholder="До"
              type="number"
              data-testid="input-mileage-to"
              value={state.mileageTo || ""}
              onChange={(e) => updateFilters({ mileageTo: e.target.value ? parseInt(e.target.value) : null })}
            />
          </div>
        </div>
      </div>

      {/* Auction parameters */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">Параметры аукциона</h3>
        
        {/* Auction state */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Состояние аукциона</Label>
          <div className="flex flex-wrap gap-2">
            {["live", "scheduled", "finished"].map((status) => (
              <Badge
                key={status}
                variant={state.auctionStates.includes(status as any) ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent"
                data-testid={`badge-auction-${status}`}
                onClick={() => toggleArrayItem("auctionStates", status)}
              >
                {status === "live" ? "В эфире" : status === "scheduled" ? "Запланирован" : "Завершён"}
              </Badge>
            ))}
          </div>
        </div>

        {/* Reserve options */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Резервная цена</Label>
          <div className="flex flex-wrap gap-2">
            {["no-reserve", "reserve-met", "reserve-not-met"].map((option) => (
              <Badge
                key={option}
                variant={state.reserveOptions.includes(option as any) ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent"
                data-testid={`badge-reserve-${option}`}
                onClick={() => toggleArrayItem("reserveOptions", option)}
              >
                {option === "no-reserve" ? "Без резерва" : 
                 option === "reserve-met" ? "Резерв достигнут" : "Резерв не достигнут"}
              </Badge>
            ))}
          </div>
        </div>

        {/* Ends within */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Заканчивается</Label>
          <Select 
            value={state.endsWithin || "all"} 
            onValueChange={(value) => updateFilters({ endsWithin: value === "all" ? null : value as any })}
          >
            <SelectTrigger data-testid="select-ends-within">
              <SelectValue placeholder="Выберите период" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Любое время</SelectItem>
              <SelectItem value="15m">В течение 15 минут</SelectItem>
              <SelectItem value="1h">В течение часа</SelectItem>
              <SelectItem value="24h">В течение суток</SelectItem>
              <SelectItem value="3d">В течение 3 дней</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Current bid range */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Текущая ставка, ₽</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="От"
              type="number"
              data-testid="input-bid-from"
              value={state.currentBidFrom || ""}
              onChange={(e) => updateFilters({ currentBidFrom: e.target.value ? parseInt(e.target.value) : null })}
            />
            <Input
              placeholder="До"
              type="number"
              data-testid="input-bid-to"
              value={state.currentBidTo || ""}
              onChange={(e) => updateFilters({ currentBidTo: e.target.value ? parseInt(e.target.value) : null })}
            />
          </div>
        </div>
      </div>

      {/* Condition & History */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">Состояние и история</h3>
        
        {/* Owners count */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Количество владельцев</Label>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((count) => (
              <Badge
                key={count}
                variant={state.ownersCount.includes(count) ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent"
                data-testid={`badge-owners-${count}`}
                onClick={() => toggleArrayItem("ownersCount", count)}
              >
                {count === 3 ? "3+" : count}
              </Badge>
            ))}
          </div>
        </div>

        {/* Checkboxes for various conditions */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="originalTitle"
              data-testid="checkbox-original-title"
              checked={state.originalTitle}
              onCheckedChange={(checked) => updateFilters({ originalTitle: !!checked })}
            />
            <Label htmlFor="originalTitle" className="text-sm">Оригинальный ПТС</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="vinVerified"
              data-testid="checkbox-vin-verified"
              checked={state.vinVerified}
              onCheckedChange={(checked) => updateFilters({ vinVerified: !!checked })}
            />
            <Label htmlFor="vinVerified" className="text-sm">VIN проверен</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="excludeCommercial"
              data-testid="checkbox-exclude-commercial"
              checked={state.excludeCommercial}
              onCheckedChange={(checked) => updateFilters({ excludeCommercial: !!checked })}
            />
            <Label htmlFor="excludeCommercial" className="text-sm">Исключить коммерческое использование</Label>
          </div>
        </div>

        {/* Engine specifications */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Объём двигателя, л</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="От"
              type="number"
              step="0.1"
              data-testid="input-displacement-from"
              value={state.displacementFrom || ""}
              onChange={(e) => updateFilters({ displacementFrom: e.target.value ? parseFloat(e.target.value) : null })}
            />
            <Input
              placeholder="До"
              type="number"
              step="0.1"
              data-testid="input-displacement-to"
              value={state.displacementTo || ""}
              onChange={(e) => updateFilters({ displacementTo: e.target.value ? parseFloat(e.target.value) : null })}
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Мощность, л.с.</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="От"
              type="number"
              data-testid="input-power-from"
              value={state.powerFrom || ""}
              onChange={(e) => updateFilters({ powerFrom: e.target.value ? parseInt(e.target.value) : null })}
            />
            <Input
              placeholder="До"
              type="number"
              data-testid="input-power-to"
              value={state.powerTo || ""}
              onChange={(e) => updateFilters({ powerTo: e.target.value ? parseInt(e.target.value) : null })}
            />
          </div>
        </div>
      </div>

      {/* Media & Quality */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">Медиа и качество</h3>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="withVideo"
              data-testid="checkbox-with-video"
              checked={state.withVideo}
              onCheckedChange={(checked) => updateFilters({ withVideo: !!checked })}
            />
            <Label htmlFor="withVideo" className="text-sm">С видео</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="withInspectionAdvanced"
              data-testid="checkbox-with-inspection-advanced"
              checked={state.withInspection}
              onCheckedChange={(checked) => updateFilters({ withInspection: !!checked })}
            />
            <Label htmlFor="withInspectionAdvanced" className="text-sm">С отчётом эксперта</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="withQA"
              data-testid="checkbox-with-qa"
              checked={state.withQA}
              onCheckedChange={(checked) => updateFilters({ withQA: !!checked })}
            />
            <Label htmlFor="withQA" className="text-sm">С вопросами и ответами</Label>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Минимум фото: {state.minPhotos}</Label>
          <Slider
            value={[state.minPhotos]}
            onValueChange={([value]) => updateFilters({ minPhotos: value })}
            max={60}
            step={10}
            className="w-full"
            data-testid="slider-min-photos"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0</span>
            <span>30+</span>
            <span>60+</span>
          </div>
        </div>
      </div>
    </div>
  );
}