import { useState, useMemo } from 'react';
import {
  GraduationCap,
  FileText,
  BookOpen,
  HeartPulse,
  Users,
  Search,
  ArrowRight,
  Clock,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { services } from '@/data/mockData';
import type { ServiceCategory, ServiceItem } from '@/types';
import { cn } from '@/lib/utils';

const iconMap: Record<string, typeof GraduationCap> = {
  'graduation-cap': GraduationCap,
  'file-text': FileText,
  'book-open': BookOpen,
  'heart-pulse': HeartPulse,
  users: Users,
};

const categories: (ServiceCategory | 'All')[] = [
  'All',
  'Education',
  'Revenue',
  'Health',
  'Welfare',
  'Certificates',
];

interface PortalServicesProps {
  navigate: (to: string) => void;
}

export function PortalServices({ navigate }: PortalServicesProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'All'>('All');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase()) ||
        s.department.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F5EBDD] text-[#38241B]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#D8C2AA] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF8ED] shadow-xl shadow-[#2B1B14]/15">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 hero-grid-pattern opacity-20" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#C58B55]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C58B55]/40 bg-[#C58B55]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[#C58B55] mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              SINGLE-WINDOW DIGITAL PUBLIC INFRASTRUCTURE
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#FFF8ED] sm:text-3xl">
              Unified State Welfare & Service Catalog
            </h1>
            <p className="mt-2 max-w-2xl text-xs text-[#D8C2AA] sm:text-sm leading-relaxed">
              Apply for government scholarships, caste & income certificates, and citizen entitlements.
              Your verified master profile pre-fills each application automatically with your consent.
            </p>
          </div>

          <div className="flex items-center gap-3 md:flex-col md:items-end">
            <div className="rounded-2xl border border-[#D8C2AA]/30 bg-white/5 p-4 text-right backdrop-blur-md">
              <span className="block font-mono text-[10px] text-[#C58B55]">FEDERATED SCHEMES</span>
              <span className="font-display text-2xl font-bold text-[#FFF8ED]">{services.length} Active Portals</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Categories Bar */}
      <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#755C49]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-10 pr-4 text-xs rounded-xl shadow-xs border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] focus:border-[#C58B55]"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#D8C2AA]/60">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200',
                  activeCategory === cat
                    ? 'border-[#6F4028] bg-[#6F4028] text-[#FFF8ED] shadow-sm'
                    : 'border-[#D8C2AA] bg-[#FFF8ED] text-[#755C49] hover:border-[#6F4028] hover:bg-[#EAD8C2] hover:text-[#38241B]'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((service, i) => {
          const Icon = iconMap[service.icon] ?? FileText;
          return (
            <Card
              key={service.id}
              className="group flex flex-col border-[#D8C2AA] bg-[#FFF8ED] transition-all duration-300 hover:border-[#6F4028] hover:shadow-xl animate-fade-in-up overflow-hidden"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="h-1 w-full bg-gradient-to-r from-[#6F4028] via-[#C58B55] to-[#805236] opacity-80 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-3 px-6 pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#F5EBDD] text-[#6F4028] transition-colors group-hover:bg-[#6F4028] group-hover:text-[#FFF8ED] border border-[#D8C2AA] shadow-sm">
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="font-bold text-[10px] border-[#D8C2AA] bg-[#F5EBDD] text-[#6F4028]">
                    {service.category}
                  </Badge>
                </div>
                <CardTitle className="mt-4 font-display text-lg font-bold text-[#38241B]">
                  {service.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-xs text-[#755C49]">
                  <Building2 className="h-3.5 w-3.5 text-[#6F4028] shrink-0" />
                  <span className="truncate">{service.department}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col pt-0 px-6 pb-6">
                <p className="text-xs text-[#755C49] leading-relaxed line-clamp-3">
                  {service.description}
                </p>

                <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#D8C2AA] bg-[#F5EBDD] px-3 py-2 text-xs text-[#755C49]">
                  <Clock className="h-3.5 w-3.5 text-[#6F4028] shrink-0" />
                  <span>Statutory SLA:</span>
                  <span className="font-bold text-[#38241B]">{service.processingTime}</span>
                </div>

                <div className="mt-auto pt-6">
                  <Button
                    className="w-full gap-2 font-bold shadow-md bg-[#6F4028] text-[#FFF8ED] hover:bg-[#805236] border-0"
                    onClick={() => setSelectedService(service)}
                  >
                    <span>Apply for Service</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="border-[#D8C2AA] bg-[#FFF8ED]">
          <CardContent className="py-20 text-center text-[#755C49]">
            <FileText className="mx-auto h-12 w-12 text-[#755C49]/30 mb-3" />
            <h4 className="font-bold text-[#38241B] text-base">No Services Match Criteria</h4>
            <p className="text-xs text-[#755C49] max-w-sm mx-auto mt-1">
              Please adjust your search terms or select "All" categories to view available schemes.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Service Detail / Launch Application Modal */}
      <Dialog open={!!selectedService} onOpenChange={(open) => !open && setSelectedService(null)}>
        <DialogContent className="max-w-lg rounded-3xl border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] shadow-2xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-3.5 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5EBDD] text-[#6F4028] border border-[#D8C2AA]">
                {(() => {
                  const Icon = iconMap[selectedService?.icon ?? ''] ?? FileText;
                  return <Icon className="h-6 w-6" />;
                })()}
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-[#38241B]">
                  {selectedService?.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-[#755C49]">
                  {selectedService?.department}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <p className="text-xs text-[#755C49] leading-relaxed">
              {selectedService?.description}
            </p>

            <div className="flex items-center gap-2 rounded-xl border border-[#D8C2AA] bg-[#F5EBDD] p-3 text-xs">
              <Clock className="h-4 w-4 text-[#6F4028] shrink-0" />
              <span className="text-[#755C49]">Guaranteed Resolution Window:</span>
              <span className="font-bold text-[#38241B]">{selectedService?.processingTime}</span>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#38241B]">
                Automated Verification Requirements
              </p>
              <ul className="mt-2 space-y-2">
                {selectedService?.requirements.map((req) => (
                  <li key={req} className="flex items-start gap-2 text-xs text-[#755C49]">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6F4028]" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-950">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700" />
              <span>
                FusionGrid will automatically pre-fill your verified profile credentials and request time-bound DPDP consent.
              </span>
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedService(null)}
              className="border-[#D8C2AA] bg-[#FFF8ED] text-[#38241B] hover:bg-[#EAD8C2] font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedService) navigate(`/portal/apply/${selectedService.id}`);
              }}
              className="gap-2 bg-[#6F4028] hover:bg-[#805236] text-[#FFF8ED] border-0 font-bold shadow-md"
            >
              Proceed to Application
              <ArrowRight className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
