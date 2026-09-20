import { useState, useMemo } from 'react';
import {
  GraduationCap, FileText, BookOpen, HeartPulse, Users,
  Search, ArrowRight, Clock, Building2, CheckCircle2, ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
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

const categories: (ServiceCategory | 'All')[] = ['All', 'Education', 'Revenue', 'Health', 'Welfare', 'Certificates'];

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
        s.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">Services Marketplace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse and apply for government services. Your profile data is pre-filled automatically.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-xl animate-fade-in-up">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input

          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories */}
      <div className="mb-6 flex flex-wrap gap-2 animate-fade-in-up">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
              activeCategory === cat
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((service, i) => {
          const Icon = iconMap[service.icon] ?? FileText;
          return (
            <Card
              key={service.id}
              className="group flex flex-col border-border/60 transition-all hover:shadow-lg hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary">{service.category}</Badge>
                </div>
                <CardTitle className="mt-3">{service.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-xs">
                  <Building2 className="h-3.5 w-3.5" />
                  {service.department}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="text-sm text-muted-foreground">{service.description}</p>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Processing time: <span className="font-medium text-foreground">{service.processingTime}</span>
                </div>
                <div className="mt-auto pt-4">
                  <Button
                    className="w-full gap-2"
                    onClick={() => setSelectedService(service)}
                  >
                    Apply Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-10 text-center text-muted-foreground">
          No services found. Try a different search or category.
        </div>
      )}

      {/* Service detail dialog */}
      <Dialog open={!!selectedService} onOpenChange={(open) => !open && setSelectedService(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {(() => {
                  const Icon = iconMap[selectedService?.icon ?? ''] ?? FileText;
                  return <Icon className="h-6 w-6" />;
                })()}
              </div>
              <div>
                <DialogTitle>{selectedService?.name}</DialogTitle>
                <DialogDescription>{selectedService?.department}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{selectedService?.description}</p>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Processing time:</span>
              <span className="font-medium">{selectedService?.processingTime}</span>
            </div>
            <div>
              <p className="text-sm font-semibold">Requirements</p>
              <ul className="mt-2 space-y-1.5">
                {selectedService?.requirements.map((req) => (
                  <li key={req} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-xs text-amber-700">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Prototype Integration / Mock Government Department API
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedService(null)}>Cancel</Button>
            <Button
              onClick={() => {
                if (selectedService) navigate(`/portal/apply/${selectedService.id}`);
              }}
              className="gap-2"
            >
              Start Application
              <ArrowRight className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
