import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFilters } from "./FilterProvider";

export function PrimaryFilters() {
  const { state, updateFilters, toggleArrayItem } = useFilters();
  const makesList = ["BMW", "Mercedes-Benz", "Audi", "Toyota", "Volkswagen", "Porsche", "Lexus", "Volvo"];

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Make & Model */}
      <div className="flex items-center gap-2">
        <Select 
          value={state.makes[0] || ""} 
          onValueChange={(value) => value ? toggleArrayItem("makes", value) : null}
        >
          <SelectTrigger className="w-36" data-testid="select-make">
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
          data-testid="input-price-from"
          value={state.priceFrom || ""}
          onChange={(e) => updateFilters({ priceFrom: e.target.value ? parseInt(e.target.value) : null })}
        />
        <span className="text-muted-foreground">-</span>
        <Input
          placeholder="до"
          type="number"
          className="w-28"
          data-testid="input-price-to"
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
          data-testid="input-year-from"
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
          data-testid="input-year-to"
          value={state.yearTo || ""}
          onChange={(e) => updateFilters({ yearTo: e.target.value ? parseInt(e.target.value) : null })}
        />
      </div>

      {/* Quick filter chips */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={state.reserveOptions.includes("no-reserve") ? "default" : "outline"}
          className="cursor-pointer"
          data-testid="badge-no-reserve"
          onClick={() => toggleArrayItem("reserveOptions", "no-reserve")}
        >
          Без резерва
        </Badge>
        <Badge
          variant={state.endsWithin === "24h" ? "default" : "outline"}
          className="cursor-pointer"
          data-testid="badge-ends-soon"
          onClick={() => updateFilters({ endsWithin: state.endsWithin === "24h" ? null : "24h" })}
        >
          Скоро закончатся
        </Badge>
        <Badge
          variant={state.withInspection ? "default" : "outline"}
          className="cursor-pointer"
          data-testid="badge-with-inspection"
          onClick={() => updateFilters({ withInspection: !state.withInspection })}
        >
          С отчётом эксперта
        </Badge>
      </div>
    </div>
  );
}