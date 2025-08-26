import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ShortForm } from "@/components/sell/ShortForm";
import { FullIntakeForm } from "@/components/sell/FullIntakeForm";
import { PreDecisionResult } from "@/components/sell/PreDecisionResult";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Car, FileCheck, Send } from "lucide-react";

type SubmissionStatus = 'draft' | 'pre_decision' | 'full_intake' | 'moderation' | 'approved' | 'scheduled' | 'live' | 'rejected';

interface Submission {
  id: string;
  status: string;
  predecision_result?: string;
  predecision_reason?: string;
  photos_count: number;
  videos_count: number;
  [key: string]: any;
}

export default function SellCar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<'short' | 'predecision' | 'full'>('short');

  useEffect(() => {
    if (id) {
      loadSubmission();
    }
  }, [id]);

  const loadSubmission = async () => {
    if (!id) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('seller_submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load submission",
        variant: "destructive",
      });
      navigate('/sell');
      return;
    }

    setSubmission(data);
    
    // Determine current stage based on status
    if (data.status === 'draft') {
      setCurrentStage('short');
    } else if (data.status === 'pre_decision') {
      setCurrentStage('predecision');
    } else {
      setCurrentStage('full');
    }
    
    setLoading(false);
  };

  const getProgressValue = () => {
    switch (currentStage) {
      case 'short': return 25;
      case 'predecision': return 50;
      case 'full': return submission?.status === 'moderation' ? 90 : 75;
      default: return 25;
    }
  };

  const getStageTitle = () => {
    switch (currentStage) {
      case 'short': return 'Основная информация';
      case 'predecision': return 'Предварительная оценка';
      case 'full': return 'Завершение объявления';
      default: return 'Продать автомобиль';
    }
  };

  const getStatusBadge = (status: SubmissionStatus) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Черновик' },
      pre_decision: { variant: 'default' as const, label: 'На рассмотрении' },
      full_intake: { variant: 'secondary' as const, label: 'В работе' },
      moderation: { variant: 'default' as const, label: 'На модерации' },
      approved: { variant: 'outline' as const, label: 'Одобрено' },
      scheduled: { variant: 'outline' as const, label: 'Запланировано' },
      live: { variant: 'outline' as const, label: 'В эфире' },
      rejected: { variant: 'destructive' as const, label: 'Отклонено' }
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <Car className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Загружаем вашу заявку...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <div className="bg-surface border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                На главную
              </Button>
              
              <div className="flex items-center gap-3">
                <Car className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="font-semibold text-lg">{getStageTitle()}</h1>
                  <p className="text-sm text-muted-foreground">≈ 3-5 минут</p>
                </div>
              </div>
            </div>

            {submission && getStatusBadge(submission.status as SubmissionStatus)}
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Прогресс</span>
              <span>{getProgressValue()}% готово</span>
            </div>
            <Progress value={getProgressValue()} className="h-2" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {currentStage === 'short' && (
          <ShortForm
            submission={submission}
            onSubmissionCreated={(newSubmission) => {
              setSubmission(newSubmission);
              setCurrentStage('predecision');
            }}
            onSubmissionUpdated={(updatedSubmission) => {
              setSubmission(updatedSubmission);
            }}
          />
        )}
        
        {currentStage === 'predecision' && submission && (
          <PreDecisionResult
            submission={submission}
            onProceedToFull={() => setCurrentStage('full')}
            onBackToEdit={() => setCurrentStage('short')}
          />
        )}
        
        {currentStage === 'full' && submission && (
          <FullIntakeForm
            submission={submission}
            onSubmissionUpdated={(updatedSubmission) => {
              setSubmission(updatedSubmission);
            }}
          />
        )}
      </div>
    </div>
  );
}