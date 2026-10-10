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

  const isHome = currentPath === '/' || currentPath === '';

  const isActive = (path: string) => {
    if (path === '/') return isHome;
    return currentPath.startsWith(path);
  };

  return (
    <>
      <div className="h-1 w-full bg-gradient-to-r from-[#6F4028] via-[#C58B55] to-[#805236]" />
      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b transition-all duration-300',
          scrolled
            ? 'bg-[#FFF8ED]/95 backdrop-blur-md border-[#D8C2AA] shadow-md shadow-[#6F4028]/5'
            : 'bg-[#FFF8ED] border-[#D8C2AA]'
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate('/')} className="flex items-center">
            <FusionGridLogo variant="auto" />
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'relative rounded-lg px-4 py-2 text-sm font-semibold transition-all',
                  isActive(item.path)
                    ? 'text-[#6F4028] bg-[#EAD8C2]/70 font-bold'
                    : 'text-[#38241B] hover:text-[#6F4028] hover:bg-[#EAD8C2]'
                )}
              >
                {item.label}
                {isActive(item.path) && (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[#6F4028]" />
                )}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
              className="text-[#38241B] hover:text-[#6F4028] hover:bg-[#EAD8C2] font-semibold"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/login')}
              className="gap-1.5 bg-[#6F4028] text-[#FFF8ED] hover:bg-[#805236] font-semibold shadow-md shadow-[#6F4028]/20"
            >
              <ShieldCheck className="h-4 w-4 text-[#C58B55]" />
              Citizen Portal
            </Button>
          </div>

          <button
            className="rounded-lg p-2 text-[#38241B] hover:bg-[#EAD8C2] transition-colors md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-[#D8C2AA] bg-[#FFF8ED] md:hidden shadow-lg">
            <nav className="flex flex-col gap-1 px-4 py-3">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  className={cn(
                    'rounded-lg px-4 py-2.5 text-left text-sm font-semibold transition-colors',
                    isActive(item.path)
                      ? 'bg-[#6F4028] text-[#FFF8ED]'
                      : 'text-[#38241B] hover:bg-[#EAD8C2]'
                  )}
                >
                  {item.label}
                </button>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-[#D8C2AA] pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigate('/login');
                    setMobileOpen(false);
                  }}
                  className="border-[#D8C2AA] text-[#38241B] hover:bg-[#EAD8C2]"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    navigate('/login');
                    setMobileOpen(false);
                  }}
                  className="bg-[#6F4028] text-[#FFF8ED] hover:bg-[#805236]"
                >
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
