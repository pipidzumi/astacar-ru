import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Filter, SlidersHorizontal } from "lucide-react";

export const FilterBar = () => {
  return (
    <div className="bg-surface-elevated border-b p-4">
      <div className="container">
        {/* Quick Filters */}
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="default" className="cursor-pointer">
            Активные
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">
            Без резерва  
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">
            Заканчиваются
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">
            Премиум
          </Badge>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Select defaultValue="all-makes">
            <SelectTrigger>
              <SelectValue placeholder="Марка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-makes">Все марки</SelectItem>
              <SelectItem value="bmw">BMW</SelectItem>
              <SelectItem value="mercedes">Mercedes-Benz</SelectItem>
              <SelectItem value="porsche">Porsche</SelectItem>
              <SelectItem value="audi">Audi</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all-types">
            <SelectTrigger>
              <SelectValue placeholder="Тип кузова" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-types">Все типы</SelectItem>
              <SelectItem value="sedan">Седан</SelectItem>
              <SelectItem value="suv">Внедорожник</SelectItem>
              <SelectItem value="coupe">Купе</SelectItem>
              <SelectItem value="hatchback">Хэтчбек</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <Input 
              placeholder="Цена от, ₽"
              type="number"
              className="pl-3"
            />
          </div>

          <div className="relative">
            <Input 
              placeholder="Цена до, ₽"
              type="number" 
              className="pl-3"
            />
          </div>

          <Select defaultValue="all-years">
            <SelectTrigger>
              <SelectValue placeholder="Год" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-years">Любой год</SelectItem>
              <SelectItem value="2020-2024">2020-2024</SelectItem>
              <SelectItem value="2015-2019">2015-2019</SelectItem>
              <SelectItem value="2010-2014">2010-2014</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Фильтры
          </Button>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Найдено <span className="font-medium text-foreground">127</span> автомобилей
          </p>
          
          <Select defaultValue="ending-soon">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
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
};