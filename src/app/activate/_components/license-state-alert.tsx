import {
  Alert,
  AlertContent,
  AlertDescription,
} from "@/components/tailgrids/core/alert";

interface LicenseStateAlertProps {
  message: string;
}

/** Why the CRM is locked again (expired, revoked, suspended…). */
export function LicenseStateAlert({ message }: LicenseStateAlertProps) {
  return (
    <Alert status="warning" className="mt-6">
      <AlertContent>
        <AlertDescription>{message}</AlertDescription>
      </AlertContent>
    </Alert>
  );
}
