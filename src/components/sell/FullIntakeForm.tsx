import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MediaUpload } from "./MediaUpload";
import { PricingSection } from "./PricingSection";
import { ContentGuidelines } from "./ContentGuidelines";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Car, 
  FileText, 
  Camera, 
  DollarSign, 
  Send,
  CheckCircle,
  AlertCircle 
} from "lucide-react";

interface FullIntakeFormProps {
  submission: any;
  onSubmissionUpdated: (submission: any) => void;
}

export function FullIntakeForm({ submission, onSubmissionUpdated }: FullIntakeFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: submission
  });
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [completionScore, setCompletionScore] = useState(75);

  const onSubmit = async (data: any) => {
    setLoading(true);
    
    try {
      const { data: updatedSubmission, error } = await supabase
        .from('seller_submissions')
        .update({
          ...data,
          status: 'moderation',
          submitted_for_moderation_at: new Date().toISOString()
        })
        .eq('id', submission.id)
        .select()
        .single();
        
      if (error) throw error;
      
      onSubmissionUpdated(updatedSubmission);
      
      toast({
        title: "Success",
        description: "Your listing has been submitted for moderation",
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit listing",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Listing Completeness</h2>
            <Badge variant={completionScore >= 90 ? "outline" : "secondary"}>
              {completionScore}% Complete
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Basic Info</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-warning" />
              <span>Photos ({submission.photos_count}/60)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Documentation</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <span>Pricing</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Guidelines */}
      <ContentGuidelines />

      {/* Enhanced Vehicle Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Complete Vehicle Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="body_style">Body Style</Label>
              <Select onValueChange={(value) => setValue('body_style', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select body style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedan">Sedan</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="coupe">Coupe</SelectItem>
                  <SelectItem value="wagon">Wagon</SelectItem>
                  <SelectItem value="hatchback">Hatchback</SelectItem>
                  <SelectItem value="convertible">Convertible</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="drivetrain">Drivetrain</Label>
              <Select onValueChange={(value) => setValue('drivetrain', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select drivetrain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fwd">Front-Wheel Drive</SelectItem>
                  <SelectItem value="rwd">Rear-Wheel Drive</SelectItem>
                  <SelectItem value="awd">All-Wheel Drive</SelectItem>
                  <SelectItem value="4wd">4-Wheel Drive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exterior_color">Exterior Color</Label>
              <Input
                id="exterior_color"
                {...register('exterior_color')}
                placeholder="e.g., Alpine White"
              />
            </div>
            
            <div>
              <Label htmlFor="interior_color">Interior Color</Label>
              <Input
                id="interior_color"
                {...register('interior_color')}
                placeholder="e.g., Black Leather"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="engine">Engine</Label>
              <Input
                id="engine"
                {...register('engine')}
                placeholder="e.g., 3.0L Twin Turbo V6"
              />
            </div>
            
            <div>
              <Label htmlFor="transmission">Transmission</Label>
              <Select onValueChange={(value) => setValue('transmission', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select transmission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="automatic">Automatic</SelectItem>
                  <SelectItem value="cvt">CVT</SelectItem>
                  <SelectItem value="dual_clutch">Dual Clutch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Media Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Professional Media Package
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            High-quality photos and videos significantly increase your sale price and sell-through rate.
          </p>
        </CardHeader>
        <CardContent>
          <MediaUpload
            submissionId={submission.id}
            onMediaUploaded={(media) => {
              setCompletionScore(prev => Math.min(100, prev + (media.length * 2)));
            }}
            initialMedia={[]}
            stage="full"
          />
        </CardContent>
      </Card>

      {/* Condition & History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Vehicle Condition & History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="usage_type">Primary Usage</Label>
            <Select onValueChange={(value) => setValue('usage_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="How was the vehicle primarily used?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="city">City Driving</SelectItem>
                <SelectItem value="highway">Highway Driving</SelectItem>
                <SelectItem value="mixed">Mixed City/Highway</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="winter_storage" 
                onCheckedChange={(checked) => setValue('winter_storage', !!checked)}
              />
              <Label htmlFor="winter_storage">Winter storage / garage kept</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="accident_history" 
                onCheckedChange={(checked) => setValue('accident_history', !!checked)}
              />
              <Label htmlFor="accident_history">Accident history</Label>
            </div>
          </div>
          
          {watch('accident_history') && (
            <div>
              <Label htmlFor="accident_details">Accident Details *</Label>
              <Textarea
                id="accident_details"
                {...register('accident_details')}
                placeholder="Please describe any accidents, repairs, or bodywork in detail..."
                rows={3}
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="known_issues">Known Issues or Required Maintenance</Label>
            <Textarea
              id="known_issues"
              {...register('known_issues')}
              placeholder="Be honest about any mechanical, electrical, or cosmetic issues..."
              rows={3}
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="keys_count">Number of Keys</Label>
              <Input
                id="keys_count"
                type="number"
                {...register('keys_count')}
                placeholder="2"
                min="1"
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-8">
              <Checkbox 
                id="manuals_available" 
                onCheckedChange={(checked) => setValue('manuals_available', !!checked)}
              />
              <Label htmlFor="manuals_available">Owner's manual available</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Strategy */}
      <PricingSection
        submission={submission}
        onPricingChange={(pricing) => {
          Object.entries(pricing).forEach(([key, value]) => {
            setValue(key, value);
          });
        }}
      />

      {/* Public Description */}
      <Card>
        <CardHeader>
          <CardTitle>Public Listing Description</CardTitle>
          <p className="text-sm text-muted-foreground">
            This will be visible to all potential buyers. Be honest, detailed, and highlight the best features.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="highlights">Key Highlights</Label>
            <Textarea
              id="highlights"
              {...register('highlights')}
              placeholder="What makes this vehicle special? Recent services, upgrades, unique features..."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="maintenance_history">Service & Maintenance History</Label>
            <Textarea
              id="maintenance_history"
              {...register('maintenance_history')}
              placeholder="Recent services, regular maintenance, any major work done..."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="included_extras">Included Extras</Label>
            <Textarea
              id="included_extras"
              {...register('included_extras')}
              placeholder="Spare parts, winter tires, accessories, documentation..."
              rows={2}
            />
          </div>
          
          <div>
            <Label htmlFor="sale_reason">Reason for Sale</Label>
            <Textarea
              id="sale_reason"
              {...register('sale_reason')}
              placeholder="Why are you selling? (Optional but builds trust)"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Final Confirmations */}
      <Card>
        <CardHeader>
          <CardTitle>Final Confirmations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please review all information carefully. Once submitted for moderation, 
              major changes will require re-approval.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="truthful_disclosure" required />
              <Label htmlFor="truthful_disclosure">
                I confirm all information provided is truthful and accurate *
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="photo_requirements" required />
              <Label htmlFor="photo_requirements">
                I understand professional photos are required for approval *
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="terms_agreement" required />
              <Label htmlFor="terms_agreement">
                I agree to the seller terms and conditions *
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading} size="lg" className="gap-2">
          {loading ? 'Submitting...' : 'Submit for Moderation'}
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}