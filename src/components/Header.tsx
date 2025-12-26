import { BookOpen, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useTokenPrice } from '@/hooks/useRpcQuery';
import { formatPrice, formatPriceChange } from '@/services/token-price';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  const { data: tokenPrice } = useTokenPrice();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
          <img
            src="/xandeum-logo.png"
            alt="Xandeum Logo"
            className="w-7 h-7 sm:w-9 sm:h-9 object-contain"
          />
          <div>
            <h1 className="text-sm sm:text-base font-semibold leading-tight">
              <span className="text-primary">Xandeum</span> <span className="hidden xs:inline">pNode Analytics</span><span className="xs:hidden">pNode</span>
            </h1>
            <p className="text-[10px] sm:text-xs hidden sm:block">
              <span className="animate-color-cycle-1">Scalable</span>{' '}
              <span className="animate-color-cycle-2">Storage</span>{' '}
              <span className="animate-color-cycle-3">for</span>{' '}
              <span className="animate-color-cycle-4">Solana</span>
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {tokenPrice && (
            <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg bg-muted/50">
              <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">XAND</span>
              <span className="text-xs sm:text-sm font-bold font-mono">{formatPrice(tokenPrice.price)}</span>
              <div className={cn(
                "flex items-center gap-0.5 text-[10px] sm:text-xs font-medium",
                tokenPrice.priceChange24h >= 0 ? "text-success" : "text-destructive"
              )}>
                {tokenPrice.priceChange24h >= 0 ? (
                  <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                )}
                <span className="hidden xs:inline">{formatPriceChange(tokenPrice.priceChange24h)}</span>
              </div>
            </div>
          )}

          <ThemeToggle />

          <Link to="/docs">
            <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 h-7 sm:h-9 px-2 sm:px-3">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline text-xs">Docs</span>
            </Button>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <Badge variant="secondary" className="hidden md:flex text-[10px] sm:text-xs px-1.5 py-0.5">
              Devnet
            </Badge>
            <Badge variant="secondary" className="hidden md:flex font-mono text-[10px] sm:text-xs px-1.5 py-0.5">
              v0.6
            </Badge>
            <Badge className="bg-success/15 text-success border-0 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-success mr-1" />
              Live
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}