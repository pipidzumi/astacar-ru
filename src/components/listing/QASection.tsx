import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, User, Shield } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { ListingData } from "@/lib/mockData";
import { supabase } from "@/integrations/supabase/client";

interface QASectionProps {
  qa: ListingData["qa"];
  listingId: string;
}

export const QASection = ({ qa, listingId }: QASectionProps) => {
  const [newQuestion, setNewQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 24) return `${diffHours} ч назад`;
    return `${diffDays} дн назад`;
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) return;

    setIsSubmitting(true);
    try {
      // FIXED: Use secure backend with input sanitization
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Ошибка",
          description: "Требуется авторизация для задавания вопросов",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('secure-qa', {
        body: { 
          listing_id: listingId,
          question: newQuestion.trim()
        }
      });

      if (error) throw error;
      
      toast({
        title: "Вопрос отправлен",
        description: "Эксперт или модератор ответит в ближайшее время",
      });
      
      setNewQuestion("");
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить вопрос. Попробуйте ещё раз.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Вопросы и ответы ({qa.questions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Question Form */}
        <div className="space-y-3">
          <h4 className="font-medium">Задать вопрос</h4>
          <Textarea
            placeholder="Напишите ваш вопрос об автомобиле... (минимум 10 символов)"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            rows={3}
            maxLength={2000}
            aria-label="Ваш вопрос"
            aria-describedby="question-help"
          />
          <div className="flex items-center justify-between">
            <div>
              <p id="question-help" className="text-xs text-muted-foreground">
                Вопросы публичны. На них отвечают эксперты и модераторы.
              </p>
              <p className="text-xs text-muted-foreground">
                {newQuestion.length}/2000 символов
              </p>
            </div>
            <Button 
              onClick={handleSubmitQuestion}
              disabled={!newQuestion.trim() || newQuestion.trim().length < 10 || isSubmitting}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Отправка..." : "Задать вопрос"}
            </Button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {qa.questions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Вопросов пока нет</p>
              <p className="text-sm">Будьте первым!</p>
            </div>
          ) : (
            qa.questions.map((question) => (
              <div key={question.id} className="border rounded-lg p-4 space-y-3">
                {/* Question */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{question.authorMasked}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(question.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm">{question.text}</p>
                </div>

                {/* Answers */}
                {question.answers.length > 0 && (
                  <div className="pl-6 border-l-2 border-muted space-y-3">
                    {question.answers.map((answer, index) => (
                      <div key={index} className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <Badge variant="secondary" className="text-xs">
                            {answer.authorRole === "expert" ? "Эксперт" : "Модератор"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(answer.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm">{answer.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* No Answer Yet */}
                {question.answers.length === 0 && (
                  <div className="pl-6 border-l-2 border-dashed border-muted">
                    <p className="text-xs text-muted-foreground italic">
                      Ответ появится в ближайшее время
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Guidelines */}
        <div className="pt-4 border-t">
          <h5 className="font-medium mb-2 text-sm">Правила общения</h5>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Задавайте конкретные вопросы об автомобиле</li>
            <li>• Будьте вежливы и корректны</li>
            <li>• Не размещайте контактную информацию</li>
            <li>• За нарушения предусмотрена блокировка</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};