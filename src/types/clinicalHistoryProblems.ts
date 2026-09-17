// =============================================================
// AXIS 3 & AXIS 4 CLINICAL DOMAIN TYPES
// Strictly separating Longitudinal Patient Records from Encounter Documentation
// Supporting Configured Assessment Profiles, Flexible HPI Templates,
// De-duplicated PMHx-ProblemList Linkage, and Configurable Diagnosis Roles/Statuses
// =============================================================

// -------------------------------------------------------------
// AXIS 3: HISTORY & ASSESSMENTS TYPES
// -------------------------------------------------------------

export interface ChiefComplaintEncounter {
  complaintAr: string;
  complaintEn: string;
  onset: string;
  duration: string;
  severityGrade: 'mild' | 'moderate' | 'severe' | 'unbearable';
  triggerContext?: string;
  associatedSymptoms: string[];
  recordedBy: string;
  recordedByRole: string;
  recordedAt: string;
}

// Configurable HPI Documentation Templates
export type HpiDocumentationTemplateId =
  | 'general_narrative'
  | 'pain_opqrst'
  | 'socrates'
  | 'specialty_dyspnea_cardiac'
  | 'free_structured';

export interface HpiTemplateOption {
  id: HpiDocumentationTemplateId;
  labelAr: string;
  labelEn: string;
  description: string;
}

export interface HistoryOfPresentIllness {
  activeTemplateId: HpiDocumentationTemplateId;
  narrativeText: string;
  onsetTimeline?: string;
  anatomicalLocation?: string;
  painQuality?: string;
  radiationPattern?: string;
  aggravatingFactors?: string[];
  relievingFactors?: string[];
  associatedSymptomsSummary?: string;
  // OPQRST template elements
  opqrst?: {
    onset: string;
    provocation: string;
    quality: string;
    radiation: string;
    severity: string;
    timing: string;
  };
  // SOCRATES template elements
  socrates?: {
    site: string;
    onset: string;
    character: string;
    radiation: string;
    associations: string;
    timeCourse: string;
    exacerbatingRelieving: string;
    severity: string;
  };
  // Specialty focused template elements (e.g. Dyspnea/Cardiac)
  specialtyFocus?: {
    nyhaClass?: string;
    orthopneaPnd?: string;
    edemaStatus?: string;
    syncopePalpitation?: string;
  };
}

export interface PastMedicalHistoryItem {
  id: string;
  conditionNameAr: string;
  conditionNameEn: string;
  onsetYear: string;
  status: 'active' | 'inactive' | 'resolved';
  controlLevel?: 'well_controlled' | 'poorly_controlled' | 'under_treatment';
  treatingPhysicianOrFacility?: string;
  clinicalNotes?: string;
  recordedAt: string;
  recordedBy: string;
  isLongitudinal: true;
  // Problem List Linkage to avoid duplicate clinical records:
  linkedProblemId?: string; // References Longitudinal Problem List Item
  isLinkedToProblemList?: boolean;
}

export interface PastSurgicalHistoryItem {
  id: string;
  procedureNameAr: string;
  procedureNameEn: string;
  yearOrDate: string;
  hospitalFacility: string;
  surgeonName?: string;
  implantOrProsthesis?: string;
  complications?: string;
  recordedAt: string;
  isLongitudinal: true;
}

export interface FamilyHistoryItem {
  id: string;
  relationship: 'father' | 'mother' | 'brother' | 'sister' | 'son' | 'daughter' | 'paternal_family' | 'maternal_family';
  relationshipAr: string;
  conditionNameAr: string;
  conditionNameEn: string;
  ageAtOnset?: string;
  deceasedStatus: 'alive' | 'deceased' | 'unknown';
  clinicalRelevance: 'high_genetic_risk' | 'moderate_familial' | 'informational';
  notes?: string;
  isLongitudinal: true;
}

