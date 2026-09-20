import { useState, useEffect } from 'react';
import {
  FileBarChart, ArrowRight, Zap, CheckCircle2, Database,
  GitBranch, AlertTriangle, Users, Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dataQualityIssues } from '@/data/adminData';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface DataStandardsProps {
  navigate: (to: string) => void;
}

interface CitizenRow {
  id: string;
  full_name: string;
  mobile: string;
  dob: string;
  address: string;
  district: string;
  college: string;
  course: string;
  verified: boolean;
}

const transformationExamples = [
  {
    source: 'Revenue Department',
    rawFields: [
      { raw: 'full_name', canonical: 'fullName' },
      { raw: 'dob', canonical: 'dateOfBirth' },
      { raw: 'income_amount', canonical: 'annualIncome' },
    ],
  },
  {
    source: 'Education Department',
    rawFields: [
      { raw: 'studentName', canonical: 'fullName' },
      { raw: 'dateOfBirth', canonical: 'dateOfBirth' },
      { raw: 'annualIncome', canonical: 'annualIncome' },
    ],
  },
  {
    source: 'Social Welfare',
    rawFields: [
      { raw: 'name', canonical: 'fullName' },
      { raw: 'birth_date', canonical: 'dateOfBirth' },
      { raw: 'income', canonical: 'annualIncome' },
    ],
  },
];

