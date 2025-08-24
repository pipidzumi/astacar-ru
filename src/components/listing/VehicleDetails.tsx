import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Car, 
  Calendar, 
  Gauge, 
  Palette, 
  Cog, 
  Users, 
  FileText,
  MapPin,
  Settings
} from "lucide-react";
import type { ListingData } from "@/lib/mockData";

interface VehicleDetailsProps {
  vehicle: ListingData["vehicle"];
}

export const VehicleDetails = ({ vehicle }: VehicleDetailsProps) => {
  const specs = [
    { icon: Calendar, label: "Год выпуска", value: vehicle.year },
    { icon: Gauge, label: "Пробег", value: `${vehicle.mileage.toLocaleString()} км` },
    { icon: Cog, label: "Двигатель", value: vehicle.engine },
    { icon: Settings, label: "КПП", value: vehicle.transmission },
    { icon: Car, label: "Привод", value: vehicle.drivetrain },
    { icon: Palette, label: "Цвет", value: vehicle.color },
    { icon: Users, label: "Владельцев", value: vehicle.ownersCount },
    { icon: FileText, label: "VIN", value: `${vehicle.vin.slice(0, 8)}***` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Характеристики автомобиля
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div>
          <h4 className="font-semibold mb-3">Основные характеристики</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specs.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">{label}</div>
                  <div className="font-medium">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents Section */}
        <div className="pt-4 border-t">
          <h4 className="font-semibold mb-3">Документы и правовой статус</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Тип ПТС</span>
              <Badge variant="outline">
                {vehicle.documents.titleType === "pts" ? "Оригинал ПТС" : "ЭПТС"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Обременения</span>
              <Badge variant={vehicle.documents.liens ? "destructive" : "default"}>
                {vehicle.documents.liens ? "Есть" : "Отсутствуют"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Ограничения</span>
              <Badge variant={vehicle.documents.restrictions ? "destructive" : "default"}>
                {vehicle.documents.restrictions ? "Есть" : "Отсутствуют"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Full Description */}
        <div className="pt-4 border-t">
          <h4 className="font-semibold mb-3">Комплектация и особенности</h4>
          <div className="text-sm text-muted-foreground leading-relaxed">
            <p className="mb-2">
              Автомобиль {vehicle.make} {vehicle.model} {vehicle.trim} {vehicle.year} года выпуска 
              в отличном техническом состоянии. Пробег составляет {vehicle.mileage.toLocaleString()} км, 
              что соответствует возрасту автомобиля.
            </p>
            <p className="mb-2">
              Двигатель {vehicle.engine} работает исправно, {vehicle.transmission}. 
              Привод: {vehicle.drivetrain}. Цвет кузова: {vehicle.color}.
            </p>
            <p>
              В собственности {vehicle.ownersCount} владельцев. Документы в порядке, 
              {!vehicle.documents.liens && !vehicle.documents.restrictions && " обременений и ограничений нет"}.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};