export interface SocialHistoryRecord {
  smokingStatus: 'never_smoker' | 'former_smoker' | 'current_smoker';
  smokingDetails?: string; // e.g., "1.5 packs/day for 25 years (37.5 pack-years), quit 2 months ago"
  alcoholStatus: 'non_drinker' | 'social_drinker' | 'regular_intake' | 'history_of_abuse';
  substanceUse: 'negative' | 'reported';
  substanceDetails?: string;
  occupation: string;
  occupationalHazards?: string;
  livingArrangement: string;
  caregiverSupport: 'independent' | 'family_supported' | 'institutional';
  physicalActivityLevel: 'sedentary' | 'light' | 'moderate' | 'regular_exercise';
  isLongitudinal: true;
}

export interface DetailedAllergyRecord {
  id: string;
  substanceNameAr: string;
  substanceNameEn: string;
  category: 'medication' | 'food' | 'environmental' | 'radiocontrast_agent' | 'latex';
  reactionManifestationAr: string;
  reactionManifestationEn: string;
  // 4 Separately Represented Dimensions:
  criticality?: 'low' | 'moderate' | 'high' | 'unable_to_assess';
  severity: 'mild' | 'moderate' | 'severe_anaphylaxis';
  clinicalStatus?: 'active' | 'inactive' | 'resolved';
  verificationStatus: 'confirmed' | 'suspected' | 'patient_reported' | 'refuted';
  identifiedDate?: string;
  recordedBy: string;
  isLongitudinal: true;
}

// -------------------------------------------------------------
// CONFIGURABLE ASSESSMENT PROFILES ABSTRACTION
// ESI, MUST, Katz ADL, Killip, TIMI, and ASA are profile examples, not hardcoded global fixtures
// -------------------------------------------------------------

export type AssessmentProfileType =
  | 'triage_profile'
  | 'nutrition_screening_profile'
  | 'functional_assessment_profile'
  | 'specialty_risk_profile'
  | 'perioperative_assessment_profile';

export interface ConfigurableAssessmentProfileMeta {
  profileId: string;
  profileType: AssessmentProfileType;
  profileNameAr: string;
  profileNameEn: string;
  applicableContexts: ClinicalContextMode[];
  isMandatoryInContext: boolean;
  exampleClinicalToolMock: string;
  governanceAttributionNotice: string;
}

export interface FunctionalAssessmentRecord {
  assessmentDate: string;
  assessedBy: string;
  assessedByRole: string;
  profileName: string; // e.g. "Functional Assessment Profile (Mock Example: Katz ADL Index)"
  katzAdlIndex: {
    bathing: 0 | 1;      // 1 = Independent, 0 = Dependent
    dressing: 0 | 1;
    toileting: 0 | 1;
    transferring: 0 | 1;
    continence: 0 | 1;
    feeding: 0 | 1;
  };
  totalKatzScore: number; // 0 to 6 (6 = Fully independent)
  mobilityLevel: 'independent' | 'minimal_assistance' | 'wheelchair_bound' | 'bedridden';
  assistiveDevices: string[];
  fallRiskScoreMorse?: number;
  fallRiskCategory?: 'low' | 'moderate' | 'high';
}

export interface NutritionalAssessmentRecord {
  assessmentDate: string;
  assessedBy: string;
  profileName: string; // e.g. "Nutrition Screening Profile (Mock Example: MUST)"
  screeningToolName: string;
  bmiScore: number;
  unplannedWeightLossPercent: string;
  acuteDiseaseEffect: boolean;
  overallRiskCategory: 'low_risk' | 'medium_risk' | 'high_risk';
  recommendedDiet: string;
  dietaryRestrictions: string[];
  enteralParenteralSupport?: string;
}

export type ClinicalContextMode = 'opd' | 'er' | 'icu' | 'wards' | 'or';

