import type { ApiCallLog, ApiCallStatus } from '@/types';

export interface ApiResponse<T = unknown> {
  success: boolean;
  requestId: string;
  timestamp: string;
  source: string;
  destination: string;
  data: T;
  latencyMs: number;
  status: ApiCallStatus;
  error?: string;
  retryAttempt?: number;
  isSimulated?: boolean;
  simulationNote?: string;
}

export interface CitizenContextProfile {
  fullName?: string;
  college?: string;
  course?: string;
  district?: string;
  dob?: string;
}

const generateRequestId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

const now = () => new Date().toISOString();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface IdentityData {
  citizenId: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  aadhaarVerified: boolean;
  mobileVerified: boolean;
  address: string;
  district: string;
}

export interface IncomeData {
  citizenId: string;
  fullName: string;
  annualIncome: number;
  incomeSource: string;
  financialYear: string;
  certificateNo: string;
  issuingAuthority: string;
}

export interface StudentData {
  citizenId: string;
  studentName: string;
  institution: string;
  course: string;
  enrollmentStatus: string;
  academicYear: string;
  udiseCode: string;
  abcAccountId: string;
}

export interface HealthEligibilityData {
  citizenId: string;
  fullName: string;
  bplStatus: boolean;
  healthSchemeEligible: boolean;
  familyIncome: number;
  category: string;
  abhaId: string;
  rationCardNo: string;
}

export interface SocialWelfareData {
  citizenId: string;
  fullName: string;
  casteCategory: string;
  casteCertificateNo: string;
  validityStatus: 'Validated' | 'Pending';
  domicileVerified: boolean;
  subDivision: string;
  eligibleSchemes: string[];
}

