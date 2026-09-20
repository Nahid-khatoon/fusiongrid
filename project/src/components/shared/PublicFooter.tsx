import { FusionGridLogo } from './FusionGridLogo';
import { ShieldCheck, Lock, FileCheck, AlertTriangle } from 'lucide-react';

interface PublicFooterProps {
  navigate: (to: string) => void;
}

export function PublicFooter({ navigate }: PublicFooterProps) {
  return (
    <footer className="border-t bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center">
              <FusionGridLogo className="[&_span]:text-background [&_.text-primary]:text-saffron-light" />
            </div>
            <p className="mt-4 max-w-md text-sm text-background/70">
              FusionGrid is a Government of Maharashtra interoperability platform connecting
              departments through secure, consent-based data sharing for unified citizen services.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-background/60">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> ISO 27001 Aligned
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="h-4 w-4" /> End-to-End Encrypted
              </span>
              <span className="flex items-center gap-1.5">
                <FileCheck className="h-4 w-4" /> DPDP Act Compliant
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-background">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm text-background/70">
              <li><button onClick={() => navigate('/about')} className="hover:text-saffron-light">About FusionGrid</button></li>
              <li><button onClick={() => navigate('/how-it-works')} className="hover:text-saffron-light">How It Works</button></li>
              <li><button onClick={() => navigate('/architecture')} className="hover:text-saffron-light">Architecture</button></li>
              <li><button onClick={() => navigate('/services')} className="hover:text-saffron-light">Services</button></li>
              <li><button onClick={() => navigate('/login')} className="hover:text-saffron-light">Citizen Portal</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-background">Resources</h4>
            <ul className="mt-3 space-y-2 text-sm text-background/70">
              <li>Privacy Policy</li>
              <li>Consent Framework</li>
              <li>API Standards</li>
              <li>Grievance Redressal</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-background/20 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-background/60">
            © 2026 Government of Maharashtra. All rights reserved.
          </p>
          <div className="flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs text-amber-200">
            <AlertTriangle className="h-3.5 w-3.5" />
            Fictional SIH Prototype Data — Not for real government use
          </div>
        </div>
      </div>
    </footer>
  );
}