export interface ReviewOfSystemsItem {
  systemKey: string;
  systemNameAr: string;
  systemNameEn: string;
  reviewed: boolean;
  status: 'normal_negative' | 'positive_pertinent' | 'not_assessed';
  pertinentFindings?: string;
}

export interface PhysicalExamSystemItem {
  systemKey: string;
  systemNameAr: string;
  systemNameEn: string;
  examined: boolean;
  status: 'normal' | 'abnormal' | 'deferred';
  findings?: string;
}

export interface SpecialtyContextAssessment {
  context: ClinicalContextMode;
  profileType: AssessmentProfileType;
  profileNameAr: string;
  profileNameEn: string;
  isMandatoryInContext: boolean;
  exampleMockBasis: string;
  scores: {
    labelAr: string;
    labelEn: string;
    value: string | number;
    interpretation: string;
    provenance: string;
  }[];
}

// -------------------------------------------------------------
// AXIS 4: PROBLEMS & DIAGNOSES TYPES
// -------------------------------------------------------------

export interface ProblemListItem {
  id: string;
  clinicalTermAr: string;
  clinicalTermEn: string;
  status: 'active' | 'inactive' | 'resolved';
  clinicalStatus: 'well_controlled' | 'poorly_controlled' | 'in_remission' | 'relapsed' | 'stable';
  verificationStatus: 'confirmed' | 'suspected' | 'provisional';
  onsetDate: string;
  resolvedDate?: string;
  classificationProfile: {
    profileName: string; // e.g. "Mock Configured Classification Profile (ICD-10-AM / WHO ICD-10)"
    code: string;
    display: string;
  };
  clinicalTerminology: {
    system: string;      // e.g. "Configured Clinical Terminology (SNOMED CT Concept Mock)"
    conceptId: string;
    preferredTerm: string;
  };
  provenance: {
    recordedBy: string;
    recordedByRole: string;
    timestamp: string;
    facilityOrClinic: string;
  };
  notes?: string;
  auditTrail: {
    timestamp: string;
    actionAr: string;
    performedBy: string;
    notes?: string;
  }[];
}

// Generic Diagnosis Roles & Uses instead of a rigid binary rule
export type DiagnosisRole =
  | 'principal'
  | 'primary'
  | 'secondary'
  | 'admission'
  | 'discharge'
  | 'complication'
  | 'co_existing'
  | 'other';

export type DiagnosisUse =
  | 'clinical'
  | 'billing'
  | 'coding'
  | 'admission'
  | 'discharge';

export type DiagnosisRank = number | 'primary' | 'secondary' | 'tertiary';

export type DiagnosticVerificationStatus =
  | 'working_provisional'
  | 'differential'
  | 'confirmed_final'
  | 'suspected'
  | 'refuted';

export interface EncounterDiagnosisItem {
  id: string;
  clinicalTermAr: string;
  clinicalTermEn: string;
  // Generic role, use, and rank
  diagnosisRole: DiagnosisRole;
  diagnosisUse?: DiagnosisUse;
  diagnosisRank?: DiagnosisRank;
  // Legacy compatibility
  ranking?: 'principal_primary' | 'secondary_additional';
  // Context-sensitive verification/diagnostic status capability
  diagnosticStage: DiagnosticVerificationStatus;
  encounterRelationship:
    | 'reason_for_admission'
    | 'complication_arose_in_stay'
    | 'co_existing_managed_condition'
    | 'incidental_finding_treated';
  classificationProfile: {
    profileName: string; // "Mock Configured Classification Profile (ICD-10-AM / WHO ICD-10 / Local)"
    code: string;
    display: string;
  };
  clinicalTerminology: {
    system: string;
    conceptId: string;
    preferredTerm: string;
  };
  provenance: {
    diagnosedBy: string;
    diagnosedByRole: string;
    department: string;
    timestamp: string;
  };
  linkedProblemId?: string; // Links back to Longitudinal Problem List if related (avoids duplicate records)
  notes?: string;
}