export const mockApiGateway = {
  /**
   * 1. Identity Service Connector (UIDAI e-KYC / MahaOnline)
   */
  async verifyIdentity(
    citizenId: string,
    simulateFail = false,
    context?: CitizenContextProfile
  ): Promise<ApiResponse<IdentityData>> {
    const start = Date.now();
    await delay(600 + Math.random() * 300);
    const latencyMs = Date.now() - start;

    if (simulateFail) {
      return {
        success: false,
        requestId: generateRequestId('REQ-ID'),
        timestamp: now(),
        source: 'Identity Service [Simulated Connector]',
        destination: 'FusionGrid',
        latencyMs,
        status: 'failure',
        isSimulated: true,
        simulationNote: 'Simulated Verification (Demo Data)',
        error: 'Identity Gateway Connection Timeout (504): UIDAI biometric ledger unreachable',
        data: {} as IdentityData,
      };
    }

    return {
      success: true,
      requestId: generateRequestId('REQ-ID'),
      timestamp: now(),
      source: 'Identity Service [Simulated Connector]',
      destination: 'FusionGrid',
      latencyMs,
      status: 'success',
      isSimulated: true,
      simulationNote: 'Simulated Verification (Demo Data)',
      data: {
        citizenId,
        fullName: context?.fullName || 'Applicant Record (Simulated Verification)',
        dateOfBirth: context?.dob || '2004-06-15',
        gender: 'Not specified',
        aadhaarVerified: true,
        mobileVerified: true,
        address: 'Residential Address (Simulated Verification)',
        district: context?.district || 'State District',
      },
    };
  },

  /**
   * 2. Revenue Department Connector (MahaBhulekh / Tahsildar Registry)
   */
  async getIncome(
    citizenId: string,
    simulateFail = false,
    context?: CitizenContextProfile
  ): Promise<ApiResponse<IncomeData>> {
    const start = Date.now();
    await delay(900 + Math.random() * 400);
    const latencyMs = Date.now() - start;

    if (simulateFail) {
      return {
        success: false,
        requestId: generateRequestId('REQ-REV'),
        timestamp: now(),
        source: 'Revenue Department [Simulated Connector]',
        destination: 'FusionGrid',
        latencyMs,
        status: 'failure',
        isSimulated: true,
        simulationNote: 'Simulated Verification (Demo Data)',
        error: 'Revenue Node 503 Service Unavailable: Database lock during daily revenue reconciliation',
        data: {} as IncomeData,
      };
    }

    return {
      success: true,
      requestId: generateRequestId('REQ-REV'),
      timestamp: now(),
      source: 'Revenue Department [Simulated Connector]',
      destination: 'FusionGrid',
      latencyMs,
      status: 'success',
      isSimulated: true,
      simulationNote: 'Simulated Verification (Demo Data)',
      data: {
        citizenId,
        fullName: context?.fullName || 'Applicant Record (Simulated Verification)',
        annualIncome: 420000,
        incomeSource: 'Certified Income Assessment (Simulated Verification)',
        financialYear: '2025-26',
        certificateNo: 'MH-REV-SIM-2025-881290',
        issuingAuthority: `Tahsildar Revenue Office (${context?.district || 'District'} Division)`,
      },
    };
  },

  /**
   * 3. Education Department Connector (AISHE / State Board Registry)
   */
  async getStudentRecord(
    citizenId: string,
    simulateFail = false,
    context?: CitizenContextProfile
  ): Promise<ApiResponse<StudentData>> {
    const start = Date.now();
    await delay(700 + Math.random() * 300);
    const latencyMs = Date.now() - start;

    if (simulateFail) {
      return {
        success: false,
        requestId: generateRequestId('REQ-EDU'),
        timestamp: now(),
        source: 'Education Department [Simulated Connector]',
        destination: 'FusionGrid',
        latencyMs,
        status: 'failure',
        isSimulated: true,
        simulationNote: 'Simulated Verification (Demo Data)',
        error: 'Education Portal 408 Timeout: AISHE academic synchronization delayed',
        data: {} as StudentData,
      };
    }

    return {
      success: true,
      requestId: generateRequestId('REQ-EDU'),
      timestamp: now(),
      source: 'Education Department [Simulated Connector]',
      destination: 'FusionGrid',
      latencyMs,
      status: 'success',
      isSimulated: true,
      simulationNote: 'Simulated Verification (Demo Data)',
      data: {
        citizenId,
        studentName: context?.fullName || 'Applicant Student (Simulated Verification)',
        institution: context?.college || 'Academic Institution (Simulated Verification)',
        course: context?.course || 'Academic Course Program (Simulated Verification)',
        enrollmentStatus: 'Active & Verified (Simulated)',
        academicYear: '2025-26',
        udiseCode: 'MH-EDU-SIM-0192',
        abcAccountId: 'ABC-2025-SIM-MH',
      },
    };
  },

  /**
   * 4. Health Department Connector (Arogya Maharashtra / ABHA)
   */
  async getHealthEligibility(
    citizenId: string,
    simulateFail = false,
    context?: CitizenContextProfile
  ): Promise<ApiResponse<HealthEligibilityData>> {
    const start = Date.now();
    await delay(650 + Math.random() * 250);
    const latencyMs = Date.now() - start;

    if (simulateFail) {
      return {
        success: false,
        requestId: generateRequestId('REQ-HLT'),
        timestamp: now(),
        source: 'Health Department [Simulated Connector]',
        destination: 'FusionGrid',
        latencyMs,
        status: 'failure',
        isSimulated: true,
        simulationNote: 'Simulated Verification (Demo Data)',
        error: 'Health Registry 502 Bad Gateway: Hospital network connector connection refused',
        data: {} as HealthEligibilityData,
      };
    }

    return {
      success: true,
      requestId: generateRequestId('REQ-HLT'),
      timestamp: now(),
      source: 'Health Department [Simulated Connector]',
      destination: 'FusionGrid',
      latencyMs,
      status: 'success',
      isSimulated: true,
      simulationNote: 'Simulated Verification (Demo Data)',
      data: {
        citizenId,
        fullName: context?.fullName || 'Applicant Record (Simulated Verification)',
        bplStatus: false,
        healthSchemeEligible: true,
        familyIncome: 420000,
        category: 'Priority Health Beneficiary (Simulated)',
        abhaId: '91-XXXX-XXXX-9912',
        rationCardNo: 'MH-RC-SIM-884129',
      },
    };
  },

  /**
   * 5. Social Welfare Department Connector (Samaj Kalyan / Caste Scrutiny)
   */
  async getSocialWelfareData(
    citizenId: string,
    simulateFail = false,
    context?: CitizenContextProfile
  ): Promise<ApiResponse<SocialWelfareData>> {
    const start = Date.now();
    await delay(800 + Math.random() * 350);
    const latencyMs = Date.now() - start;

    if (simulateFail) {
      return {
        success: false,
        requestId: generateRequestId('REQ-SOC'),
        timestamp: now(),
        source: 'Social Welfare Department [Simulated Connector]',
        destination: 'FusionGrid',
        latencyMs,
        status: 'failure',
        isSimulated: true,
        simulationNote: 'Simulated Verification (Demo Data)',
        error: 'Social Welfare Registry 500: Database cluster failover in progress',
        data: {} as SocialWelfareData,
      };
    }

    return {
      success: true,
      requestId: generateRequestId('REQ-SOC'),
      timestamp: now(),
      source: 'Social Welfare Department [Simulated Connector]',
      destination: 'FusionGrid',
      latencyMs,
      status: 'success',
      isSimulated: true,
      simulationNote: 'Simulated Verification (Demo Data)',
      data: {
        citizenId,
        fullName: context?.fullName || 'Applicant Record (Simulated Verification)',
        casteCategory: context?.course?.includes('OBC') ? 'Other Backward Class (OBC)' : 'Category Master',
        casteCertificateNo: 'MH/SOC/SIM/2025/9981',
        validityStatus: 'Validated',
        domicileVerified: true,
        subDivision: `${context?.district || 'State'} Administrative Division`,
        eligibleSchemes: [
          'Post-Matric Scholarship Scheme',
          'Tuition Fee Reimbursement Scheme',
          'Hostel Maintenance Allowance',
        ],
      },
    };
  },

  /**
   * Service Submission Connector
   */
  async submitApplication(serviceId: string, citizenId: string): Promise<ApiResponse<{ applicationId: string; status: string }>> {
    const start = Date.now();
    await delay(1200 + Math.random() * 400);
    const latencyMs = Date.now() - start;

    const prefixMap: Record<string, string> = {
      'maha-scholarship': 'MH-SCH',
      'income-certificate': 'MH-INC',
      'student-education-benefit': 'MH-SEB',
      'health-assistance': 'MH-HLT',
      'social-welfare': 'MH-SOC',
    };
    const prefix = prefixMap[serviceId] || 'MH-APP';
    const num = Math.floor(10000 + Math.random() * 90000);

    return {
      success: true,
      requestId: generateRequestId('REQ-SUB'),
      timestamp: now(),
      source: 'FusionGrid Workflow Engine',
      destination: 'Department Sovereign Workflow',
      latencyMs,
      status: 'success',
      data: {
        applicationId: `${prefix}-2026-${num}`,
        status: 'under_verification',
      },
    };
  },
};

