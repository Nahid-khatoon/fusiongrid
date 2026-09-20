import { useState, useMemo } from 'react';
import {
  GraduationCap, FileText, BookOpen, HeartPulse, Users,
  Search, ArrowRight, Clock, Building2, CheckCircle2, ShieldCheck,
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

const categories: (ServiceCategory | 'All')[] = ['All', 'Education', 'Revenue', 'Health', 'Welfare', 'Certificates'];

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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary">
          Services Marketplace
        </Badge>
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          Government services, connected
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Browse services across Education, Revenue, Health, Welfare, and Certificates.
          Apply once — FusionGrid handles cross-department verification automatically.
        </p>
      </div>

      {/* Search & Categories */}
      <div className="mt-10 space-y-4">
        <div className="relative mx-auto max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input

            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
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
      </div>

      {/* Services Grid */}
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

                <div className="mt-4">
                  <p className="text-xs font-semibold text-muted-foreground">Requirements</p>
                  <ul className="mt-2 space-y-1.5">
                    {service.requirements.slice(0, 3).map((req) => (
                      <li key={req} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                        {req}
                      </li>
                    ))}
                    {service.requirements.length > 3 && (
                      <li className="text-xs text-muted-foreground/70">
                        +{service.requirements.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>

                <div className="mt-auto pt-4">
                  <Button
                    className="w-full gap-2"
                    onClick={() => navigate('/login')}
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
        <div className="mt-10 text-center text-muted-foreground">
          No services found. Try a different search or category.
        </div>
      )}

      {/* Prototype notice */}
      <div className="mt-12 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4" />
        All services use mock data — Prototype Integration / Mock Government Department API
      </div>
    </div>
  );
}
