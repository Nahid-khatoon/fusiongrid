import { useState, useEffect } from 'react';
import { Menu, X, ShieldCheck } from 'lucide-react';
import { FusionGridLogo } from './FusionGridLogo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PublicHeaderProps {
  currentPath: string;
  navigate: (to: string) => void;
}

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'Architecture', path: '/architecture' },
  { label: 'Services', path: '/services' },
];

export function PublicHeader({ currentPath, navigate }: PublicHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/' || currentPath === '';
    return currentPath.startsWith(path);
  };

  return (
    <>
      <div className="h-1 w-full bg-gradient-to-r from-saffron via-saffron-light to-accent" />
      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b transition-all duration-300',
          scrolled ? 'glass border-border shadow-sm' : 'bg-background/80 border-transparent'
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate('/')} className="flex items-center">
            <FusionGridLogo />
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'relative rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  isActive(item.path)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.label}
                {isActive(item.path) && (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button size="sm" onClick={() => navigate('/login')} className="gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              Citizen Portal
            </Button>
          </div>

          <button
            className="rounded-md p-2 text-foreground md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t bg-background md:hidden">
            <nav className="flex flex-col gap-1 px-4 py-3">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  className={cn(
                    'rounded-md px-4 py-2.5 text-left text-sm font-medium transition-colors',
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  {item.label}
                </button>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t pt-3">
                <Button variant="outline" size="sm" onClick={() => { navigate('/login'); setMobileOpen(false); }}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => { navigate('/login'); setMobileOpen(false); }}>
                  Citizen Portal
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
