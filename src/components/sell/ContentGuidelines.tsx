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
            Content Quality Guidelines
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Follow these guidelines to ensure quick approval and maximum buyer interest.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photo Guidelines */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Camera className="h-4 w-4" />
              <h3 className="font-medium">Photography Requirements</h3>
              <Badge variant="outline">Critical</Badge>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-success flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Do This:
                </h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Clean car thoroughly before photos</li>
                  <li>• Use natural daylight or bright indoor lighting</li>
                  <li>• Take photos from multiple angles</li>
                  <li>• Include close-ups of any damage or wear</li>
                  <li>• Show all 4 wheels and tire tread depth</li>
                  <li>• Capture VIN plate clearly</li>
                  <li>• Use neutral, uncluttered backgrounds</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Avoid This:
                </h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Heavy filters or photo editing</li>
                  <li>• Blurry or low-resolution images</li>
                  <li>• Photos in poor lighting conditions</li>
                  <li>• Hiding damage or problem areas</li>
                  <li>• Watermarks or dealer logos</li>
                  <li>• Personal items visible in shots</li>
                  <li>• License plates (will be masked automatically)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Video Guidelines */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Video className="h-4 w-4" />
              <h3 className="font-medium">Video Recommendations</h3>
              <Badge variant="secondary">Highly Recommended</Badge>
            </div>
            
            <div className="text-sm space-y-2">
              <p className="text-muted-foreground">Videos significantly increase buyer confidence and sale prices:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Cold Start:</strong> Engine startup from key turn, show exhaust</li>
                <li>• <strong>Drive Test:</strong> Short drive showing smooth operation</li>
                <li>• <strong>Interior Tour:</strong> All features, electronics, wear areas</li>
                <li>• <strong>Problem Areas:</strong> Honest demonstration of any issues</li>
              </ul>
            </div>
          </div>

          {/* Description Guidelines */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4" />
              <h3 className="font-medium">Description Best Practices</h3>
              <Badge variant="outline">Important</Badge>
            </div>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Honesty builds trust:</strong> Transparent descriptions about both positives 
                and negatives lead to higher final sale prices and fewer disputes.
              </AlertDescription>
            </Alert>
            
            <div className="mt-4 text-sm space-y-2">
              <h4 className="font-medium">Include These Details:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Recent maintenance and services</li>
                <li>• Any modifications or upgrades</li>
                <li>• Known issues or required repairs</li>
                <li>• Reason for selling</li>
                <li>• Included accessories or spare parts</li>
                <li>• Storage conditions (garage kept, etc.)</li>
              </ul>
            </div>
          </div>

          {/* Legal & Safety */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4" />
              <h3 className="font-medium">Legal & Safety</h3>
              <Badge variant="destructive">Required</Badge>
            </div>
            
            <div className="space-y-3">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Required Disclosures:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>• Any accident history or bodywork</li>
                    <li>• Liens or financing on the vehicle</li>
                    <li>• Import status or customs issues</li>
                    <li>• Major mechanical problems</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <div className="text-sm text-muted-foreground">
                <p><strong>Privacy Protection:</strong></p>
                <ul className="space-y-1 mt-1">
                  <li>• License plates will be automatically masked</li>
                  <li>• Remove personal items from photos</li>
                  <li>• Don't include your full address in descriptions</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}