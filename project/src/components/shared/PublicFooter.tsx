import { FusionGridLogo } from './FusionGridLogo';
import { ShieldCheck, Lock, FileCheck, AlertTriangle, ArrowRight, Github, ExternalLink } from 'lucide-react';

interface PublicFooterProps {
  navigate: (to: string) => void;
}

export function PublicFooter({ navigate }: PublicFooterProps) {
  return (
    <footer className="relative border-t border-[#D8C2AA] bg-[#F5EBDD] text-[#38241B]">
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand & Overview */}
          <div className="md:col-span-5">
            <button onClick={() => navigate('/')} className="flex items-center text-left">
              <FusionGridLogo size="md" variant="auto" />
            </button>
            <p className="mt-4 max-w-md text-sm text-[#755C49] leading-relaxed">
              FusionGrid is a unified state interoperability platform connecting legacy government
              departments through secure, consent-based data sharing, canonical schemas, and automated
              cross-department workflows.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5 text-xs">
              <span className="flex items-center gap-1.5 rounded-full border border-[#D8C2AA] bg-[#FFF8ED] px-3 py-1 font-semibold text-[#6F4028] shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-[#C58B55]" /> ISO 27001 Aligned
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-[#D8C2AA] bg-[#FFF8ED] px-3 py-1 font-semibold text-[#6F4028] shadow-sm">
                <Lock className="h-3.5 w-3.5 text-[#C58B55]" /> End-to-End Encrypted
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-[#D8C2AA] bg-[#FFF8ED] px-3 py-1 font-semibold text-[#6F4028] shadow-sm">
                <FileCheck className="h-3.5 w-3.5 text-[#C58B55]" /> DPDP Act Compliant
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#38241B]">
              Platform & Architecture
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-[#755C49]">
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="transition-colors hover:text-[#6F4028] flex items-center gap-1"
                >
                  About FusionGrid
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/how-it-works')}
                  className="transition-colors hover:text-[#6F4028] flex items-center gap-1"
                >
                  How It Works & Workflow
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/architecture')}
                  className="transition-colors hover:text-[#6F4028] flex items-center gap-1"
                >
                  System Architecture
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/services')}
                  className="transition-colors hover:text-[#6F4028] flex items-center gap-1"
                >
                  Government Services Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/login')}
                  className="transition-colors hover:text-[#6F4028] flex items-center gap-1"
                >
                  Citizen Portal Login
                </button>
              </li>
            </ul>
          </div>

          {/* Standards & Governance */}
          <div className="md:col-span-4">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#38241B]">
              Standards & Interoperability
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-[#755C49]">
              <li className="flex items-center justify-between border-b border-[#D8C2AA]/60 pb-1.5">
                <span>Identity Bridge</span>
                <span className="font-mono text-xs font-semibold text-[#6F4028]">UIDAI / e-KYC 2.1</span>
              </li>
              <li className="flex items-center justify-between border-b border-[#D8C2AA]/60 pb-1.5">
                <span>Health Protocol</span>
                <span className="font-mono text-xs font-semibold text-[#6F4028]">ABDM / FHIR R4</span>
              </li>
              <li className="flex items-center justify-between border-b border-[#D8C2AA]/60 pb-1.5">
                <span>Academic Records</span>
                <span className="font-mono text-xs font-semibold text-[#6F4028]">DigiLocker / ABC</span>
              </li>
              <li className="flex items-center justify-between border-b border-[#D8C2AA]/60 pb-1.5">
                <span>Direct Benefit Transfer</span>
                <span className="font-mono text-xs font-semibold text-[#6F4028]">PFMS / Webhooks</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[#D8C2AA] pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-[#755C49]">
            © 2026 Government of Maharashtra. FusionGrid Demonstration Platform.
          </p>
          <div className="flex items-center gap-2 rounded-full border border-[#C58B55]/40 bg-[#C58B55]/10 px-3 py-1.5 text-xs font-semibold text-[#6F4028]">
            <AlertTriangle className="h-3.5 w-3.5 text-[#C58B55]" />
            SIH 2026 Prototype — Fictional Demonstration Data
          </div>
        </div>
      </div>
    </footer>
  );
}
