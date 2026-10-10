export type Role = 'citizen' | 'officer' | 'admin';

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_verification'
  | 'processing'
  | 'approved'
  | 'rejected'
  | 'info_requested';

export type SlaStatus = 'on_track' | 'due_soon' | 'breached';

export type WorkflowStageStatus = 'done' | 'current' | 'pending' | 'skipped';

export type OfficerAction = 'approve' | 'reject' | 'request_info' | 'forward';

export interface QueueItem {
  id: string;
  applicationId: string;
  citizenName: string;
  citizenId: string;
  service: string;
  stage: string;
  slaStatus: SlaStatus;
  slaRemaining: string;
  submittedAt: string;
  status: ApplicationStatus;
  department: string;
  district: string;
}

export interface WorkflowStage {
  id: string;
  label: string;
  department: string;
  status: WorkflowStageStatus;
  duration: string;
  timestamp?: string;
}

export interface AuditEvent {
  id: string;
  applicationId: string;
  action: string;
  actor: string;
  actorRole: Role;
  detail: string;
  timestamp: string;
  type: 'submit' | 'verify' | 'approve' | 'reject' | 'request_info' | 'forward' | 'consent' | 'access';
}

export interface SlaItem {
  applicationId: string;
  serviceName: string;
  citizenName: string;
  submittedAt: string;
  slaDeadline: string;
  slaStatus: SlaStatus;
  daysRemaining: number;
  totalSlaDays: number;
}

export type ServiceCategory =
  | 'Education'
  | 'Revenue'
  | 'Health'
  | 'Welfare'
  | 'Certificates';

export interface Citizen {
  name: string;
  citizenId: string;
  mobile: string;
  dob: string;
  address: string;
  district: string;
  college: string;
  course: string;
  verified: boolean;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  department: string;
  description: string;
  processingTime: string;
  requirements: string[];
  icon: string;
}

export interface ConsentRecord {
  id: string;
  department: string;
  dataScope: string;
  purpose: string;
  requestedAt: string;
  status: 'granted' | 'denied' | 'revoked';
  applicationId?: string;
}

export interface TimelineStep {
  id: string;
  label: string;
  status: 'done' | 'current' | 'pending' | 'skipped';
  timestamp?: string;
}

export interface DataAccessRecord {
  id: string;
  department: string;
  data: string;
  purpose: string;
  timestamp: string;
  result: string;
}

export interface Application {
  id: string;
  dbId?: string;
  citizenId?: string;
  serviceId: string;
  serviceName: string;
  status: ApplicationStatus;
  progress: number;
  submittedAt: string;
  requestId?: string;
  consents: ConsentRecord[];
  timeline: TimelineStep[];
  dataAccess: DataAccessRecord[];
  departments: string[];
  workflowStages?: WorkflowStage[];
  rejectionReason?: string;
  infoRequestReason?: string;
  officerNotes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'action';
  read: boolean;
  timestamp: string;
  applicationId?: string;
}

export interface VerificationStep {
  id: string;
  label: string;
  detail: string;
  status: 'pending' | 'verifying' | 'done';
}

// ─── Admin / Interoperability Layer ───

export type ConnectorStatus = 'connected' | 'warning' | 'disconnected' | 'maintenance';
export type ConnectorType = 'REST API' | 'Legacy SOAP' | 'CSV/File' | 'Database Adapter';

export interface DepartmentConnector {
  id: string;
  name: string;
  status: ConnectorStatus;
  connectorType: ConnectorType;
  apiCount: number;
  successRate: number;
  uptime: number;
  avgLatency: number;
  lastSync: string;
  endpoints: string[];
  description: string;
}

export type ApiCallStatus = 'success' | 'failure' | 'timeout' | 'pending';

export interface ApiCallLog {
  id: string;
  requestId: string;
  source: string;
  destination: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  timestamp: string;
  latency: number;
  status: ApiCallStatus;
  department: string;
}

export type DataQualityIssueType =
  | 'missing_field'
  | 'invalid_format'
  | 'duplicate'
  | 'conflict'
  | 'outdated';

export interface DataQualityIssue {
  id: string;
  citizenId: string;
  citizenName: string;
  field: string;
  issueType: DataQualityIssueType;
  source: string;
  matchPercentage?: number;
  description: string;
  status: 'open' | 'resolved' | 'reviewing';
  detectedAt: string;
}

export interface SourceRecord {
  source: string;
  fieldName: string;
  fieldValue: string;
  fieldMapping: string;
}

export interface CanonicalRecord {
  citizenId: string;
  fullName: string;
  dateOfBirth: string;
  annualIncome: string;
  gender: string;
  address: string;
  sources: SourceRecord[];
}

export type SystemHealthStatus = 'operational' | 'degraded' | 'down' | 'maintenance';

