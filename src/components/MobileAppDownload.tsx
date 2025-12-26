import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Apple, Play } from 'lucide-react';

interface MobileAppDownloadProps {
  className?: string;
}

export function MobileAppDownload({ className }: MobileAppDownloadProps) {
  return (
    <Card className={`p-4 sm:p-6 lg:p-6 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm border-border/50 ${className || ''}`}>
      <div className="text-center space-y-3 sm:space-y-4 lg:space-y-4">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <Smartphone className="h-6 w-6 sm:h-8 sm:w-8 lg:h-8 lg:w-8 text-primary" />
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Download Mobile App</h2>
        </div>

        <p className="text-xs sm:text-sm lg:text-sm text-muted-foreground max-w-2xl mx-auto px-2">
          Monitor your pNodes on the go! Access real-time analytics, receive instant notifications,
          and manage your network from anywhere.
        </p>

        {/* Coming Soon Badge */}
        <Badge variant="outline" className="text-xs sm:text-sm lg:text-sm px-2 sm:px-3 lg:px-3 py-1 lg:py-1">
          Coming Soon
        </Badge>

        {/* App Store Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 lg:gap-3 pt-2 sm:pt-3 lg:pt-3">
          {/* Apple App Store */}
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-auto py-2 sm:py-2.5 lg:py-2.5 px-4 sm:px-5 lg:px-5 hover:scale-105 transition-transform"
            disabled
          >
            <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-2.5">
              <Apple className="h-6 w-6 sm:h-8 sm:w-8 lg:h-8 lg:w-8" />
              <div className="text-left">
                <div className="text-[10px] sm:text-xs text-muted-foreground">Download on the</div>
                <div className="text-sm sm:text-base lg:text-base font-semibold">App Store</div>
              </div>
            </div>
          </Button>

          {/* Google Play Store */}
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-auto py-2 sm:py-2.5 lg:py-2.5 px-4 sm:px-5 lg:px-5 hover:scale-105 transition-transform"
            disabled
          >
            <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-2.5">
              <Play className="h-6 w-6 sm:h-8 sm:w-8 lg:h-8 lg:w-8" />
              <div className="text-left">
                <div className="text-[10px] sm:text-xs text-muted-foreground">GET IT ON</div>
                <div className="text-sm sm:text-base lg:text-base font-semibold">Google Play</div>
              </div>
            </div>
          </Button>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-3 pt-3 sm:pt-4 lg:pt-4 text-xs sm:text-sm">
          <div className="p-2.5 sm:p-3 lg:p-3 rounded-lg bg-muted/20 border border-border/30">
            <div className="font-semibold mb-0.5 sm:mb-1">Real-Time Monitoring</div>
            <div className="text-muted-foreground text-[10px] sm:text-xs">Track your pNodes anywhere</div>
          </div>
          <div className="p-2.5 sm:p-3 lg:p-3 rounded-lg bg-muted/20 border border-border/30">
            <div className="font-semibold mb-0.5 sm:mb-1">Push Notifications</div>
            <div className="text-muted-foreground text-[10px] sm:text-xs">Instant alerts on your device</div>
          </div>
          <div className="p-2.5 sm:p-3 lg:p-3 rounded-lg bg-muted/20 border border-border/30">
            <div className="font-semibold mb-0.5 sm:mb-1">Native Performance</div>
            <div className="text-muted-foreground text-[10px] sm:text-xs">Fast and responsive interface</div>
          </div>
        </div>

        {/* Notify Me */}
        <div className="pt-2 sm:pt-3 lg:pt-3">
          <p className="text-[10px] sm:text-xs lg:text-xs text-muted-foreground mb-2 sm:mb-3">
            Want to be notified when the mobile apps launch?
          </p>
          <Button variant="default" size="sm" className="gap-1.5 sm:gap-2 h-8 sm:h-9 lg:h-9 text-xs sm:text-sm">
            <Badge className="bg-primary/20 hover:bg-primary/30 text-[10px] sm:text-xs px-1.5 py-0.5">New</Badge>
            Notify Me on Launch
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Compact version for footer
export function MobileAppDownloadCompact() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Smartphone className="h-4 w-4" />
        <span>Download Mobile App</span>
      </div>

      <div className="flex flex-col gap-2">
        {/* Apple App Store */}
        <button
          disabled
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 bg-card/50 hover:bg-card transition-colors opacity-60 cursor-not-allowed"
        >
          <Apple className="h-6 w-6" />
          <div className="text-left text-xs">
            <div className="text-muted-foreground">Download on the</div>
            <div className="font-semibold">App Store</div>
          </div>
        </button>

        {/* Google Play Store */}
        <button
          disabled
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 bg-card/50 hover:bg-card transition-colors opacity-60 cursor-not-allowed"
        >
          <Play className="h-6 w-6" />
          <div className="text-left text-xs">
            <div className="text-muted-foreground">GET IT ON</div>
            <div className="font-semibold">Google Play</div>
          </div>
        </button>
      </div>

      <Badge variant="outline" className="w-fit text-xs">
        Coming Soon
      </Badge>
    </div>
  );
}
