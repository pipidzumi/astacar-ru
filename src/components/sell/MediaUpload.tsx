import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Image, Video, X, CheckCircle, AlertCircle } from "lucide-react";

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  category?: string;
  file_size: number;
  resolution?: string;
  quality_score: number;
}

interface MediaUploadProps {
  submissionId?: string;
  onMediaUploaded: (media: MediaItem[]) => void;
  initialMedia: MediaItem[];
  stage: 'short' | 'full';
}

const REQUIRED_PHOTOS_SHORT = [
  'exterior_front_quarter',
  'exterior_rear_quarter', 
  'exterior_driver_side',
  'exterior_passenger_side',
  'interior_dashboard',
  'engine_bay'
];

const REQUIRED_PHOTOS_FULL = [
  ...REQUIRED_PHOTOS_SHORT,
  'interior_front_seats',
  'interior_rear_seats',
  'wheels_all_four',
  'tires_tread',
  'vin_plate',
  'odometer_reading',
  'defects_exterior',
  'defects_interior'
];

export function MediaUpload({ submissionId, onMediaUploaded, initialMedia, stage }: MediaUploadProps) {
  const [uploadedMedia, setUploadedMedia] = useState<MediaItem[]>(initialMedia);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const requiredPhotos = stage === 'short' ? REQUIRED_PHOTOS_SHORT : REQUIRED_PHOTOS_FULL;
  const minPhotos = stage === 'short' ? 6 : 40;
  const recommendedPhotos = stage === 'short' ? 10 : 60;

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!submissionId) {
      // For short form, we'll store files temporarily until submission is created
      const tempMedia = acceptedFiles.map((file, index) => ({
        id: `temp-${Date.now()}-${index}`,
        type: file.type.startsWith('video/') ? 'video' as const : 'photo' as const,
        url: URL.createObjectURL(file),
        file_size: file.size,
        quality_score: validateMediaQuality(file),
        file: file // Store original file for later upload
      }));
      
      const newMedia = [...uploadedMedia, ...tempMedia];
      setUploadedMedia(newMedia);
      onMediaUploaded(newMedia);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Upload files to Supabase Storage
      const uploadPromises = acceptedFiles.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${submissionId}/${Date.now()}-${index}.${fileExt}`;
        
        // Simulate upload progress
        setUploadProgress((index / acceptedFiles.length) * 100);
        
        // Here you would implement actual file upload to Supabase Storage
        // For now, we'll simulate it
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          id: `${Date.now()}-${index}`,
          type: file.type.startsWith('video/') ? 'video' as const : 'photo' as const,
          url: URL.createObjectURL(file), // In real implementation, this would be the Storage URL
          file_size: file.size,
          resolution: await getImageResolution(file),
          quality_score: validateMediaQuality(file)
        };
      });
      
      const newMediaItems = await Promise.all(uploadPromises);
      const updatedMedia = [...uploadedMedia, ...newMediaItems];
      
      setUploadedMedia(updatedMedia);
      onMediaUploaded(updatedMedia);
      
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [submissionId, uploadedMedia, onMediaUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    multiple: true,
    maxSize: 15 * 1024 * 1024 // 15MB
  });

  const validateMediaQuality = (file: File): number => {
    // Basic quality scoring - in real implementation, this would be more sophisticated
    let score = 5; // Base score
    
    if (file.size < 500 * 1024) score -= 2; // Too small
    if (file.size > 10 * 1024 * 1024) score += 1; // Good size
    
    return Math.max(1, Math.min(10, score));
  };

  const getImageResolution = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.onload = () => {
          resolve(`${img.width}x${img.height}`);
          URL.revokeObjectURL(img.src);
        };
        img.src = URL.createObjectURL(file);
      } else {
        resolve('N/A');
      }
    });
  };

  const removeMedia = (id: string) => {
    const filtered = uploadedMedia.filter(item => item.id !== id);
    setUploadedMedia(filtered);
    onMediaUploaded(filtered);
  };

  const getPhotoCompletionStatus = () => {
    const photoCount = uploadedMedia.filter(m => m.type === 'photo').length;
    return {
      current: photoCount,
      min: minPhotos,
      recommended: recommendedPhotos,
      percentage: Math.min((photoCount / recommendedPhotos) * 100, 100)
    };
  };

  const completionStatus = getPhotoCompletionStatus();

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        {isDragActive ? (
          <p className="text-lg font-medium">Drop files here...</p>
        ) : (
          <div>
            <p className="text-lg font-medium mb-2">
              Drag & drop photos and videos, or click to browse
            </p>
            <p className="text-muted-foreground">
              Supports JPEG, PNG, MP4, MOV up to 15MB each
            </p>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Uploading files...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {/* Progress Summary */}
      <div className="bg-surface rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Photo Progress</h3>
          <Badge variant={completionStatus.current >= completionStatus.min ? "outline" : "secondary"}>
            {completionStatus.current} / {completionStatus.recommended} photos
          </Badge>
        </div>
        
        <Progress value={completionStatus.percentage} className="mb-3" />
        
        <div className="text-sm text-muted-foreground">
          <p>Minimum required: {completionStatus.min} photos</p>
          <p>Recommended: {completionStatus.recommended} photos for best results</p>
        </div>
      </div>

      {/* Content Guidelines */}
      {stage === 'full' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Photo Requirements:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Clean car in good lighting (daylight preferred)</li>
              <li>Include all 4 wheels and tire tread depth</li>
              <li>Close-ups of any damage or wear</li>
              <li>Interior: all seats, dashboard, electronics</li>
              <li>Engine bay and undercarriage if accessible</li>
              <li>VIN plate clearly visible</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Uploaded Media Grid */}
      {uploadedMedia.length > 0 && (
        <div>
          <h3 className="font-medium mb-3">Uploaded Media ({uploadedMedia.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadedMedia.map((item) => (
              <div key={item.id} className="relative group">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  {item.type === 'photo' ? (
                    <img
                      src={item.url}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                    <Button
                      variant="destructive"
                      size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                  onClick={() => removeMedia(item.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
                
                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.type === 'photo' ? <Image className="h-3 w-3 mr-1" /> : <Video className="h-3 w-3 mr-1" />}
                    {item.quality_score}/10
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {completionStatus.current < completionStatus.min && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need at least {completionStatus.min - completionStatus.current} more photos to proceed.
            Quality photos improve your chances of approval and attract more bidders.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}