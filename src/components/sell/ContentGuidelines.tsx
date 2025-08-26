import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Video, 
  FileText, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Info
} from "lucide-react";

export function ContentGuidelines() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Руководство по качеству контента
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Следуйте этим рекомендациям для быстрого одобрения и максимального интереса покупателей.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photo Guidelines */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Camera className="h-4 w-4" />
              <h3 className="font-medium">Требования к фотографии</h3>
              <Badge variant="outline">Критично</Badge>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-success flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Делайте так:
                </h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Тщательно помойте автомобиль перед съемкой</li>
                  <li>• Используйте естественный дневной свет или яркое внутреннее освещение</li>
                  <li>• Делайте фото с разных углов</li>
                  <li>• Включите крупные планы любых повреждений или износа</li>
                  <li>• Покажите все 4 колеса и глубину протектора шин</li>
                  <li>• Четко снимите VIN табличку</li>
                  <li>• Используйте нейтральный, неперегруженный фон</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Избегайте этого:
                </h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Сильные фильтры или редактирование фото</li>
                  <li>• Размытые изображения низкого разрешения</li>
                  <li>• Фото при плохом освещении</li>
                  <li>• Сокрытие повреждений или проблемных зон</li>
                  <li>• Водяные знаки или логотипы дилеров</li>
                  <li>• Личные вещи на фотографиях</li>
                  <li>• Номерные знаки (будут замаскированы автоматически)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Video Guidelines */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Video className="h-4 w-4" />
              <h3 className="font-medium">Рекомендации по видео</h3>
              <Badge variant="secondary">Настоятельно рекомендуется</Badge>
            </div>
            
            <div className="text-sm space-y-2">
              <p className="text-muted-foreground">Видео значительно повышают доверие покупателей и цены продажи:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Холодный запуск:</strong> Запуск двигателя с ключа, покажите выхлоп</li>
                <li>• <strong>Тест-драйв:</strong> Короткая поездка, показывающая плавную работу</li>
                <li>• <strong>Осмотр салона:</strong> Все функции, электроника, места износа</li>
                <li>• <strong>Проблемные зоны:</strong> Честная демонстрация любых проблем</li>
              </ul>
            </div>
          </div>

          {/* Description Guidelines */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4" />
              <h3 className="font-medium">Лучшие практики описания</h3>
              <Badge variant="outline">Важно</Badge>
            </div>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Честность вызывает доверие:</strong> Прозрачные описания как положительных, 
                так и отрицательных сторон приводят к более высоким финальным ценам продажи и меньшему количеству споров.
              </AlertDescription>
            </Alert>
            
            <div className="mt-4 text-sm space-y-2">
              <h4 className="font-medium">Включите эти детали:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Недавнее обслуживание и сервис</li>
                <li>• Любые модификации или улучшения</li>
                <li>• Известные проблемы или необходимый ремонт</li>
                <li>• Причина продажи</li>
                <li>• Включенные аксессуары или запчасти</li>
                <li>• Условия хранения (в гараже и т.д.)</li>
              </ul>
            </div>
          </div>

          {/* Legal & Safety */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4" />
              <h3 className="font-medium">Правовые вопросы и безопасность</h3>
              <Badge variant="destructive">Обязательно</Badge>
            </div>
            
            <div className="space-y-3">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Обязательные раскрытия:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>• Любая история аварий или кузовные работы</li>
                    <li>• Залоги или финансирование автомобиля</li>
                    <li>• Статус импорта или таможенные проблемы</li>
                    <li>• Серьезные механические проблемы</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <div className="text-sm text-muted-foreground">
                <p><strong>Защита конфиденциальности:</strong></p>
                <ul className="space-y-1 mt-1">
                  <li>• Номерные знаки будут автоматически замаскированы</li>
                  <li>• Уберите личные вещи с фотографий</li>
                  <li>• Не указывайте полный адрес в описаниях</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}