import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useFilters } from "./FilterProvider";

export function FilterSections() {
  const { state, updateFilters, toggleArrayItem } = useFilters();

  const makesList = ["BMW", "Mercedes-Benz", "Audi", "Toyota", "Volkswagen", "Porsche", "Lexus", "Volvo"];
  const bodyTypes = ["Седан", "Хэтчбек", "Универсал", "Внедорожник", "Пикап", "Фургон", "Купе", "Кабриолет"];
  const transmissions = ["Механика", "Автомат", "Робот", "Вариатор", "Преселективная"];
  const driveTypes = ["Передний", "Задний", "Полный"];
  const fuelTypes = ["Бензин", "Дизель", "Гибрид", "Электро", "Газ"];

  return (
    <Accordion type="multiple" defaultValue={["basics", "auction"]} className="w-full">
      {/* Basic filters */}
      <AccordionItem value="basics">
        <AccordionTrigger>Основные параметры</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Make */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Марка</Label>
            <div className="flex flex-wrap gap-2">
              {makesList.map((make) => (
                <Badge
                  key={make}
                  variant={state.makes.includes(make) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => toggleArrayItem("makes", make)}
                >
                  {make}
                </Badge>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Цена, ₽</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="От"
                type="number"
                value={state.priceFrom || ""}
                onChange={(e) => updateFilters({ priceFrom: e.target.value ? parseInt(e.target.value) : null })}
              />
              <Input
                placeholder="До"
                type="number"
                value={state.priceTo || ""}
                onChange={(e) => updateFilters({ priceTo: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>
          </div>

          {/* Year range */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Год выпуска</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="От"
                type="number"
                min="1990"
                max="2024"
                value={state.yearFrom || ""}
                onChange={(e) => updateFilters({ yearFrom: e.target.value ? parseInt(e.target.value) : null })}
              />
              <Input
                placeholder="До"
                type="number"
                min="1990"
                max="2024"
                value={state.yearTo || ""}
                onChange={(e) => updateFilters({ yearTo: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>
          </div>

          {/* Body type */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Тип кузова</Label>
            <div className="flex flex-wrap gap-2">
              {bodyTypes.map((type) => (
                <Badge
                  key={type}
                  variant={state.bodyTypes.includes(type) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => toggleArrayItem("bodyTypes", type)}
                >
                  {type}
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
                  variant={state.transmissions.includes(trans) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => toggleArrayItem("transmissions", trans)}
                >
                  {trans}
                </Badge>
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Auction parameters */}
      <AccordionItem value="auction">
        <AccordionTrigger>Параметры аукциона</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Auction state */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Состояние аукциона</Label>
            <div className="flex flex-wrap gap-2">
              {["live", "scheduled", "finished"].map((status) => (
                <Badge
                  key={status}
                  variant={state.auctionStates.includes(status) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-accent"
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
                  variant={state.reserveOptions.includes(option) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-accent"
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
            <Select value={state.endsWithin || "all"} onValueChange={(value) => updateFilters({ endsWithin: value === "all" ? null : value })}>
              <SelectTrigger>
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
        </AccordionContent>
      </AccordionItem>

      {/* Condition */}
      <AccordionItem value="condition">
        <AccordionTrigger>Состояние и история</AccordionTrigger>
        <AccordionContent className="space-y-4">
          {/* Owners count */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Количество владельцев</Label>
            <div className="flex flex-wrap gap-2">
              {["1", "2", "3+"].map((count) => (
                <Badge
                  key={count}
                  variant={state.ownersCount.includes(count) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => toggleArrayItem("ownersCount", count)}
                >
                  {count}
                </Badge>
              ))}
            </div>
          </div>

          {/* Checkboxes for various conditions */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="originalTitle"
                checked={state.originalTitle}
                onCheckedChange={(checked) => updateFilters({ originalTitle: !!checked })}
              />
              <Label htmlFor="originalTitle" className="text-sm">Оригинальный ПТС</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="vinVerified"
                checked={state.vinVerified}
                onCheckedChange={(checked) => updateFilters({ vinVerified: !!checked })}
              />
              <Label htmlFor="vinVerified" className="text-sm">VIN проверен</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="excludeCommercial"
                checked={state.excludeCommercial}
                onCheckedChange={(checked) => updateFilters({ excludeCommercial: !!checked })}
              />
              <Label htmlFor="excludeCommercial" className="text-sm">Исключить коммерческое использование</Label>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Seller info */}
      <AccordionItem value="seller">
        <AccordionTrigger>Продавец и медиа</AccordionTrigger>
        <AccordionContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="withVideo"
                checked={state.withVideo}
                onCheckedChange={(checked) => updateFilters({ withVideo: !!checked })}
              />
              <Label htmlFor="withVideo" className="text-sm">С видео</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="withInspection"
                checked={state.withInspection}
                onCheckedChange={(checked) => updateFilters({ withInspection: !!checked })}
              />
              <Label htmlFor="withInspection" className="text-sm">С отчётом эксперта</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="withQA"
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
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0</span>
              <span>30+</span>
              <span>60+</span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}