export const apiEndpoints = [
  { path: '/api/identity/verify/:citizenId', method: 'GET', department: 'Identity Service', description: 'Verify citizen identity via Aadhaar-linked registry' },
  { path: '/api/revenue/income/:citizenId', method: 'GET', department: 'Revenue Department', description: 'Fetch annual income records from MahaBhulekh' },
  { path: '/api/education/student/:citizenId', method: 'GET', department: 'Education Department', description: 'Retrieve student enrollment and AISHE records' },
  { path: '/api/health/eligibility/:citizenId', method: 'GET', department: 'Health Department', description: 'Check health scheme eligibility, ABHA, and BPL card' },
  { path: '/api/welfare/caste/:citizenId', method: 'GET', department: 'Social Welfare Department', description: 'Validate caste certificate and domicile validity' },
  { path: '/api/workflow/apply', method: 'POST', department: 'FusionGrid Gateway', description: 'Dispatch validated application to destination department workflow' },
  { path: '/api/consent/tokens', method: 'POST', department: 'Consent Manager', description: 'Issue DPDP-compliant cryptographic consent token' },
  { path: '/api/notifications/feed', method: 'GET', department: 'Notification Service', description: 'Real-time state notification dispatch' },
];

export function generateApiCallLogs(count: number): ApiCallLog[] {
  const departments = ['Identity Service', 'Revenue Department', 'Education Department', 'Health Department', 'Social Welfare Department', 'FusionGrid Gateway'];
  const endpoints = ['/api/identity/verify', '/api/revenue/income', '/api/education/student', '/api/health/eligibility', '/api/welfare/caste', '/api/workflow/apply'];
  const statuses: ApiCallStatus[] = ['success', 'success', 'success', 'success', 'success', 'success', 'success', 'success', 'failure', 'timeout'];
  const logs: ApiCallLog[] = [];

  for (let i = 0; i < count; i++) {
    const dept = departments[Math.floor(Math.random() * departments.length)];
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const minutesAgo = Math.floor(Math.random() * 180);
    const timestamp = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
    logs.push({
      id: `log-${i + 1}`,
      requestId: `REQ-MH-2026-${String(Math.floor(Math.random() * 900000 + 100000))}`,
      source: 'FusionGrid',
      destination: dept,
      endpoint,
      method: endpoint.includes('apply') ? 'POST' : 'GET',
      timestamp,
      latency: Math.floor(65 + Math.random() * 240),
      status,
      department: dept,
    });
  }
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