export function DataStandards({ navigate }: DataStandardsProps) {
  const [citizens, setCitizens] = useState<CitizenRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .rpc('get_all_citizens');
      if (cancelled) return;
      if (fetchError) {
        setError(fetchError.message);
        setCitizens([]);
      } else {
        setCitizens((data as CitizenRow[]) ?? []);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const conflictIssues = dataQualityIssues.filter((i) => i.issueType === 'conflict');

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="font-display text-2xl font-bold tracking-tight">Data Standards</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Field-level transformation from heterogeneous source schemas to the FusionGrid canonical model.
        </p>
      </div>

      {/* Transformation demo */}
      <Card className="mb-6 border-border/60 animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-primary" />
            Schema Transformation
          </CardTitle>
          <CardDescription>How different department schemas map to unified canonical fields</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transformationExamples.map((ex) => (
              <div key={ex.source} className="rounded-lg border bg-muted/20 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  <h3 className="font-display font-semibold text-sm">{ex.source}</h3>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {ex.rawFields.map((f) => (
                    <div key={f.raw} className="rounded-lg border bg-card p-3">
                      <div className="flex items-center gap-1.5">
                        <code className="font-mono text-xs text-muted-foreground">{f.raw}</code>
                        <ArrowRight className="h-3 w-3 text-primary" />
                        <code className="font-mono text-xs font-semibold text-primary">{f.canonical}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Canonical result */}
            <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <h3 className="font-display font-semibold text-sm">FusionGrid Canonical Record</h3>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Unified</Badge>
              </div>
              {loading ? (
                <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading registered citizens…
                </div>
              ) : citizens.length === 0 ? (
                <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  No registered citizens yet. Citizen records will appear here after signup.
                </div>
              ) : (
                <div className="space-y-3">
                  {citizens.map((c) => (
                    <div key={c.id} className="rounded-lg border bg-card p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-semibold">{c.full_name || 'Unnamed Citizen'}</p>
                        <Badge variant="outline" className="font-mono text-xs">
                          {c.id.substring(0, 8)}
                        </Badge>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <div>
                          <code className="font-mono text-xs text-muted-foreground">fullName</code>
                          <p className="mt-0.5 text-sm font-medium">{c.full_name || '—'}</p>
                        </div>
                        <div>
                          <code className="font-mono text-xs text-muted-foreground">dateOfBirth</code>
                          <p className="mt-0.5 text-sm font-medium">{c.dob || '—'}</p>
                        </div>
                        <div>
                          <code className="font-mono text-xs text-muted-foreground">district</code>
                          <p className="mt-0.5 text-sm font-medium">{c.district || '—'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Master Data — Canonical + Source Records */}
      <Card className="mb-6 border-border/60 animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileBarChart className="h-4 w-4 text-primary" />
            Master Data Record
          </CardTitle>
          <CardDescription>Canonical citizen record with source records from Revenue, Education, and Social Welfare</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading registered citizens…
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Failed to load citizen data: {error}
            </div>
          ) : citizens.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">No registered citizens found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Citizen records will appear here once users sign up through the portal.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {citizens.map((c) => (
                <div key={c.id}>
                  {/* Canonical record */}
                  <div className="mb-4 rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-display font-semibold text-sm">Canonical Citizen Record</h3>
                      <Badge variant="outline" className="font-mono">{c.id.substring(0, 8)}</Badge>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Full Name</p>
                        <p className="text-sm font-semibold">{c.full_name || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Date of Birth</p>
                        <p className="text-sm font-semibold">{c.dob || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Mobile</p>
                        <p className="text-sm font-semibold">{c.mobile || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">District</p>
                        <p className="text-sm font-semibold">{c.district || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Verified</p>
                        <p className="text-sm font-semibold">{c.verified ? 'Yes' : 'No'}</p>
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3">
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="text-sm font-semibold">{c.address || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Source records table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                          <th className="px-4 py-3 font-medium">Source</th>
                          <th className="px-4 py-3 font-medium">Source Field</th>
                          <th className="px-4 py-3 font-medium">Source Value</th>
                          <th className="hidden px-4 py-3 font-medium sm:table-cell">Maps To</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b last:border-0 transition-colors hover:bg-muted/30">
                          <td className="px-4 py-3"><Badge variant="outline" className="text-xs">Citizen Profile</Badge></td>
                          <td className="px-4 py-3"><code className="font-mono text-xs text-muted-foreground">full_name</code></td>
                          <td className="px-4 py-3 text-muted-foreground">{c.full_name || '—'}</td>
                          <td className="hidden px-4 py-3 sm:table-cell"><code className="font-mono text-xs font-semibold text-primary">fullName</code></td>
                        </tr>
                        <tr className="border-b last:border-0 transition-colors hover:bg-muted/30">
                          <td className="px-4 py-3"><Badge variant="outline" className="text-xs">Citizen Profile</Badge></td>
                          <td className="px-4 py-3"><code className="font-mono text-xs text-muted-foreground">dob</code></td>
                          <td className="px-4 py-3 text-muted-foreground">{c.dob || '—'}</td>
                          <td className="hidden px-4 py-3 sm:table-cell"><code className="font-mono text-xs font-semibold text-primary">dateOfBirth</code></td>
                        </tr>
                        <tr className="border-b last:border-0 transition-colors hover:bg-muted/30">
                          <td className="px-4 py-3"><Badge variant="outline" className="text-xs">Citizen Profile</Badge></td>
                          <td className="px-4 py-3"><code className="font-mono text-xs text-muted-foreground">address</code></td>
                          <td className="px-4 py-3 text-muted-foreground">{c.address || '—'}</td>
                          <td className="hidden px-4 py-3 sm:table-cell"><code className="font-mono text-xs font-semibold text-primary">address</code></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Quality — Conflicts & Matching */}
      <Card className="mb-6 border-border/60 animate-fade-in-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GitBranch className="h-4 w-4 text-primary" />
            Data Conflicts & Matching
          </CardTitle>
          <CardDescription>Cross-source field conflicts requiring reconciliation</CardDescription>
        </CardHeader>
        <CardContent>
          {conflictIssues.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-sm">No data conflicts detected</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Cross-source field conflicts will appear here when department data is reconciled.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {conflictIssues.map((issue) => (
                <div key={issue.id} className="rounded-lg border bg-muted/20 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <AlertTriangle className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-semibold text-sm">{issue.citizenName}</h3>
                          <Badge variant="outline" className="text-xs">{issue.field}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{issue.description}</p>
                      </div>
                    </div>
                    {issue.matchPercentage !== undefined && (
                      <div className={cn(
                        'flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold',
                        issue.matchPercentage >= 95 ? 'border-emerald-500 text-emerald-600' : 'border-amber-500 text-amber-600'
                      )}>
                        {issue.matchPercentage}%
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <Badge variant="outline" className={cn(
                      issue.status === 'open' ? 'border-red-200 bg-red-50 text-red-600' : 'border-amber-200 bg-amber-50 text-amber-600'
                    )}>
                      {issue.status === 'open' ? 'Needs Reconciliation' : 'Under Review'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dashboard')} className="gap-1">
          <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
