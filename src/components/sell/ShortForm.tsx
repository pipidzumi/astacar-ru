import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaUpload } from "./MediaUpload";
import { VinValidator } from "./VinValidator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera, User, Car, FileText, MapPin } from "lucide-react";

interface ShortFormData {
  // Contact
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  
  // Vehicle basics
  make: string;
  model: string;
  year: number;
  trim?: string;
  mileage: number;
  city: string;
  region: string;
  vin?: string;
  vin_unknown_reason?: string;
  
  // Ownership
  seller_type: 'private' | 'dealer';
  owners_count?: number;
  
  // Title/legal
  title_type: 'pts' | 'epts';
  has_liens: boolean;
  has_restrictions: boolean;
  
  // Notes
  seller_notes?: string;
}

interface ShortFormProps {
  submission?: any;
  onSubmissionCreated: (submission: any) => void;
  onSubmissionUpdated: (submission: any) => void;
}

export function ShortForm({ submission, onSubmissionCreated, onSubmissionUpdated }: ShortFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ShortFormData>({
    defaultValues: submission || {}
  });
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<any[]>([]);

  const onSubmit = async (data: ShortFormData) => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const submissionData = {
        ...data,
        seller_id: user.id,
        status: 'pre_decision',
        photos_count: uploadedMedia.filter(m => m.type === 'photo').length,
        videos_count: uploadedMedia.filter(m => m.type === 'video').length,
      };

      let result;
      if (submission?.id) {
        // Update existing submission
        const { data: updatedSubmission, error } = await supabase
          .from('seller_submissions')
          .update(submissionData)
          .eq('id', submission.id)
          .select()
          .single();
          
        if (error) throw error;
        result = updatedSubmission;
        onSubmissionUpdated(result);
      } else {
        // Create new submission
        const { data: newSubmission, error } = await supabase
          .from('seller_submissions')
          .insert(submissionData)
          .select()
          .single();
          
        if (error) throw error;
        result = newSubmission;
        onSubmissionCreated(result);
      }

      // Process pre-decision logic
      await processPreDecision(result.id);

      toast({
        title: "Success",
        description: "Your submission has been saved and is being reviewed",
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save submission",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processPreDecision = async (submissionId: string) => {
    // Call edge function for pre-decision logic
    const { error } = await supabase.functions.invoke('seller-submissions', {
      body: { action: 'predecision', submissionId }
    });
    
    if (error) {
      console.error('Pre-decision processing failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="contact_name">Полное имя *</Label>
                <Input
                  id="contact_name"
                {...register('contact_name', { required: 'Full name is required' })}
                placeholder="Enter your full name"
              />
              {errors.contact_name && (
                <p className="text-sm text-destructive mt-1">{errors.contact_name.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="contact_phone">Phone Number *</Label>
              <Input
                id="contact_phone"
                {...register('contact_phone', { required: 'Phone number is required' })}
                placeholder="+7 (XXX) XXX-XX-XX"
              />
              {errors.contact_phone && (
                <p className="text-sm text-destructive mt-1">{errors.contact_phone.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="contact_email">Email Address *</Label>
            <Input
              id="contact_email"
              type="email"
              {...register('contact_email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              placeholder="your.email@example.com"
            />
            {errors.contact_email && (
              <p className="text-sm text-destructive mt-1">{errors.contact_email.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Basics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="make">Make *</Label>
              <Select onValueChange={(value) => setValue('make', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select make" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bmw">BMW</SelectItem>
                  <SelectItem value="mercedes">Mercedes-Benz</SelectItem>
                  <SelectItem value="audi">Audi</SelectItem>
                  <SelectItem value="porsche">Porsche</SelectItem>
                  <SelectItem value="lexus">Lexus</SelectItem>
                  <SelectItem value="toyota">Toyota</SelectItem>
                  <SelectItem value="honda">Honda</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
                  <Label htmlFor="model">Модель *</Label>
                  <Input
                    id="model"
                {...register('model', { required: 'Model is required' })}
                placeholder="e.g., X5, E-Class"
              />
              {errors.model && (
                <p className="text-sm text-destructive mt-1">{errors.model.message}</p>
              )}
            </div>
            
            <div>
                  <Label htmlFor="year">Год *</Label>
                  <Input
                    id="year"
                type="number"
                {...register('year', { 
                  required: 'Year is required',
                  min: { value: 1990, message: 'Year must be 1990 or later' },
                  max: { value: new Date().getFullYear() + 1, message: 'Invalid year' }
                })}
                placeholder="2020"
              />
              {errors.year && (
                <p className="text-sm text-destructive mt-1">{errors.year.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="trim">Trim/Package</Label>
              <Input
                id="trim"
                {...register('trim')}
                placeholder="e.g., xDrive, AMG, Sport"
              />
            </div>
            
            <div>
                  <Label htmlFor="mileage">Пробег (км) *</Label>
                  <Input
                    id="mileage"
                type="number"
                {...register('mileage', { 
                  required: 'Mileage is required',
                  min: { value: 0, message: 'Mileage cannot be negative' }
                })}
                placeholder="50000"
              />
              {errors.mileage && (
                <p className="text-sm text-destructive mt-1">{errors.mileage.message}</p>
              )}
            </div>
          </div>

          {/* VIN Validator Component */}
          <VinValidator
            onVinChange={(vin, reason) => {
              setValue('vin', vin);
              setValue('vin_unknown_reason', reason);
            }}
            initialVin={submission?.vin}
            initialReason={submission?.vin_unknown_reason}
          />
        </CardContent>
      </Card>

      {/* Location & Ownership */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location & Ownership
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="city">Город *</Label>
                <Input
                  id="city"
                {...register('city', { required: 'City is required' })}
                placeholder="Москва"
              />
              {errors.city && (
                <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="region">Region *</Label>
              <Input
                id="region"
                {...register('region', { required: 'Region is required' })}
                placeholder="Moscow Oblast"
              />
              {errors.region && (
                <p className="text-sm text-destructive mt-1">{errors.region.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="seller_type">Seller Type *</Label>
              <Select onValueChange={(value) => setValue('seller_type', value as 'private' | 'dealer')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private Seller</SelectItem>
                  <SelectItem value="dealer">Dealer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="owners_count">Previous Owners</Label>
              <Input
                id="owners_count"
                type="number"
                {...register('owners_count')}
                placeholder="1"
                min="1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Title & Legal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentation & Legal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title_type">Title Type *</Label>
            <Select onValueChange={(value) => setValue('title_type', value as 'pts' | 'epts')}>
              <SelectTrigger>
                <SelectValue placeholder="Select title type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pts">PTS (Paper Title)</SelectItem>
                <SelectItem value="epts">ePTS (Electronic Title)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="has_liens" 
              onCheckedChange={(checked) => setValue('has_liens', !!checked)}
            />
            <Label htmlFor="has_liens">Vehicle has liens or financing</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="has_restrictions" 
              onCheckedChange={(checked) => setValue('has_restrictions', !!checked)}
            />
            <Label htmlFor="has_restrictions">Vehicle has legal restrictions</Label>
          </div>
        </CardContent>
      </Card>

      {/* Media Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Photos & Videos
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload 6-10 photos minimum. Include front 3/4 view, rear 3/4 view, sides, dashboard showing odometer, engine bay, and VIN plate.
          </p>
        </CardHeader>
        <CardContent>
          <MediaUpload
            submissionId={submission?.id}
            onMediaUploaded={setUploadedMedia}
            initialMedia={[]}
            stage="short"
          />
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('seller_notes')}
            placeholder="Highlights, known issues, service history summary, or anything else potential buyers should know..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading} size="lg" className="gap-2">
          {loading ? 'Saving...' : 'Submit for Review'}
          <Camera className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}