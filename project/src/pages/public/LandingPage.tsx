import { useEffect, useState } from 'react';
import {
  ShieldCheck, Lock, ArrowRight, FileCheck, Workflow, Bell,
  TrendingDown, Zap, Gauge, CheckCircle2, Building2, GraduationCap,
  HeartPulse, Users, Landmark, User, Network, Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prototypeMetrics } from '@/data/mockData';

interface LandingProps {
  navigate: (to: string) => void;
}

const departments = [
  { name: 'Revenue Department', icon: Landmark, color: 'text-blue-600 bg-blue-50' },
  { name: 'Education Department', icon: GraduationCap, color: 'text-emerald-600 bg-emerald-50' },
  { name: 'Health Department', icon: HeartPulse, color: 'text-rose-600 bg-rose-50' },
  { name: 'Social Welfare', icon: Users, color: 'text-amber-600 bg-amber-50' },
];

const benefits = [
  {
    icon: FileCheck,
    title: 'One-Time Data Submission',
    description: 'Submit your information once. FusionGrid securely shares it across departments with your consent — no repeated paperwork.',
  },
  {
    icon: Lock,
    title: 'Secure Data Exchange',
    description: 'Every data exchange is encrypted, logged, and bound to a specific purpose. You control what is shared and with whom.',
  },
  {
    icon: Bell,
    title: 'Unified Tracking',
    description: 'Track every application across all departments from a single dashboard with real-time status and timeline updates.',
  },
  {
    icon: Workflow,
    title: 'Cross-Department Workflows',
    description: 'FusionGrid orchestrates verification across Revenue, Education, Identity, and Welfare departments automatically.',
  },
];

const metricIcons = [TrendingDown, Zap, Gauge, CheckCircle2];

export function LandingPage({ navigate }: LandingProps) {
  const [animatedMetrics, setAnimatedMetrics] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    prototypeMetrics.forEach((m, i) => {
      timers.push(
        setTimeout(() => {
          setAnimatedMetrics((prev) => {
            const next = [...prev];
            let current = 0;
            const interval = setInterval(() => {
              current += 2;
              if (current >= m.value) {
                current = m.value;
                clearInterval(interval);
              }
              next[i] = current;
              return [...next];
            }, 20);
            return next;
          });
        }, 400 + i * 200)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative gradient-mesh">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-6 gap-1.5 border-primary/20 bg-primary/5 text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Government of Maharashtra · Interoperability Platform
            </Badge>
            <h1 className="text-balance font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              One Citizen.{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                One Journey.
              </span>{' '}
              Connected Government.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
              FusionGrid is a secure interoperability platform that connects government departments
              through consent-based data sharing, common data standards, and unified workflow
              orchestration — delivering seamless citizen services without replacing existing portals.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" onClick={() => navigate('/services')} className="gap-2">
                Explore Services
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="gap-2">
                <User className="h-4 w-4" />
                Citizen Portal
              </Button>
            </div>
          </div>

          {/* Architecture Visual */}
          <div className="mx-auto mt-16 max-w-5xl">
            <Card className="overflow-hidden border-primary/10 shadow-xl">
              <CardHeader className="border-b bg-muted/30 pb-4">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Network className="h-4 w-4 text-primary" />
                  FusionGrid Interoperability Architecture
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-col items-center gap-6">
                  {/* Citizen node */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                      <User className="h-8 w-8" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">Citizen</span>
                  </div>

                  {/* Connection line */}
                  <div className="flex items-center gap-2">
                    <div className="h-12 w-px bg-gradient-to-b from-primary/40 to-accent/40" />
                  </div>

                  {/* FusionGrid hub */}
                  <div className="relative flex flex-col items-center gap-2">
                    <div className="absolute inset-0 -z-10 animate-pulse-ring rounded-2xl" />
                    <div className="flex h-20 w-32 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-xl">
                      <div className="text-center">
                        <Network className="mx-auto h-7 w-7" />
                        <span className="mt-1 block text-sm font-bold">FusionGrid</span>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">Interoperability Layer</span>
                  </div>

                  {/* Connection lines */}
                  <div className="flex items-center gap-2">
                    <div className="h-12 w-px bg-gradient-to-b from-accent/40 to-border" />
                  </div>

                  {/* Department nodes */}
                  <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
                    {departments.map((dept, i) => {
                      const Icon = dept.icon;
                      return (
                        <div
                          key={dept.name}
                          className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 animate-fade-in-up"
                          style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                        >
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${dept.color}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <span className="text-xs font-medium text-foreground">{dept.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why FusionGrid */}
      <section className="border-y bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-3">Why FusionGrid</Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Bridging the gap between citizens and government
            </h2>
            <p className="mt-4 text-muted-foreground">
              Today, citizens submit the same data to multiple departments, track applications separately,
              and have no visibility into how their data is used. FusionGrid solves this through interoperability.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <Card key={b.title} className="group border-border/60 transition-all hover:shadow-lg hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-base font-semibold">{b.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{b.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works preview */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-3">How It Works</Badge>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            From application to approval in four steps
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {[
            { step: '01', title: 'Submit Once', desc: 'Enter your information once. FusionGrid pre-fills it across services.', icon: FileCheck },
            { step: '02', title: 'Grant Consent', desc: 'Choose what data each department can access and for what purpose.', icon: Lock },
            { step: '03', title: 'Auto-Verify', desc: 'FusionGrid orchestrates verification across departments in real-time.', icon: Workflow },
            { step: '04', title: 'Track Unified', desc: 'Monitor progress, approvals, and data access from one dashboard.', icon: Bell },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="relative animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <Card className="h-full border-border/60">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-display text-2xl font-bold text-muted/60">{s.step}</span>
                    </div>
                    <h3 className="mt-4 font-display font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => navigate('/how-it-works')} className="gap-2">
            See detailed workflow
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Prototype Impact Simulation */}
      <section className="border-y bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-3 border-amber-300 bg-amber-50 text-amber-700">
              Prototype Impact Simulation
            </Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Measurable improvements for citizens and departments
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Simulated metrics based on prototype testing scenarios. Not real government data.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {prototypeMetrics.map((m, i) => {
              const Icon = metricIcons[i];
              return (
                <Card key={m.label} className="border-border/60 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="font-display text-4xl font-extrabold text-foreground">
                      {animatedMetrics[i]}{m.suffix}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{m.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-2xl">
          <CardContent className="relative p-10 sm:p-16">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-dots opacity-10" />
            <div className="relative max-w-2xl">
              <Database className="h-10 w-10 text-saffron-light" />
              <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
                Experience the connected government
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Log in as a citizen to explore the full application flow — from consent-based data sharing
                to cross-department verification and unified tracking. All data is fictional prototype data.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" variant="secondary" onClick={() => navigate('/login')} className="gap-2">
                  <Building2 className="h-4 w-4" />
                  Enter Citizen Portal
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/services')} className="gap-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  Browse Services
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
