import type { ApiCallLog, ApiCallStatus } from '@/types';

export interface ApiResponse<T = unknown> {
  success: boolean;
  requestId: string;
  timestamp: string;
  source: string;
  destination: string;
  data: T;
  error?: string;
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
}

export interface IncomeData {
  citizenId: string;
  fullName: string;
  annualIncome: number;
  incomeSource: string;
  financialYear: string;
  panNumber: string;
}

export interface StudentData {
  citizenId: string;
  studentName: string;
  institution: string;
  course: string;
  enrollmentStatus: string;
  academicYear: string;
}

export interface HealthEligibilityData {
  citizenId: string;
  fullName: string;
  bplStatus: boolean;
  healthSchemeEligible: boolean;
  familyIncome: number;
  category: string;
}

export const mockApiGateway = {
  async verifyIdentity(citizenId: string): Promise<ApiResponse<IdentityData>> {
    await delay(800 + Math.random() * 400);
    return {
      success: true,
      requestId: generateRequestId('REQ-ID'),
      timestamp: now(),
      source: 'Identity Service',
      destination: 'FusionGrid',
      data: {
        citizenId,
        fullName: 'Verified Citizen',
        dateOfBirth: '',
        gender: '—',
        aadhaarVerified: true,
        mobileVerified: true,
      },
    };
  },

  async getIncome(citizenId: string): Promise<ApiResponse<IncomeData>> {
    await delay(1200 + Math.random() * 500);
    return {
      success: true,
      requestId: generateRequestId('REQ-REV'),
      timestamp: now(),
      source: 'Revenue Department',
      destination: 'FusionGrid',
      data: {
        citizenId,
        fullName: 'Verified Citizen',
        annualIncome: 420000,
        incomeSource: 'Salary',
        financialYear: '2025-26',
        panNumber: '—',
      },
    };
  },

  async getStudentRecord(citizenId: string): Promise<ApiResponse<StudentData>> {
    await delay(900 + Math.random() * 300);
    return {
      success: true,
      requestId: generateRequestId('REQ-EDU'),
      timestamp: now(),
      source: 'Education Department',
      destination: 'FusionGrid',
      data: {
        citizenId,
        studentName: 'Verified Citizen',
        institution: '—',
        course: '—',
        enrollmentStatus: 'Active',
        academicYear: '2025-26',
      },
    };
  },

  async getHealthEligibility(citizenId: string): Promise<ApiResponse<HealthEligibilityData>> {
    await delay(700 + Math.random() * 300);
    return {
      success: true,
      requestId: generateRequestId('REQ-HLT'),
      timestamp: now(),
      source: 'Health Department',
      destination: 'FusionGrid',
      data: {
        citizenId,
        fullName: 'Verified Citizen',
        bplStatus: false,
        healthSchemeEligible: true,
        familyIncome: 420000,
        category: 'EWS',
      },
    };
  },

  async submitScholarship(citizenId: string): Promise<ApiResponse<{ applicationId: string; status: string }>> {
    await delay(1500 + Math.random() * 500);
    return {
      success: true,
      requestId: generateRequestId('REQ-SCH'),
      timestamp: now(),
      source: 'FusionGrid',
      destination: 'Scholarship Workflow',
      data: {
        applicationId: `MH-SCH-2026-${Math.floor(Math.random() * 90000 + 10000)}`,
        status: 'under_verification',
      },
    };
  },

  async getApplication(applicationId: string): Promise<ApiResponse<{ id: string; status: string }>> {
    await delay(500 + Math.random() * 200);
    return {
      success: true,
      requestId: generateRequestId('REQ-APP'),
      timestamp: now(),
      source: 'FusionGrid Database',
      destination: 'FusionGrid',
      data: { id: applicationId, status: 'under_verification' },
    };
  },

  async submitConsent(citizenId: string, department: string): Promise<ApiResponse<{ consentId: string; status: string }>> {
    await delay(600 + Math.random() * 200);
    return {
      success: true,
      requestId: generateRequestId('REQ-CON'),
      timestamp: now(),
      source: 'Consent Manager',
      destination: 'FusionGrid',
      data: {
        consentId: `CON-${Date.now()}`,
        status: 'granted',
      },
    };
  },

  async getNotifications(): Promise<ApiResponse<{ count: number }>> {
    await delay(300 + Math.random() * 100);
    return {
      success: true,
      requestId: generateRequestId('REQ-NOT'),
      timestamp: now(),
      source: 'Notification Service',
      destination: 'FusionGrid',
      data: { count: 5 },
    };
  },
};

export const apiEndpoints = [
  { path: '/api/identity/verify/:citizenId', method: 'GET', department: 'Identity Service', description: 'Verify citizen identity via Aadhaar-linked registry' },
  { path: '/api/revenue/income/:citizenId', method: 'GET', department: 'Revenue Department', description: 'Fetch annual income records from revenue database' },
  { path: '/api/education/student/:citizenId', method: 'GET', department: 'Education Department', description: 'Retrieve student enrollment and academic records' },
  { path: '/api/health/eligibility/:citizenId', method: 'GET', department: 'Health Department', description: 'Check health scheme eligibility and BPL status' },
  { path: '/api/scholarship/apply', method: 'POST', department: 'Scholarship Workflow', description: 'Submit scholarship application to workflow engine' },
  { path: '/api/applications/:id', method: 'GET', department: 'FusionGrid', description: 'Retrieve application status and details by ID' },
  { path: '/api/consent', method: 'POST', department: 'Consent Manager', description: 'Record citizen consent for data sharing' },
  { path: '/api/notifications', method: 'GET', department: 'Notification Service', description: 'Fetch citizen notification feed' },
];

export function generateApiCallLogs(count: number): ApiCallLog[] {
  const departments = ['Identity Service', 'Revenue Department', 'Education Department', 'Health Department', 'Social Welfare', 'FusionGrid', 'Consent Manager'];
  const endpoints = ['/api/identity/verify', '/api/revenue/income', '/api/education/student', '/api/health/eligibility', '/api/scholarship/apply', '/api/applications', '/api/consent', '/api/notifications'];
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
      method: endpoint.includes('apply') || endpoint.includes('consent') ? 'POST' : 'GET',
      timestamp,
      latency: Math.floor(80 + Math.random() * 300),
      status,
      department: dept,
    });
  }
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
