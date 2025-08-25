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
        return 'Great! Your submission looks good';
      case 'conditional':
        return 'Almost there - a few improvements needed';
      case 'need_more_info':
        return 'We need some additional information';
      case 'rejected':
        return 'Sorry, we cannot accept this submission';
      default:
        return 'Processing your submission...';
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'accepted':
        return <Badge className="bg-success text-success-foreground">Accepted</Badge>;
      case 'conditional':
        return <Badge variant="secondary">Conditional</Badge>;
      case 'need_more_info':
        return <Badge variant="outline">More Info Needed</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Processing</Badge>;
    }
  };

  // Simulate pre-decision result if not available
  const result = submission.predecision_result || 'accepted';
  const reason = submission.predecision_reason || 'Your vehicle meets our initial criteria. You can proceed to complete the full listing details.';
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
              <h3 className="font-medium mb-3">Requirements to address:</h3>
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
              <h3 className="font-medium text-success mb-2">Next Steps:</h3>
              <ul className="text-sm space-y-1 text-success">
                <li>• Complete detailed vehicle information</li>
                <li>• Upload comprehensive photo set (60+ photos recommended)</li>
                <li>• Set your pricing strategy</li>
                <li>• Add detailed description</li>
              </ul>
            </div>
          )}

          {result === 'conditional' && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <h3 className="font-medium text-warning mb-2">How to improve:</h3>
              <ul className="text-sm space-y-1 text-warning">
                <li>• Add missing photos or improve photo quality</li>
                <li>• Provide more detailed vehicle information</li>
                <li>• Ensure all required fields are complete</li>
              </ul>
            </div>
          )}

          {result === 'need_more_info' && (
            <div className="bg-info/10 border border-info/20 rounded-lg p-4">
              <p className="text-sm text-info">
                Please provide the additional information requested above, then resubmit for review.
              </p>
            </div>
          )}

          {result === 'rejected' && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <h3 className="font-medium text-destructive mb-2">Alternative options:</h3>
              <ul className="text-sm space-y-1 text-destructive">
                <li>• Check our vehicle eligibility criteria</li>
                <li>• Consider our partner dealers for trade-in</li>
                <li>• Contact support for specific questions</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {result === 'accepted' && (
          <Button onClick={onProceedToFull} size="lg" className="gap-2">
            Continue to Full Listing
            <CheckCircle className="h-4 w-4" />
          </Button>
        )}
        
        {(result === 'conditional' || result === 'need_more_info') && (
          <>
            <Button onClick={onBackToEdit} variant="outline" size="lg">
              Edit Submission
            </Button>
            <Button onClick={onProceedToFull} size="lg">
              Continue Anyway
            </Button>
          </>
        )}
        
        {result === 'rejected' && (
          <Button onClick={onBackToEdit} variant="outline" size="lg">
            Start Over
          </Button>
        )}
        
        <Button onClick={onBackToEdit} variant="ghost" size="lg">
          Back to Edit
        </Button>
      </div>
    </div>
  );
}