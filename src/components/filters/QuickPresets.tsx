import { Badge } from "@/components/ui/badge";
import { Clock, Award, Star, User, FileCheck } from "lucide-react";
import { useFilters } from "./FilterProvider";

const presets = [
  {
    id: "ending-soon",
    label: "Заканчиваются",
    icon: Clock,
    filters: { endsWithin: "1h" }
  },
  {
    id: "no-reserve",
    label: "Без резерва",
    icon: Award,
    filters: { reserveOptions: ["no-reserve"] }
  },
  {
    id: "one-owner",
    label: "Один владелец",
    icon: User,
    filters: { ownersCount: ["1"] }
  },
  {
    id: "with-inspection",
    label: "С отчётом",
    icon: FileCheck,
    filters: { withInspection: true }
  },
  {
    id: "premium",
    label: "Премиум",
    icon: Star,
    filters: { makes: ["BMW", "Mercedes-Benz", "Audi", "Porsche", "Lexus"] }
  }
];

export function QuickPresets() {
  const { updateFilters, applyFilters } = useFilters();

  const handlePresetClick = (preset: typeof presets[0]) => {
    updateFilters(preset.filters);
    // Auto-apply after short delay for better UX
    setTimeout(() => {
      applyFilters();
    }, 100);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {presets.map((preset) => {
        const Icon = preset.icon;
        return (
          <Badge
            key={preset.id}
            variant="outline"
            className="flex items-center gap-1.5 cursor-pointer hover:bg-accent whitespace-nowrap"
            onClick={() => handlePresetClick(preset)}
          >
            <Icon className="h-3 w-3" />
            {preset.label}
          </Badge>
        );
      })}
    </div>
  );
}