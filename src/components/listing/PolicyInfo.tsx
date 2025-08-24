import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Info, 
  Shield, 
  Clock, 
  AlertTriangle, 
  CreditCard,
  FileText,
  ExternalLink
} from "lucide-react";
import type { ListingData } from "@/lib/mockData";

interface PolicyInfoProps {
  policy: ListingData["policy"];
}

export const PolicyInfo = ({ policy }: PolicyInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Правила и условия
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Deposit Policy */}
        <div className="space-y-2">
          <h5 className="font-medium text-sm flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Депозитная политика
          </h5>
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Размер депозита</span>
              <Badge variant="outline">
                {policy.depositPolicy.type === "fixed" 
                  ? `₽${policy.depositPolicy.amount?.toLocaleString()}`
                  : `${policy.depositPolicy.percent}%`
                }
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Депозит блокируется на карте и возвращается проигравшим участникам в течение 3 рабочих дней
            </p>
          </div>
        </div>

        {/* Anti-Sniping */}
        <div className="space-y-2">
          <h5 className="font-medium text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Защита от снайпинга
          </h5>
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
              <div className="text-xs">
                <div className="font-medium">Ставки в последние {policy.antiSnipingMinutes} минут</div>
                <div className="text-muted-foreground mt-1">
                  продлевают аукцион на {policy.antiSnipingMinutes} минут от момента последней ставки
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dispute Window */}
        <div className="space-y-2">
          <h5 className="font-medium text-sm flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Окно для споров
          </h5>
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Время на подачу спора</span>
              <Badge variant="outline">{policy.disputeWindowHours} часов</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              После закрытия аукциона участники могут подать спор в течение указанного времени
            </p>
          </div>
        </div>

        {/* Important Rules */}
        <div className="space-y-2">
          <h5 className="font-medium text-sm">Важные правила</h5>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-current rounded-full mt-2" />
              <div>Ставки нельзя отозвать после подтверждения</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-current rounded-full mt-2" />
              <div>Победитель обязан выкупить автомобиль</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-current rounded-full mt-2" />
              <div>Отказ от выкупа ведёт к потере депозита</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-current rounded-full mt-2" />
              <div>Оплата должна быть произведена в течение 3 дней</div>
            </div>
          </div>
        </div>

        {/* Policy Links */}
        <div className="pt-3 border-t space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            <FileText className="h-4 w-4 mr-2" />
            Пользовательское соглашение
            <ExternalLink className="h-3 w-3 ml-auto" />
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            <Shield className="h-4 w-4 mr-2" />
            Политика безопасности
            <ExternalLink className="h-3 w-3 ml-auto" />
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
            <Info className="h-4 w-4 mr-2" />
            Как работают аукционы
            <ExternalLink className="h-3 w-3 ml-auto" />
          </Button>
        </div>

        {/* Support */}
        <div className="pt-3 border-t">
          <Button variant="outline" size="sm" className="w-full">
            Связаться с поддержкой
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};