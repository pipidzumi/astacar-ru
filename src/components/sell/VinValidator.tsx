import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface VinValidatorProps {
  onVinChange: (vin: string, reason?: string) => void;
  initialVin?: string;
  initialReason?: string;
}

export function VinValidator({ onVinChange, initialVin = '', initialReason = '' }: VinValidatorProps) {
  const [vin, setVin] = useState(initialVin);
  const [vinUnknownReason, setVinUnknownReason] = useState(initialReason);
  const [showUnknownReason, setShowUnknownReason] = useState(!!initialReason);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  const validateVinFormat = (vinValue: string) => {
    // Basic VIN format validation (17 characters, alphanumeric except I, O, Q)
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
    return vinRegex.test(vinValue);
  };

  const handleVinChange = (value: string) => {
    const upperValue = value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
    setVin(upperValue);
    
    if (upperValue.length === 17) {
      const isValid = validateVinFormat(upperValue);
      setValidationStatus(isValid ? 'valid' : 'invalid');
      if (isValid) {
        onVinChange(upperValue, '');
        setShowUnknownReason(false);
        setVinUnknownReason('');
      }
    } else if (upperValue.length > 0) {
      setValidationStatus('invalid');
    } else {
      setValidationStatus('idle');
    }
  };

  const handleUnknownVin = () => {
    setShowUnknownReason(true);
    setVin('');
    setValidationStatus('idle');
  };

  const handleReasonChange = (reason: string) => {
    setVinUnknownReason(reason);
    onVinChange('', reason);
  };

  const getValidationIcon = () => {
    switch (validationStatus) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'invalid':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {!showUnknownReason ? (
        <div>
          <Label htmlFor="vin">VIN (Vehicle Identification Number)</Label>
          <div className="relative">
            <Input
              id="vin"
              value={vin}
              onChange={(e) => handleVinChange(e.target.value)}
              placeholder="Enter 17-character VIN"
              maxLength={17}
              className={`pr-10 ${
                validationStatus === 'valid' ? 'border-success' : 
                validationStatus === 'invalid' ? 'border-destructive' : ''
              }`}
            />
            {getValidationIcon() && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getValidationIcon()}
              </div>
            )}
          </div>
          
          {validationStatus === 'invalid' && vin.length > 0 && (
            <p className="text-sm text-destructive mt-1">
              {vin.length !== 17 ? `VIN must be 17 characters (currently ${vin.length})` : 'Invalid VIN format'}
            </p>
          )}
          
          {validationStatus === 'valid' && (
            <p className="text-sm text-success mt-1">Valid VIN format</p>
          )}
          
          <div className="mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUnknownVin}
              className="text-sm"
            >
              I don't know the VIN
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <Label htmlFor="vin_unknown_reason">Why is the VIN unknown? *</Label>
          <Textarea
            id="vin_unknown_reason"
            value={vinUnknownReason}
            onChange={(e) => handleReasonChange(e.target.value)}
            placeholder="e.g., VIN plate is damaged, not accessible, or vehicle is not physically available..."
            rows={3}
          />
          <div className="mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowUnknownReason(false);
                setVinUnknownReason('');
                onVinChange('', '');
              }}
              className="text-sm"
            >
              I want to enter VIN
            </Button>
          </div>
        </div>
      )}
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>VIN Tips:</strong> The VIN is usually found on the dashboard (visible through windshield), 
          driver's door jamb, or vehicle documents. It helps verify the vehicle's identity and history.
        </AlertDescription>
      </Alert>
    </div>
  );
}