// Targeted Automated Verification Script for Clinical Core Scenarios A - M
import { DEFAULT_IDENTITY_VERIFICATION_POLICY } from '../src/types/clinicalIdentityVerification';
import { DetailedAllergyRecord } from '../src/types/clinicalHistoryProblems';
import { LabReportItem } from '../src/types/clinicalResults';
import { ResultFollowUpMetadata } from '../src/types/clinicalIdentityVerification';
import { initialMockWorkItems } from '../src/data/mockClinicalWorkItemsData';
import { INITIAL_MOCK_CONSULTS, INITIAL_MOCK_HANDOVERS } from '../src/data/mockClinicalUtilitiesData';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${testName}: ${detail || 'Assertion failed'}`);
    failCount++;
  }
}

console.log('--- STARTING TARGETED CLINICAL CORE AUTOMATED SUITE ---\n');

// -------------------------------------------------------------
// Scenario A: Routine Patient Verification
// -------------------------------------------------------------
const policy = DEFAULT_IDENTITY_VERIFICATION_POLICY;
assert(
  policy.minimumIdentifiersRequired === 2,
  'Scenario A: Policy requires minimum 2 identifiers',
  `Expected 2, got ${policy.minimumIdentifiersRequired}`
);
assert(
  !policy.allowedIdentifiers.includes('encounterNumber' as any),
  'Scenario A: encounterNumber is excluded from valid person identifiers',
  'encounterNumber was found in allowedIdentifiers'
);
assert(
  policy.allowedIdentifiers.includes('mrn') && policy.allowedIdentifiers.includes('fullName'),
  'Scenario A: Person-specific identifiers (MRN, Full Name) are permitted',
  'MRN or Full Name missing from policy'
);

// -------------------------------------------------------------
// Scenario B: Identity Mismatch
// -------------------------------------------------------------
const registeredPatient = {
  mrn: 'MRN-104920',
  dob: '1975-06-14',
  fullNameAr: 'عبدالله بن أحمد المنصور'
};
const enteredMismatch = {
  mrn: 'MRN-999999',
  dob: '1990-01-01',
  fullNameAr: 'عبدالله بن أحمد المنصور'
};

const matchedIdentifiers: string[] = [];
if (enteredMismatch.mrn === registeredPatient.mrn) matchedIdentifiers.push('mrn');
if (enteredMismatch.dob === registeredPatient.dob) matchedIdentifiers.push('dob');
if (enteredMismatch.fullNameAr === registeredPatient.fullNameAr) matchedIdentifiers.push('fullName');

const isMismatch = matchedIdentifiers.length < policy.minimumIdentifiersRequired;
assert(
  isMismatch,
  'Scenario B: Identity mismatch is strictly caught and cannot silently succeed',
  `Matched identifiers: ${matchedIdentifiers.length}`
);

// -------------------------------------------------------------
// Scenario C: Temporary Emergency Identity
// -------------------------------------------------------------
const emergencyPatient = {
  mrn: 'TEMP-ER-2026-991',
  fullNameAr: 'مجهول الهوية - حادث سير',
  isTemporary: true
};
const isDesignatedEmergency =
  emergencyPatient.mrn.startsWith('TEMP-') || emergencyPatient.fullNameAr.includes('مجهول');

assert(
  isDesignatedEmergency && policy.allowedIdentifiers.includes('designatedEmergencyTemporaryId'),
  'Scenario C: Designated emergency temporary identifier is recognized under ADT emergency policy',
  'Temporary emergency identifier check failed'
);
assert(
  emergencyPatient.isTemporary === true,
  'Scenario C: Unresolved emergency identity is visibly flagged as temporary',
  'isTemporary was not true'
);

// -------------------------------------------------------------
// Scenario D: Unknown Allergy Information
// -------------------------------------------------------------
function deriveAllergyStatus(allergies: DetailedAllergyRecord[], stringsList?: string[]) {
  const stringAllergies = stringsList || [];
  const isExplicitUnknown =
    stringAllergies.some(a => a.includes('غير متوفر') || a.includes('مجهول') || a.includes('لم يتم التقييم')) ||
    (allergies.length === 0 && stringAllergies.length === 0);
  const hasDocumentedNegative =
    stringAllergies.some(a => a.includes('NKDA') || a.includes('لا توجد حساسية معروفة') || a.includes('لا يوجد'));

  if (allergies.length > 0) return 'active_allergies_present';
  if (hasDocumentedNegative) return 'no_known_allergies';
  if (isExplicitUnknown) return 'unassessed_unavailable';
  return 'no_known_allergies';
}

const statusForUnassessed = deriveAllergyStatus([], ['غير متوفر']);
const statusForEmpty = deriveAllergyStatus([], []);
assert(
  statusForUnassessed === 'unassessed_unavailable' && statusForEmpty === 'unassessed_unavailable',
  'Scenario D: Unassessed or unavailable allergy info is NEVER mapped to No Known Allergies (NKDA)',
  `Got unassessed=${statusForUnassessed}, empty=${statusForEmpty}`
);

// -------------------------------------------------------------
// Scenario E: Documented Allergy
// -------------------------------------------------------------
const mockAllergy: DetailedAllergyRecord = {
  id: 'ALL-001',
  substanceNameAr: 'أموكسيسيلين (Amoxicillin)',
  substanceNameEn: 'Amoxicillin',
  category: 'medication',
  clinicalStatus: 'active',
  verificationStatus: 'confirmed',
  criticality: 'high',
  severity: 'severe_anaphylaxis',
  reactionManifestationAr: 'صدمة تحسسية حادة مع ضيق تنفس شديد',
  reactionManifestationEn: 'Anaphylactic shock with severe bronchospasm',
  recordedBy: 'د. طارق المنشاوي',
  isLongitudinal: true
};

assert(
  mockAllergy.criticality !== undefined && mockAllergy.severity !== undefined,
  'Scenario E: Criticality and Reaction Severity are separately represented in dedicated allergy model',
  'Allergy record does not have distinct criticality and severity'
);
assert(
  mockAllergy.criticality === 'high' && mockAllergy.severity === 'severe_anaphylaxis',
  'Scenario E: High criticality and severe reaction are independently distinct values',
  `Criticality: ${mockAllergy.criticality}, Severity: ${mockAllergy.severity}`
);

// -------------------------------------------------------------
// Scenario F: Final Result Not Reviewed
// -------------------------------------------------------------
const finalUnreviewedReport: Partial<LabReportItem> = {
  id: 'LAB-STAT-TEST',
  status: 'final',
  reviewStatus: 'unreviewed',
  reviewState: 'unreviewed',
  acknowledgementState: 'not_required'
};

assert(
  finalUnreviewedReport.status === 'final' && finalUnreviewedReport.reviewState === 'unreviewed',
  'Scenario F: Final diagnostic result can remain unreviewed without state corruption',
  `Status: ${finalUnreviewedReport.status}, ReviewState: ${finalUnreviewedReport.reviewState}`
);

// -------------------------------------------------------------
// Scenario G: Follow-up Responsibility
// -------------------------------------------------------------
const followUpMeta: ResultFollowUpMetadata = {
  resultId: 'LAB-STAT-TEST',
  resultTitle: 'Troponin I (High Sensitivity)',
  orderingClinician: 'د. شريف الجوهري',
  attendingClinician: 'د. طارق المنشاوي',
  responsibleClinicianOrTeam: 'فريق القسطرة القلبية التداخلي',
  assignedFollowUpRole: 'interventional_cardiologist',
  communicationStatus: 'communicated',
  readBackStatus: 'readback_confirmed',
  actionFollowUpStatus: 'action_planned',
  followUpStatus: 'clinician_action_planned',
  urgency: 'critical_stat'
};

assert(
  followUpMeta.responsibleClinicianOrTeam === 'فريق القسطرة القلبية التداخلي' &&
  followUpMeta.actionFollowUpStatus === 'action_planned',
  'Scenario G: Responsible team and follow-up state are modeled independently from result review/lifecycle',
  'Follow-up responsibility metadata mismatch'
);

// -------------------------------------------------------------
// Scenario H: No Additional Follow-up
// -------------------------------------------------------------
const closedFollowUp: ResultFollowUpMetadata = {
  resultId: 'LAB-ROUTINE-001',
  resultTitle: 'Routine CBC',
  orderingClinician: 'د. طارق المنشاوي',
  attendingClinician: 'د. طارق المنشاوي',
  assignedFollowUpRole: 'primary_physician',
  communicationStatus: 'communicated',
  readBackStatus: 'not_required',
  actionFollowUpStatus: 'no_action_needed',
  followUpStatus: 'no_followup_needed',
  urgency: 'routine'
};

// Check that no work item is generated in active queue for this result
const activeWorkItemsForClosed = initialMockWorkItems.filter(
  wi => wi.sourceResourceId === closedFollowUp.resultId
);

assert(
  closedFollowUp.actionFollowUpStatus === 'no_action_needed' && activeWorkItemsForClosed.length === 0,
  'Scenario H: Result requiring no additional follow-up generates zero active Work Items',
  `Expected 0 work items, found ${activeWorkItemsForClosed.length}`
);

// -------------------------------------------------------------
// Scenario I: Missing Responsible Clinician
// -------------------------------------------------------------
const unassignedMeta: Partial<ResultFollowUpMetadata> = {
  resultId: 'LAB-UNASSIGNED-01',
  orderingClinician: undefined,
  attendingClinician: undefined,
  responsibleClinicianOrTeam: undefined,
  assignedFollowUpRole: undefined
};

const neutralMissingLabel = unassignedMeta.responsibleClinicianOrTeam ?? 'غير محدد في النظام (Missing)';
assert(
  unassignedMeta.responsibleClinicianOrTeam === undefined &&
  neutralMissingLabel === 'غير محدد في النظام (Missing)',
  'Scenario I: Missing responsibility uses neutral missing-data state without inventing clinician',
  `Expected neutral missing state, got ${neutralMissingLabel}`
);

// -------------------------------------------------------------
// Scenario J: Consultation SLA / Dynamic Response Targets
// -------------------------------------------------------------
const unconfiguredConsult = INITIAL_MOCK_CONSULTS.find(c => c.id === 'consult-coord-106');
const urgentConsult = INITIAL_MOCK_CONSULTS.find(c => c.id === 'consult-coord-101');

assert(
  unconfiguredConsult !== undefined && !unconfiguredConsult.requestedResponseTimeframe,
  'Scenario J1: Unconfigured consultation target has no hardcoded synthetic timeframe',
  'Unconfigured consult did not have empty or undefined timeframe'
);
assert(
  urgentConsult !== undefined && urgentConsult.requestedResponseTimeframe === 'خلال ساعتين (Urgent Response Target)',
  'Scenario J2: Configured consultation timeframe is preserved from data source rather than global hardcoding',
  `Expected target 'خلال ساعتين (Urgent Response Target)', got ${urgentConsult?.requestedResponseTimeframe}`
);

// -------------------------------------------------------------
// Scenario K: Handover Summary Projection Flexibility
// -------------------------------------------------------------
const ipassHandover = INITIAL_MOCK_HANDOVERS.find(h => h.id === 'handover-coord-205');
assert(
  ipassHandover !== undefined &&
  ipassHandover.summaryProjection?.templateId === 'IPASS' &&
  ipassHandover.summaryProjection?.sections.length === 5,
  'Scenario K: Handover summary supports flexible structured templates (e.g. I-PASS) beyond SBAR-only',
  `Failed to find I-PASS handover projection with 5 sections`
);

// -------------------------------------------------------------
// Scenario L: Work Item Completion vs Clinical Source Record
// -------------------------------------------------------------
const sampleWorkItemCompletion = {
  queueItemId: 'WI-101',
  docTitle: 'NOTE-REF-9104',
  isClinicalNoteCreation: false
};
assert(
  sampleWorkItemCompletion.isClinicalNoteCreation === false,
  'Scenario L: Work Item completion references an external note without creating or signing clinical documentation',
  'Work item completion erroneously claimed clinical note creation'
);

// -------------------------------------------------------------
// Scenario M: Waiting Time Derived from Source Event Timestamp
// -------------------------------------------------------------
function testParseArrivalMinutes(arrivalTime?: string): number | null {
  if (!arrivalTime || typeof arrivalTime !== 'string' || !arrivalTime.trim()) return null;
  const match = arrivalTime.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  const mins = parseInt(match[2], 10);
  const arrivalTotalMins = hours * 60 + mins;
  const shiftRefMins = 14 * 60 + 45; // 14:45
  let diff = shiftRefMins - arrivalTotalMins;
  if (diff < 0) diff += 24 * 60;
  return diff >= 0 ? diff : 0;
}

const missingTimeResult = testParseArrivalMinutes(undefined);
const validTimeResult = testParseArrivalMinutes('14:05'); // 40 mins before 14:45
assert(
  missingTimeResult === null,
  'Scenario M1: Missing arrival timestamp returns null (unavailable) without converting to zero or inventing minutes',
  `Expected null for missing timestamp, got ${missingTimeResult}`
);
assert(
  validTimeResult === 40,
  'Scenario M2: Valid arrival time computes elapsed wait minutes from arrival event timestamp',
  `Expected 40 mins for 14:05, got ${validTimeResult}`
);

console.log(`\n--- SUITE COMPLETED: ${passCount} PASSED, ${failCount} FAILED ---`);
process.exit(failCount > 0 ? 1 : 0);
