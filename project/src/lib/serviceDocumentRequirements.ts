import type { DocumentType } from '@/types';

export interface ServiceDocumentRequirement {
  type: DocumentType;
  label: string;
  description: string;
  isMandatory: boolean;
  canReuse: boolean;
  validityRule: string;
  sourceAuthority: string;
}

export interface ServiceConsentRequirement {
  id: string;
  department: string;
  targetDepartment: string;
  dataScope: string;
  purpose: string;
  legalBasis: string;
}

export interface ServiceConfig {
  serviceId: string;
  serviceName: string;
  department: string;
  description: string;
  processingTime: string;
  checklist: ServiceDocumentRequirement[];
  consents: ServiceConsentRequirement[];
}

export const SERVICE_DOCUMENT_CONFIGS: Record<string, ServiceConfig> = {
  'maha-scholarship': {
    serviceId: 'maha-scholarship',
    serviceName: 'MahaScholarship (Professional & Higher Education)',
    department: 'Department of Higher Education',
    description: 'Financial scholarship for eligible Maharashtra students in professional and degree programs.',
    processingTime: '15-20 working days',
    checklist: [
      {
        type: 'identity_proof',
        label: 'Aadhaar / Identity Proof',
        description: 'UIDAI-linked Aadhaar card or sovereign digital identity',
        isMandatory: true,
        canReuse: true,
        validityRule: 'Permanent valid identification',
        sourceAuthority: 'Unique Identification Authority of India (UIDAI)',
      },
      {
        type: 'domicile_certificate',
        label: 'Maharashtra Domicile Certificate',
        description: 'Official proof of Maharashtra residency issued by Revenue Authority',
        isMandatory: true,
        canReuse: true,
        validityRule: 'Permanent residence proof',
        sourceAuthority: 'Revenue & Forest Department',
      },
      {
        type: 'income_certificate',
        label: 'Tahsildar Income Certificate',
        description: 'Annual family income declaration (Must not exceed ₹8.00 Lakhs)',
        isMandatory: true,
        canReuse: true,
        validityRule: 'Must be certified for Current Financial Year (FY 2025-26)',
        sourceAuthority: 'Sub-Divisional Revenue Office (Tahsildar)',
      },
      {
        type: 'student_certificate',
        label: 'College Bonafide & Enrollment Certificate',
        description: 'Current academic year enrollment certificate with college seal & fee receipt',
        isMandatory: true,
        canReuse: false,
        validityRule: 'Current Academic Year 2025-26',
        sourceAuthority: 'Approved University / College Registrar',
      },
      {
        type: 'caste_certificate',
        label: 'Caste / Category Certificate (If Applicable)',
        description: 'Caste certificate with validity number for affirmative action quotas',
        isMandatory: false,
        canReuse: true,
        validityRule: 'Permanent Caste Validity Certificate',
        sourceAuthority: 'District Caste Scrutiny Committee',
      },
      {
        type: 'bank_proof',
        label: 'Aadhaar-Seeded Bank Passbook',
        description: 'Bank passbook copy or NPCI mandate showing DBT-enabled savings account',
        isMandatory: true,
        canReuse: true,
        validityRule: 'Active NPCI-linked bank account',
        sourceAuthority: 'Public Sector / Scheduled Commercial Bank',
      },
    ],
    consents: [
      {
        id: 'c-rev-maha',
        department: 'Revenue Department',
        targetDepartment: 'Department of Higher Education',
        dataScope: 'Annual Family Income & Certificate Validity',
        purpose: 'Verify that applicant family income is below ₹8.00 Lakhs threshold for MahaScholarship eligibility',
        legalBasis: 'Maharashtra Scholarship Rules 2018 (GR No. EWS-2018/CR-44)',
      },
      {
        id: 'c-edu-maha',
        department: 'Education Department',
        targetDepartment: 'Department of Higher Education',
        dataScope: 'Bonafide Student Enrollment & ABC Account Status',
        purpose: 'Verify active course admission and minimum 75% attendance record',
        legalBasis: 'National Education Policy & AISHE Standards Framework',
      },
      {
        id: 'c-id-maha',
        department: 'Identity Service',
        targetDepartment: 'Department of Higher Education',
        dataScope: 'Aadhaar Demographic Token (Name, DOB, Gender)',
        purpose: 'Deduplicate scholarship applicants and prevent multi-disbursement fraud',
        legalBasis: 'Aadhaar Act 2016 (Targeted Delivery of Financial Subsidies) Sec 7',
      },
    ],
  },

  'income-certificate': {
    serviceId: 'income-certificate',
    serviceName: 'Annual Family Income Certificate',
    department: 'Revenue and Forest Department',
    description: 'Official revenue certificate validating annual family income for welfare, fee concessions, and state schemes.',
    processingTime: '7-10 working days',
    checklist: [
      {
        type: 'identity_proof',
        label: 'Aadhaar / Voter ID Proof',
        description: 'Official sovereign identity token of family head or applicant',
        isMandatory: true,
        canReuse: true,
        validityRule: 'Permanent valid identification',
        sourceAuthority: 'UIDAI / Election Commission of India',
      },
      {
        type: 'ration_card',
        label: 'Ration Card / Residential Address Proof',
        description: 'Valid Ration Card (Yellow, Orange, or White) showing family members count',
        isMandatory: true,
        canReuse: true,
        validityRule: 'Active Food & Civil Supplies registration',
        sourceAuthority: 'Food, Civil Supplies and Consumer Protection Dept',
      },
      {
        type: 'salary_slip',
        label: 'Salary Slips / Income Proof / Form 16',
        description: 'Employer salary slips (last 3 months) or self-declared income affidavit on stamp paper',
        isMandatory: true,
        canReuse: false,
        validityRule: 'Issued within past 90 days',
        sourceAuthority: 'Employer / Notary Public',
      },
      {
        type: 'land_record',
        label: '7/12 Extract or Talathi Inspection Report',
        description: 'Agricultural land revenue record or municipal ward talathi income report',
        isMandatory: true,
        canReuse: false,
        validityRule: 'Current revenue year assessment',
        sourceAuthority: 'MahaBhulekh Land Records / Ward Talathi',
      },
    ],
    consents: [
      {
        id: 'c-id-inc',
        department: 'Identity Service',
        targetDepartment: 'Revenue and Forest Department',
        dataScope: 'Aadhaar Demographic Verification & Family Linkage',
        purpose: 'Authenticate identity and legal residential address for municipal jurisdictional assignment',
        legalBasis: 'Maharashtra Right to Public Services Act 2015',
      },
      {
        id: 'c-rev-inc',
        department: 'Revenue Department',
        targetDepartment: 'Sub-Divisional Revenue Office',
        dataScope: 'MahaBhulekh 7/12 Land Holdings & Crop Returns',
        purpose: 'Corroborate agricultural revenue and land tenure holding status',
        legalBasis: 'Maharashtra Land Revenue Code 1966 Sec 42',
      },
    ],
  },

  'student-education-benefit': {
    serviceId: 'student-education-benefit',
    serviceName: 'Student Direct Education Benefit Transfer',
    department: 'School Education and Sports Department',
    description: 'Direct benefit transfer for educational materials, textbooks, uniforms, and digital devices.',
    processingTime: '10-15 working days',
    checklist: [
      {
        type: 'identity_proof',
        label: 'Student Aadhaar Card',
        description: 'Aadhaar card of student with biometric update status',
        isMandatory: true,
        canReuse: true,
        validityRule: 'Permanent valid identification',
        sourceAuthority: 'UIDAI',
      },
      {
        type: 'student_certificate',
        label: 'School Enrollment Certificate with UDISE+ Code',
        description: 'Headmaster / Principal bonafide certificate with official school UDISE+ registration',
        isMandatory: true,
        canReuse: false,
        validityRule: 'Academic Year 2025-26',
        sourceAuthority: 'State Board / CBSE Recognized School',
      },
      {
        type: 'previous_marksheet',
        label: 'Previous Academic Year Marksheet',
        description: 'Grade report or marksheet showing successful pass percentage (min 50%)',
        isMandatory: true,
        canReuse: false,
        validityRule: 'Immediate preceding academic year',
        sourceAuthority: 'Maharashtra State Board of Secondary & Higher Secondary Education',
      },
      {
        type: 'bank_proof',
        label: 'Student / Joint Bank Passbook',
        description: 'Passbook copy with bank account number and IFSC code for direct DBT credit',
        isMandatory: true,
        canReuse: true,
        validityRule: 'Active bank account',
        sourceAuthority: 'Nationalized Bank / Post Office Savings Bank',
      },
    ],
    consents: [
      {
        id: 'c-edu-stuben',
        department: 'Education Department',
        targetDepartment: 'School Education and Sports Department',
        dataScope: 'UDISE+ Enrollment Verification & Attendance Ledger',
        purpose: 'Confirm active student enrollment status and prevent ghost beneficiary fraud',
        legalBasis: 'Samagra Shiksha Abhiyan DBT Guidelines',
      },
      {
        id: 'c-id-stuben',
        department: 'Identity Service',
        targetDepartment: 'School Education and Sports Department',
        dataScope: 'Aadhaar e-KYC & Parent/Guardian Validation',
        purpose: 'Authenticate student identity and guardian linkage for minor accounts',
        legalBasis: 'Direct Benefit Transfer Central Scheme Governance 2017',
      },
    ],
  },

  'health-assistance': {
    serviceId: 'health-assistance',
    serviceName: 'State Health Assistance & Medical Grant Scheme',
    department: 'Public Health Department',
    description: 'Financial assistance grant for critical and life-threatening medical treatments under Mahatma Jyotirao Phule Jan Arogya Yojana.',
    processingTime: '5-7 working days (Priority)',
    checklist: [
      {
        type: 'identity_proof',
        label: 'Patient Aadhaar Card',
        description: 'Patient Aadhaar identification card or sovereign ABHA Health ID',
        isMandatory: true,
        canReuse: true,
        validityRule: 'Permanent valid identification',
        sourceAuthority: 'UIDAI / National Health Authority',
      },
      {
        type: 'ration_card',
        label: 'BPL / Antyodaya / Priority Ration Card',
        description: 'Yellow or Orange ration card establishing Below Poverty Line or economic eligibility',
        isMandatory: true,
        canReuse: true,
        validityRule: 'Active ration card registration',
        sourceAuthority: 'Civil Supplies Department',
      },
      {
        type: 'medical_estimate',
        label: 'Hospital Medical Estimate & Diagnosis Letter',
        description: 'Official treatment estimation letter on hospital letterhead signed by Medical Superintendent',
        isMandatory: true,
        canReuse: false,
        validityRule: 'Issued within the last 30 days by Empanelled Hospital',
        sourceAuthority: 'Empanelled Government / Network Hospital',
      },
      {
        type: 'income_certificate',
        label: 'Tahsildar Income Certificate (< ₹1.8L/yr)',
        description: 'Certified family income certificate establishing eligibility for full state subsidy',
        isMandatory: true,
        canReuse: true,
        validityRule: 'Certified for Current Financial Year',
        sourceAuthority: 'Revenue Department (Tahsildar)',
      },
    ],
    consents: [
      {
        id: 'c-hlt-health',
        department: 'Health Department',
        targetDepartment: 'Public Health Department',
        dataScope: 'ABHA Health Registry & Empanelled Hospital Bed Allocation',
        purpose: 'Verify empanelled hospital treatment legitimacy and clinical emergency tier',
        legalBasis: 'Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY) Health Ordinance',
      },
      {
        id: 'c-rev-health',
        department: 'Revenue Department',
        targetDepartment: 'Public Health Department',
        dataScope: 'BPL Ration Card Verification & Tahsildar Income Record',
        purpose: 'Verify subsidized health coverage eligibility under state poverty threshold',
        legalBasis: 'State Disaster & Public Healthcare Relief Code',
      },
    ],
  },

  'social-welfare': {
    serviceId: 'social-welfare',
    serviceName: 'Comprehensive Social Welfare & Special Assistance Scheme',
    department: 'Social Justice and Special Assistance Department',
    description: 'Integrated welfare support, educational allowances, and livelihood grants for marginalized communities across Maharashtra.',
    processingTime: '20-30 working days',
    checklist: [
      {
        type: 'identity_proof',
        label: 'Aadhaar / Sovereign Identity Proof',
        description: 'Aadhaar card or voter identity card',
        isMandatory: true,
        canReuse: true,
        validityRule: 'Permanent valid identification',
        sourceAuthority: 'UIDAI',
      },
      {
        type: 'caste_certificate',
        label: 'Caste Certificate & Caste Validity Number',
        description: 'Recognized caste certificate issued by Sub-Divisional Officer along with Scrutiny Committee validity',
        isMandatory: true,
        canReuse: true,
        validityRule: 'Permanent statutory caste certificate',
        sourceAuthority: 'Divisional Caste Scrutiny Committee, Maharashtra',
      },
      {
        type: 'domicile_certificate',
        label: 'Maharashtra Domicile Certificate',
        description: 'Proof that applicant has resided in Maharashtra for min. 15 years',
        isMandatory: true,
        canReuse: true,
        validityRule: 'Permanent residency proof',
        sourceAuthority: 'Revenue Department',
      },
      {
        type: 'income_certificate',
        label: 'Annual Family Income Certificate',
        description: 'Income proof verifying family earnings do not exceed statutory scheme cap',
        isMandatory: true,
        canReuse: true,
        validityRule: 'Valid for FY 2025-26',
        sourceAuthority: 'Tahsildar / Sub-Divisional Magistrate',
      },
      {
        type: 'welfare_proof',
        label: 'Scheme-Specific Attestation (Disability / Senior / Widow)',
        description: 'Disability certificate (min 40% UDID), age proof for Senior Assistance, or deceased spouse certificate',
        isMandatory: true,
        canReuse: false,
        validityRule: 'Civil Surgeon Certificate / Statutory Record',
        sourceAuthority: 'District Civil Surgeon / Municipal Corporation',
      },
    ],
    consents: [
      {
        id: 'c-soc-welfare',
        department: 'Social Welfare Department',
        targetDepartment: 'Social Justice and Special Assistance Department',
        dataScope: 'Caste Scrutiny Registry & Social Justice Benefit Ledger',
        purpose: 'Verify caste certificate authenticity and prevent duplicate scheme claims across state divisions',
        legalBasis: 'Maharashtra Scheduled Castes/Tribes Verification of Caste Act 2000',
      },
      {
        id: 'c-rev-welfare',
        department: 'Revenue Department',
        targetDepartment: 'Social Justice and Special Assistance Department',
        dataScope: 'Domicile Status & Tahsildar Income Verification',
        purpose: 'Confirm 15-year state domicile and economic need threshold',
        legalBasis: 'Sanjay Gandhi Niradhar Anudan Yojana Guidelines 2021',
      },
    ],
  },
};

/**
 * Returns the document checklist for a given service ID.
 */
export function getServiceChecklist(serviceId: string): ServiceDocumentRequirement[] {
  return SERVICE_DOCUMENT_CONFIGS[serviceId]?.checklist ?? SERVICE_DOCUMENT_CONFIGS['maha-scholarship'].checklist;
}

/**
 * Returns the consent requirements for a given service ID.
 */
export function getServiceConsents(serviceId: string): ServiceConsentRequirement[] {
  return SERVICE_DOCUMENT_CONFIGS[serviceId]?.consents ?? SERVICE_DOCUMENT_CONFIGS['maha-scholarship'].consents;
}

/**
 * Checks which services can accept a specific document type from the vault.
 */
export function getServicesForDocumentType(docType: DocumentType): string[] {
  const eligibleServices: string[] = [];
  for (const [srvId, config] of Object.entries(SERVICE_DOCUMENT_CONFIGS)) {
    const match = config.checklist.find((req) => req.type === docType && req.canReuse);
    if (match) {
      eligibleServices.push(config.serviceName);
    }
  }
  return eligibleServices;
}
