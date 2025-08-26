import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";

interface PreDecisionResultProps {
  submission: any;
  onProceedToFull: () => void;
  onBackToEdit: () => void;
}

export function PreDecisionResult({ submission, onProceedToFull, onBackToEdit }: PreDecisionResultProps) {
  const getResultIcon = (result: string) => {
    switch (result) {
      case 'accepted':
        return <CheckCircle className="h-6 w-6 text-success" />;
      case 'conditional':
        return <AlertCircle className="h-6 w-6 text-warning" />;
      case 'need_more_info':
        return <Clock className="h-6 w-6 text-info" />;
      case 'rejected':
        return <XCircle className="h-6 w-6 text-destructive" />;
      default:
        return <Clock className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getResultTitle = (result: string) => {
    switch (result) {
      case 'accepted':
        return 'Отлично! Ваша заявка выглядит хорошо';
      case 'conditional':
        return 'Почти готово - нужны небольшие улучшения';
      case 'need_more_info':
        return 'Нам нужна дополнительная информация';
      case 'rejected':
        return 'К сожалению, мы не можем принять эту заявку';
      default:
        return 'Обрабатываем вашу заявку...';
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'accepted':
        return <Badge className="bg-success text-success-foreground">Принято</Badge>;
      case 'conditional':
        return <Badge variant="secondary">Условно</Badge>;
      case 'need_more_info':
        return <Badge variant="outline">Нужна доп. информация</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Отклонено</Badge>;
      default:
        return <Badge variant="secondary">Обработка</Badge>;
    }
  };

  // Simulate pre-decision result if not available
  const result = submission.predecision_result || 'accepted';
  const reason = submission.predecision_reason || 'Ваш автомобиль соответствует нашим первоначальным критериям. Вы можете продолжить заполнение полной информации для объявления.';
  const requirements = submission.predecision_requirements || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getResultIcon(result)}
          </div>
          <CardTitle className="text-xl">{getResultTitle(result)}</CardTitle>
          <div className="flex justify-center mt-2">
            {getResultBadge(result)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{reason}</AlertDescription>
          </Alert>

          {requirements.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Требования для устранения:</h3>
              <ul className="space-y-2">
                {requirements.map((req: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-warning mt-2 flex-shrink-0" />
                    <span className="text-sm">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result === 'accepted' && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <h3 className="font-medium text-success mb-2">Следующие шаги:</h3>
              <ul className="text-sm space-y-1 text-success">
                <li>• Заполните подробную информацию об автомобиле</li>
                <li>• Загрузите полный набор фотографий (рекомендуется 60+ фото)</li>
                <li>• Установите ценовую стратегию</li>
                <li>• Добавьте подробное описание</li>
              </ul>
            </div>
          )}

          {result === 'conditional' && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <h3 className="font-medium text-warning mb-2">Как улучшить:</h3>
              <ul className="text-sm space-y-1 text-warning">
                <li>• Добавьте недостающие фото или улучшите качество фотографий</li>
                <li>• Предоставьте более подробную информацию об автомобиле</li>
                <li>• Убедитесь, что все обязательные поля заполнены</li>
              </ul>
            </div>
          )}

          {result === 'need_more_info' && (
            <div className="bg-info/10 border border-info/20 rounded-lg p-4">
              <p className="text-sm text-info">
                Пожалуйста, предоставьте дополнительную информацию, указанную выше, затем отправьте на повторное рассмотрение.
              </p>
            </div>
          )}

          {result === 'rejected' && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <h3 className="font-medium text-destructive mb-2">Альтернативные варианты:</h3>
              <ul className="text-sm space-y-1 text-destructive">
                <li>• Ознакомьтесь с нашими критериями приемлемости автомобилей</li>
                <li>• Рассмотрите возможность обмена у наших дилеров-партнеров</li>
                <li>• Обратитесь в службу поддержки по конкретным вопросам</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {result === 'accepted' && (
          <Button onClick={onProceedToFull} size="lg" className="gap-2">
            Продолжить к полному объявлению
            <CheckCircle className="h-4 w-4" />
          </Button>
        )}
        
        {(result === 'conditional' || result === 'need_more_info') && (
          <>
            <Button onClick={onBackToEdit} variant="outline" size="lg">
              Редактировать заявку
            </Button>
            <Button onClick={onProceedToFull} size="lg">
              Продолжить все равно
            </Button>
          </>
        )}
        
        {result === 'rejected' && (
          <Button onClick={onBackToEdit} variant="outline" size="lg">
            Начать заново
          </Button>
        )}
        
        <Button onClick={onBackToEdit} variant="ghost" size="lg">
          Вернуться к редактированию
        </Button>
      </div>
    </div>
  );
}