export interface SystemHealthItem {
  id: string;
  name: string;
  status: SystemHealthStatus;
  uptime: number;
  latency: number;
  errorRate: number;
  lastIncident: string;
  apiCount: number;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: Role;
  action: string;
  data: string;
  purpose: string;
  result: 'success' | 'failure' | 'denied';
}

// ─── Event System ───

export type EventType =
  | 'ApplicationSubmitted'
  | 'IncomeVerified'
  | 'StudentVerified'
  | 'ApplicationApproved'
  | 'ApplicationRejected'
  | 'ConsentGranted'
  | 'ConsentRevoked'
  | 'ApiFailure';

export interface SystemEvent {
  id: string;
  type: EventType;
  timestamp: string;
  applicationId?: string;
  actor: string;
  detail: string;
  department?: string;
}

// ─── API Failure Simulation ───

export type RetryState = 'idle' | 'failed' | 'retry_1' | 'retry_2' | 'queued' | 'auto_retry' | 'recovered';

export interface ApiFailureState {
  department: string;
  isDown: boolean;
  retryState: RetryState;
  requestId?: string;
  endpoint?: string;
  attempts: number;
  message: string;
  citizenMessage: string;
  timestamp: string;
  history: { state: RetryState; message: string; timestamp: string }[];
}

// ─── Security Simulation & Authentication Stages ───

export type AuthStage =
  | 'unauthenticated'
  | 'password_authenticated'
  | 'passkey_enrollment_required'
  | 'biometric_verification_pending'
  | 'passkey_verified'
  | 'fully_authorized';

export interface SecuritySession {
  token: string;
  role: Role;
  issuedAt: string;
  expiresAt: string;
  rateLimitRemaining: number;
  rateLimitTotal: number;
  authStage: AuthStage;
  requiresBiometrics: boolean;
  passkeyVerified: boolean;
  biometricEnrolled: boolean;
}

export interface SecurityCheckResult {
  allowed: boolean;
  reason: string;
  checkType: 'role' | 'consent' | 'rate_limit' | 'session' | 'input_validation';
}

// ─── Document Upload & Verification ───

export type DocumentType =
  | 'identity_proof'
  | 'income_certificate'
  | 'student_certificate'
  | 'bank_proof'
  | 'domicile_certificate'
  | 'caste_certificate'
  | 'salary_slip'
  | 'land_record'
  | 'previous_marksheet'
  | 'medical_estimate'
  | 'ration_card'
  | 'welfare_proof';

export type DocumentStatus = 'pending' | 'verified' | 'rejected';

export interface ApplicationDocument {
  id: string;
  application_id: string;
  citizen_id: string;
  document_type: DocumentType;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  status: DocumentStatus;
  rejection_reason: string | null;
  verified_at: string | null;
  verified_by: string | null;
  reused_from_vault: boolean;
  vault_document_id: string | null;
  consent_given: boolean;
  created_at: string;
  updated_at: string;
}

export interface VaultDocument {
  id: string;
  citizen_id: string;
  document_type: DocumentType;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  status?: DocumentStatus;
  verified_at: string | null;
  verified_by: string | null;
  source_application_id: string | null;
  is_valid: boolean;
  validity_period?: string;
  expiry_date?: string | null;
  created_at: string;
}

export const DOCUMENT_REQUIREMENTS: { type: DocumentType; label: string; description: string }[] = [
  { type: 'identity_proof', label: 'Identity Proof', description: 'Aadhaar card, PAN card, or passport' },
  { type: 'income_certificate', label: 'Income Certificate', description: 'Official income certificate or salary slips' },
  { type: 'domicile_certificate', label: 'Domicile Certificate', description: 'State domicile certificate issued by Revenue Authority' },
  { type: 'caste_certificate', label: 'Caste / Validity Certificate', description: 'Statutory caste certificate with validity number' },
  { type: 'student_certificate', label: 'Student / College Certificate', description: 'Bonafide certificate or admission letter' },
  { type: 'bank_proof', label: 'Bank Account Proof', description: 'Bank passbook copy or NPCI mandate' },
  { type: 'salary_slip', label: 'Salary Slips / Income Proof', description: 'Last 3 months salary slips or employer statement' },
  { type: 'land_record', label: '7/12 Extract / Talathi Report', description: 'MahaBhulekh agricultural land revenue record' },
  { type: 'previous_marksheet', label: 'Previous Academic Marksheet', description: 'Preceding academic year score card or marksheet' },
  { type: 'medical_estimate', label: 'Hospital Treatment Estimate', description: 'Empanelled government or network hospital diagnosis letter' },
  { type: 'ration_card', label: 'Ration Card (BPL / Priority)', description: 'Civil Supplies ration card establishing family eligibility' },
  { type: 'welfare_proof', label: 'Welfare Category Certificate', description: 'Disability UDID, Senior Citizen proof, or Widow affidavit' },
];

export const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
