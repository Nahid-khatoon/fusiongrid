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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { services } from '@/data/mockData';
import type { ServiceCategory } from '@/types';
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

interface ServicesPageProps {
  navigate: (to: string) => void;
}

export function ServicesPage({ navigate }: ServicesPageProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'All'>('All');

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
    <div className="overflow-hidden bg-[#F5EBDD] text-[#38241B]">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF9F0] via-[#F5EBDD] to-[#E8D5BF]/30 border-b border-[#E8D5BF] py-20 text-[#38241B] sm:py-24">
        <div className="pointer-events-none absolute inset-0 hero-grid-pattern opacity-40" />
        <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-[#C58B55]/15 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-12 h-96 w-96 rounded-full bg-[#6F4028]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D8C2AA] bg-[#FFF9F0] px-3.5 py-1.5 text-xs font-semibold text-[#6F4028] shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#C58B55]" />
              Unified Citizen Service Marketplace
            </div>
            <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-[#38241B] leading-tight">
              State Government Services,{' '}
              <span className="text-[#C58B55]">
                Connected
              </span>
            </h1>
            <p className="mt-6 text-base text-[#755C49] sm:text-lg sm:leading-relaxed">
              Explore public welfare schemes across Education, Revenue, Health, and Social Welfare.
              Apply once — FusionGrid orchestrates verification across departments automatically.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Search & Categories Bar */}
        <div className="space-y-4">
          <div className="relative mx-auto max-w-xl">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#755C49]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 pl-11 pr-4 text-sm rounded-2xl shadow-luxury border-[#E8D5BF] bg-[#FFF9F0] text-[#38241B] focus:border-[#6F4028]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-200',
                  activeCategory === cat
                    ? 'border-[#6F4028] bg-[#6F4028] text-[#FFF9F0] shadow-md font-bold'
                    : 'border-[#E8D5BF] bg-[#FFF9F0] text-[#755C49] hover:border-[#6F4028] hover:bg-[#E8D5BF]/40 hover:text-[#38241B]'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service, i) => {
            const Icon = iconMap[service.icon] ?? FileText;
            return (
              <Card
                key={service.id}
                className="group flex flex-col rounded-2xl border-[#E8D5BF] bg-[#FFF9F0] transition-all duration-300 hover:shadow-luxury-lg hover:-translate-y-1.5 hover:border-[#C58B55] shadow-luxury animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5EBDD] text-[#6F4028] transition-all duration-300 group-hover:bg-[#6F4028] group-hover:text-[#FFF9F0] border border-[#E8D5BF] shadow-xs">
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="font-bold text-xs border-[#E8D5BF] bg-[#F5EBDD] text-[#6F4028]">
                      {service.category}
                    </Badge>
                  </div>
                  <CardTitle className="mt-3.5 text-lg font-bold text-[#38241B] group-hover:text-[#6F4028] transition-colors">
                    {service.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1.5 text-xs text-[#755C49]">
                    <Building2 className="h-3.5 w-3.5 text-[#6F4028]" />
                    <span>{service.department}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col pt-0">
                  <p className="text-xs text-[#755C49] leading-relaxed line-clamp-3">
                    {service.description}
                  </p>

                  <div className="mt-4 flex items-center gap-1.5 rounded-xl border border-[#E8D5BF] bg-[#F5EBDD] px-3 py-1.5 text-xs text-[#755C49]">
                    <Clock className="h-3.5 w-3.5 text-[#6F4028]" />
                    <span>Processing SLA:</span>
                    <span className="font-bold text-[#38241B]">{service.processingTime}</span>
                  </div>

                  <div className="mt-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#38241B]">
                      Eligibility Requirements
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {service.requirements.slice(0, 3).map((req) => (
                        <li key={req} className="flex items-start gap-1.5 text-xs text-[#755C49]">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6F4028]" />
                          <span className="line-clamp-1">{req}</span>
                        </li>
                      ))}
                      {service.requirements.length > 3 && (
                        <li className="text-[11px] text-[#755C49]/70 pl-5">
                          +{service.requirements.length - 3} more verification criteria
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="mt-auto pt-6">
                    <Button
                      className="w-full gap-2 font-bold shadow-luxury bg-[#6F4028] text-[#FFF9F0] hover:bg-[#805236] border-0"
                      onClick={() => navigate('/login')}
                    >
                      Apply via Citizen Portal
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 text-center text-[#755C49]">
            <p className="text-base font-semibold text-[#38241B]">No services matched your query</p>
            <p className="text-xs mt-1">Try resetting the filter or searching for "Scholarship" or "Income"</p>
          </div>
        )}

        {/* Prototype notice */}
        <div className="mt-16 flex items-center justify-center gap-2 text-xs text-[#755C49]">
          <ShieldCheck className="h-4 w-4 text-[#6F4028]" />
          <span>Fictional Demonstration Services · Connected via Simulated Department Adapters</span>
        </div>
      </div>
    </div>
  );
}
