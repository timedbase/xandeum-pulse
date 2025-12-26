import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error;
  onRetry?: () => void;
  className?: string;
  showIcon?: boolean;
}

export function ErrorState({
  title = 'Error',
  message,
  error,
  onRetry,
  className,
  showIcon = true,
}: ErrorStateProps) {
  const displayMessage = message || error?.message || 'An unexpected error occurred';

  return (
    <div className={cn('flex flex-col items-center justify-center p-8', className)}>
      <Alert variant="destructive" className="max-w-2xl">
        {showIcon && <AlertCircle className="h-4 w-4" />}
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {displayMessage}
        </AlertDescription>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        )}
      </Alert>
    </div>
  );
}

export function ConnectionError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-8 max-w-md text-center">
        <WifiOff className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Connection Failed</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Unable to connect to the pRPC endpoint. Please check your connection and try again.
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Connection
          </Button>
        )}
      </div>
    </div>
  );
}

export function NetworkStatus({
  isConnected,
  onReconnect
}: {
  isConnected: boolean;
  onReconnect?: () => void;
}) {
  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-sm text-success">
        <Wifi className="h-4 w-4" />
        <span>Connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-destructive">
      <WifiOff className="h-4 w-4" />
      <span>Disconnected</span>
      {onReconnect && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReconnect}
          className="h-6 px-2"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

export function ErrorBoundaryFallback({
  error,
  resetErrorBoundary
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card border border-destructive/20 rounded-lg p-8 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-4">
            {error.message || 'An unexpected error occurred'}
          </p>
          <Button onClick={resetErrorBoundary}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
