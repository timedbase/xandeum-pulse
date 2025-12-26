import { ExternalLink, MessageCircle, BookOpen } from 'lucide-react';
import { MobileAppDownloadCompact } from './MobileAppDownload';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/50 py-8">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="font-semibold mb-3">Xandeum Pulse</h3>
            <p className="text-sm text-muted-foreground">
              Scalable storage layer analytics for Solana dApps. Monitor pNode network performance in real-time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <div className="space-y-2">
              <a
                href="/docs"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Documentation
              </a>
              <a
                href="https://docs.xandeum.network"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Xandeum Docs
              </a>
              <a
                href="https://discord.gg/uqRSmmM5m"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Discord Community
              </a>
              <a
                href="https://xandeum.network"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Xandeum Website
              </a>
            </div>
          </div>

          {/* Mobile Apps */}
          <div>
            <MobileAppDownloadCompact />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Xandeum. All rights reserved.
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Made with ❤️ by</span>
              <a
                href="https://x.com/0xstarhq"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                0xstarhq
              </a>
            </div>
            <div className="text-sm text-muted-foreground">
              Built for the Xandeum Network
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
