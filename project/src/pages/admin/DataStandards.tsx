import { useState, useEffect } from 'react';
import {
  FileBarChart, ArrowRight, Zap, CheckCircle2, Database,
  GitBranch, AlertTriangle, Users, Loader2, Shield,
  Layers, Code, Check, ExternalLink, Sparkles,
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
    source: 'Revenue & Land Records (Mahabhulekh)',
    rawFields: [
      { raw: 'applicant_full_name', canonical: 'fullName' },
      { raw: 'birth_date_epoch', canonical: 'dateOfBirth' },
      { raw: 'certified_income_inr', canonical: 'annualIncome' },
    ],
  },
  {
    source: 'Higher Education (ABC & AISHE)',
    rawFields: [
      { raw: 'student_legal_name', canonical: 'fullName' },
      { raw: 'dob_formatted', canonical: 'dateOfBirth' },
      { raw: 'institute_aishe_code', canonical: 'collegeId' },
    ],
  },
  {
    source: 'Social Welfare & Direct Benefit Transfer',
    rawFields: [
      { raw: 'beneficiary_name', canonical: 'fullName' },
      { raw: 'aadhaar_linked_dob', canonical: 'dateOfBirth' },
      { raw: 'family_annual_bracket', canonical: 'annualIncome' },
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-[#F5EBDD] text-[#38241B]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#D8C2AA] bg-gradient-to-br from-[#2B1B14] via-[#38241B] to-[#21140F] p-8 text-[#FFF8ED] shadow-xl shadow-[#2B1B14]/15">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 hero-grid-pattern opacity-20" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#C58B55]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C58B55]/40 bg-[#C58B55]/15 px-3 py-1 font-mono text-[11px] font-semibold text-[#C58B55] mb-2">
              <Zap className="h-3.5 w-3.5" />
              CANONICAL ONTOLOGY REPOSITORY
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#FFF8ED] sm:text-3xl">
              Data Standards & Canonical Schemas
            </h1>
            <p className="mt-2 max-w-2xl text-xs text-[#D8C2AA] sm:text-sm leading-relaxed">
              Open Government Data (OGD) standard schema dictionary normalizing divergent department models
              into unified golden records for state-level social security and scholarship delivery.
            </p>
          </div>

          <Button
            onClick={() => navigate('/admin/dashboard')}
            className="gap-2 bg-gradient-to-r from-[#C58B55] to-[#A06D3B] text-white hover:from-[#B57C48] hover:to-[#8E5E30] font-bold shadow-md border-0 self-start md:self-auto"
          >
            Control Center Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Field-level Transformation Pipeline */}
      <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-md overflow-hidden">
        <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] px-6 py-4">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-[#38241B]">
            <Zap className="h-4.5 w-4.5 text-[#6F4028]" />
            Field-Level Semantic Normalization Pipeline
          </CardTitle>
          <CardDescription className="text-xs text-[#755C49]">
            Automatic bidirectional attribute mapping across legacy SQL databases and web services
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {transformationExamples.map((ex) => (
              <div key={ex.source} className="rounded-2xl border border-[#D8C2AA] bg-[#FFF8ED] p-5 space-y-4 shadow-sm">
                <div className="flex items-center gap-2.5 border-b border-[#D8C2AA]/60 pb-3">
                  <Database className="h-4.5 w-4.5 text-[#6F4028]" />
                  <h3 className="font-bold text-xs text-[#38241B]">{ex.source}</h3>
                </div>
                <div className="space-y-2.5">
                  {ex.rawFields.map((f) => (
                    <div key={f.raw} className="flex items-center justify-between rounded-xl border border-[#D8C2AA] bg-[#F5EBDD] p-2.5 text-xs">
                      <code className="font-mono text-[11px] text-[#755C49] font-medium">{f.raw}</code>
                      <ArrowRight className="h-3 w-3 text-[#6F4028] shrink-0 mx-1.5" />
                      <code className="font-mono text-[11px] font-bold text-[#6F4028]">{f.canonical}</code>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Master Data Records */}
      <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-md overflow-hidden">
        <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-[#38241B]">
                <FileBarChart className="h-4.5 w-4.5 text-[#6F4028]" />
                Live Master Data Entities (Supabase Store)
              </CardTitle>
              <CardDescription className="text-xs text-[#755C49]">
                Active unified citizen records with source provenance
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-emerald-300 bg-emerald-100 text-emerald-800 text-xs font-bold">
              ✓ Canonical Synced
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-xs text-[#755C49]">
              <Loader2 className="h-5 w-5 animate-spin mr-2 text-[#6F4028]" />
              Querying sovereign Supabase schema registry…
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-xs text-rose-800">
              Database connection error: {error}
            </div>
          ) : citizens.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#755C49]">
              <Users className="mx-auto h-10 w-10 text-[#755C49]/30 mb-2" />
              No citizen records found. Registered users will appear here automatically.
            </div>
          ) : (
            <div className="space-y-4">
              {citizens.map((c) => (
                <div key={c.id} className="rounded-2xl border border-[#D8C2AA] bg-[#FFF8ED] p-5 space-y-3.5 shadow-sm hover:border-[#6F4028] transition-all">
                  <div className="flex items-center justify-between border-b border-[#D8C2AA]/50 pb-3">
                    <div>
                      <h4 className="font-bold text-sm text-[#38241B]">{c.full_name || 'Citizen Applicant'}</h4>
                      <p className="font-mono text-[11px] text-[#6F4028] font-bold">UID: {c.id}</p>
                    </div>
                    <Badge variant="outline" className="border-emerald-300 bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {c.verified ? 'Verified Entity' : 'Pending Verification'}
                    </Badge>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#755C49] block">Date of Birth</span>
                      <p className="font-semibold text-[#38241B] mt-0.5">{c.dob || '—'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#755C49] block">Mobile Contact</span>
                      <p className="font-semibold text-[#38241B] mt-0.5">{c.mobile ? `+91 ${c.mobile}` : '—'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#755C49] block">District Jurisdiction</span>
                      <p className="font-semibold text-[#38241B] mt-0.5">{c.district || '—'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conflict Resolution */}
      <Card className="border-[#D8C2AA] bg-[#FFF8ED] shadow-md overflow-hidden">
        <CardHeader className="border-b border-[#D8C2AA] bg-[#F5EBDD] px-6 py-4">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-[#38241B]">
            <GitBranch className="h-4.5 w-4.5 text-[#6F4028]" />
            Field Divergence & Conflict Resolution Engine
          </CardTitle>
          <CardDescription className="text-xs text-[#755C49]">
            Automated conflict detection across disparate departmental databases
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {conflictIssues.length === 0 ? (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-950">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700" />
              <span>Zero field divergence detected across registered citizen profiles. 100% schema alignment achieved.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {conflictIssues.map((issue) => (
                <div key={issue.id} className="rounded-xl border border-[#D8C2AA] bg-[#FFF8ED] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#38241B]">{issue.citizenName}</span>
                    <Badge variant="outline" className="text-xs font-bold border-[#C58B55] bg-[#C58B55]/15 text-[#6F4028]">
                      Conflict Detected
                    </Badge>
                  </div>
                  <p className="text-xs text-[#755C49]">{issue.description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
