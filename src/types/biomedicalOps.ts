// ============================================================================
// HIS — BIOMEDICAL & MEDICAL EQUIPMENT MANAGEMENT OPERATIONS (TYPES)
// Architectural boundary: Synthetic Operations & Clinical Workflow Preview
// Informed by applicable IEC 62353 testing concepts & Saudi SFDA MDS-REQ references
// Application Behavior ONLY — No claim of external regulatory certification
// ============================================================================

export type BiomedicalWorkspaceId =
  | 'overview'
  | 'equipment_registry'
  | 'ppm_calibration'
  | 'work_orders'
  | 'safety_testing'
  | 'vendor_contracts'
  | 'recalls_fsca'
  | 'decommissioning';

export type BiomedicalPersona =
  | 'biomed_manager'
  | 'field_biomed_engineer'
  | 'safety_regulatory_officer'
  | 'department_custodian'
  | 'vendor_specialist';

// Regulatory classification scheme & source separation
export type MedicalDeviceClassification =
  | 'class_I'       // Low risk
  | 'class_IIa'     // Low-medium risk
  | 'class_IIb'     // Medium-high risk
  | 'class_III';    // High risk

export type ClinicalCriticality =
  | 'routine'
  | 'important'
  | 'critical'
  | 'life_support';

export type ServiceCriticality =
  | 'low'
  | 'medium'
  | 'high'
  | 'vital';

export type EquipmentClinicalStatus =
  | 'pending_commissioning'
  | 'commissioned_active'
  | 'in_service'
  | 'maintenance_scheduled'
  | 'under_repair'
  | 'post_repair_testing'
  | 'quarantined_safety_hold'
  | 'out_of_service_calibration_failed'
  | 'decommissioned';

export type WorkOrderPriority =
  | 'stat_life_support'
  | 'urgent_clinical'
  | 'routine'
  | 'scheduled_ppm';

export type WorkOrderStatus =
  | 'reported'
  | 'assigned'
  | 'in_progress'
  | 'awaiting_parts'
  | 'testing_pending'
  | 'completed_verified'
  | 'cancelled';

export type RecallSeverity =
  | 'class_1_critical_recall'
  | 'class_2_urgent_fsca'
  | 'class_3_safety_notice';

export type RequirementEvidenceStatus =
  | 'required'
  | 'not_required'
  | 'conditional'
  | 'not_verified';

export type DecontaminationStatus =
  | 'not_required'
  | 'required'
  | 'pending'
  | 'completed_reference'
  | 'failed'
  | 'not_verified';

export type DecontaminationSource =
  | 'clinical_dept'
  | 'ipc'
  | 'cssd'
  | 'laboratory_biosafety'
  | 'none';

export interface DecontaminationRequirementProfile {
  requirementStatus: DecontaminationStatus;
  source: DecontaminationSource;
  certificateRef?: string;
  disinfectionLevel?: 'cleaning_only' | 'low_level' | 'intermediate_level' | 'high_level' | 'sterilization';
  verifiedBy?: string;
  verificationDate?: string;
}

export interface CommissioningRequirementProfile {
  physicalInspection: RequirementEvidenceStatus;
  installationVerification: RequirementEvidenceStatus;
  functionalTest: RequirementEvidenceStatus;
  performanceVerification: RequirementEvidenceStatus;
  electricalSafetyTest: RequirementEvidenceStatus;
  calibration: RequirementEvidenceStatus;
  networkIntegration: RequirementEvidenceStatus;
  trainingEvidence: RequirementEvidenceStatus;
  manufacturerInstallationEvidence: RequirementEvidenceStatus;
  manufacturerIfuAvailable: boolean;
}

export interface ElectricalSafetyTestProfile {
  testProfileId: string;
  applicableStandardReference: string; // e.g. "Informed by IEC 62353:2014 Direct Method"
  equipmentClass: 'Class_I' | 'Class_II' | 'Internally_Powered' | 'Non_Electrical';
  appliedPartType: 'Type_B' | 'Type_BF' | 'Type_CF' | 'None';
  measurementType: string;
  testMethod: 'Direct' | 'Differential' | 'Alternative';
  earthResistanceLimitOhms?: number;
  detachableCordAllowanceOhms?: number;
  insulationResistanceLimitMOhms?: number;
  chassisLeakageLimitMicroAmps?: number;
  patientLeakageLimitMicroAmps?: number;
  unit: string;
  manufacturerOverrideReference?: string;
  profileVersion: string;
}

export interface ElectricalSafetyTestRecord {
  id: string;
  testDate: string;
  testedBy: string;
  testStandardReference: string; // e.g. "Workflow informed by IEC 62353"
  testProfileId: string; // References explicit profile
  testDeviceRef: string; // e.g. "Fluke ESA620 S/N 84729"
  earthResistanceOhms?: number;
  earthResistancePass?: boolean;
  insulationResistanceMOhms?: number;
  insulationResistancePass?: boolean;
  chassisLeakageCurrentMicroAmps?: number;
  chassisLeakagePass?: boolean;
  patientAppliedPartLeakageMicroAmps?: number;
  overallSafetyPass: boolean;
  notes?: string;
}

export interface CalibrationTestPoint {
  parameter: string;
  nominalValue: number;
  measuredValue: number;
  unit: string;
  allowedTolerancePercent: number;
  deviationPercent: number;
  inTolerance: boolean;
}

export interface CalibrationRecord {
  id: string;
  calibrationDate: string;
  expiryDate: string;
  calibratedBy: string;
  calibrationLabVendor?: string;
  certificateNumber: string;
  referenceStandardDevice: string; // Reference measurement tool used
  referenceStandardExpiryDate: string; // Expiry of calibration standard
  referenceStandardExpired: boolean; // Interlock: expired standard invalidates calibration
  testPoints: CalibrationTestPoint[];
  passed: boolean;
  notes?: string;
}

export interface PreventiveMaintenanceSchedule {
  frequencyMonths: number;
  lastPpmDate: string;
  nextPpmDueDate: string;
  ppmProtocolCode: string;
  status: 'up_to_date' | 'due_soon' | 'overdue' | 'in_progress';
  checklistItems: {
    step: string;
    completed: boolean;
    remarks?: string;
  }[];
}

export interface SparePartUsed {
  partNumber: string;
  description: string;
  quantity: number;
  costSar: number;
  lotOrSerialNumber?: string;
  inventorySource: 'hospital_central_store' | 'vendor_consignment' | 'direct_purchase';
  // Synthetic reference only — no backend inventory mutation
}

export interface DowntimePeriod {
  id: string;
  start: string; // ISO string e.g. "2026-09-23 14:15"
  end?: string;  // Undefined if open downtime! No fabricated end time
  durationHours?: number; // Calculated only when closed or live against synthetic clock
  reason: string;
  workOrderId?: string;
}

export interface EquipmentLifecycleEvent {
  id: string;
  timestamp: string;
  eventType:
    | 'commissioning'
    | 'location_custody_transfer'
    | 'ppm_execution'
    | 'breakdown_reported'
    | 'repair_work'
    | 'calibration'
    | 'technical_safety_test'
    | 'vendor_service'
    | 'downtime_start'
    | 'downtime_end'
    | 'safety_alert_quarantine'
    | 'safety_alert_release'
    | 'return_to_service'
    | 'decommissioning';
  descriptionAr: string;
  descriptionEn: string;
  actor: string;
  metadata?: Record<string, any>;
}

export interface BiomedicalWorkOrder {
  id: string;
  workOrderNumber: string;
  assetId: string;
  assetTag: string;
  assetName: string;
  departmentId: string;
  departmentName: string;
  reportedBy: string;
  reportedDate: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  assignedEngineer?: string;
  problemDescription: string;
  failureCategory?: 'electronic_board' | 'power_supply' | 'pneumatic_hydraulic' | 'sensor_probe' | 'software_firmware' | 'physical_damage' | 'user_error' | 'routine_wear';
  actionsTaken?: string;
  rootCauseAnalysis?: string;
  partsUsed: SparePartUsed[];
  downtimeRecord?: DowntimePeriod;
  electricalSafetyTestRequired: boolean;
  safetyTestRecord?: ElectricalSafetyTestRecord;
  calibrationRequired: boolean;
  calibrationRecord?: CalibrationRecord;
  functionalVerificationCompleted: boolean;
  decontaminationClearance?: DecontaminationRequirementProfile;
  technicianSignOff?: {
    engineerName: string;
    timestamp: string;
  };
  vendorServiceReportRef?: string;
  vendorRepaired: boolean;
  hospitalVerificationCompleted: boolean;
  returnToServiceApproved: boolean;
  returnToServiceApprovedBy?: string;
  returnToServiceTimestamp?: string;
  clinicalCustodianSignOff?: {
    custodianName: string;
    timestamp: string;
  };
}

export interface MedicalEquipmentAsset {
  id: string;
  assetTag: string;
  nameAr: string;
  nameEn: string;
  category: 'life_support' | 'diagnostic_imaging' | 'surgical_or' | 'monitoring' | 'therapeutic' | 'laboratory_analyzer' | 'sterilization_cssd' | 'general_care';
  
  // Explicit separation: Regulatory Classification vs Clinical Criticality
  regulatoryClassificationScheme: string; // e.g. "SFDA_MDS_REQ", "EU_MDR", "US_FDA"
  regulatoryClassificationValue: string;  // e.g. "Class III", "Class IIb", "Class D"
  regulatoryClassificationSource: string; // e.g. "SFDA Medical Device National Registry"
  clinicalCriticality: ClinicalCriticality; // Derived from hospital/clinical use, not regulatory class
  lifeSupportDependency: boolean;        // Explicit boolean flag, NOT inferred from Class III alone
  serviceCriticality: ServiceCriticality;

  manufacturer: string;
  model: string;
  serialNumber: string;
  udiCode: string;
  sfdaRegistrationNumber: string;
  assignedDepartment: string;
  locationRoom: string;
  custodianStaffName: string;
  commissioningDate: string;
  warrantyExpiryDate: string;
  oemVendorName: string;
  currentStatus: EquipmentClinicalStatus;
  
  // Device-profile-driven requirements
  commissioningProfile: CommissioningRequirementProfile;
  decontaminationProfile: DecontaminationRequirementProfile;
  safetyTestProfileId?: string; // Links to ElectricalSafetyTestProfile
  calibrationProfile?: {
    calibrationRequired: boolean;
    frequencyMonths?: number;
    parametersList?: string[];
  };

  ppmSchedule: PreventiveMaintenanceSchedule;
  latestSafetyTest?: ElectricalSafetyTestRecord;
  latestCalibration?: CalibrationRecord;
  activeWorkOrderId?: string;
  fscaQuarantineRef?: string;
  
  // Chronological Lifecycle History & Downtime
  lifecycleHistory: EquipmentLifecycleEvent[];
  downtimeHistory: DowntimePeriod[];

  decommissioningRecord?: {
    date: string;
    reason: string;
    decontaminationCertRef?: string;
    decontaminationStatus: DecontaminationStatus;
    disposalMethod: 'recycle_parts' | 'destruction_hazardous' | 'oem_trade_in' | 'donation';
    authorizedBy: string;
  };
}

export interface VendorServiceContract {
  id: string;
  contractNumber: string;
  vendorName: string;
  vendorContactEmail: string;
  vendorPhone: string;
  contractType: 'comprehensive_parts_labor' | 'labor_only' | 'ppm_preventive_only' | 'on_call_t_m';
  startDate: string;
  endDate: string;
  annualValueSar: number; // Synthetic financial reference only
  slaResponseHours: number; // Configurable target, NOT hardcoded universal law
  slaPolicyMode: 'CONFIGURED_SLA' | 'ILLUSTRATIVE_CONTRACT_CONFIGURATION';
  coveredAssetIds: string[];
  status: 'active' | 'expiring_soon' | 'expired';
}

export type AlertMatchStatus = 'AFFECTED_CONFIRMED' | 'REVIEW_REQUIRED' | 'UNAFFECTED';

export interface SafetyAlertFsca {
  id: string;
  fscaAlertNumber: string;
  issuingBody: 'SFDA_NCMDR' | 'MANUFACTURER_FSCA' | 'ECRI_HEALTH_DEVICES';
  titleAr: string;
  titleEn: string;
  severity: RecallSeverity;
  affectedManufacturer: string;
  affectedModel: string;
  affectedSerialRange: string;
  affectedLotBatch?: string;
  affectedSoftwareFirmware?: string;
  hazardDescription: string;
  actionRequired: 'immediate_quarantine' | 'software_upgrade' | 'component_replacement' | 'label_update_inspection';
  affectedAssetIds: string[]; // Confirmed affected IDs
  reviewRequiredAssetIds?: string[]; // Potential matches needing engineering review
  status: 'open_action_pending' | 'under_remediation' | 'verified_closed';
  dateIssued: string;
  closedDate?: string;
}

export interface BiomedicalAuditLog {
  id: string;
  timestamp: string;
  actionType: string;
  assetId?: string;
  workOrderId?: string;
  actor: string;
  role: string;
  descriptionAr: string;
}

export interface BiomedicalOpsState {
  assets: MedicalEquipmentAsset[];
  workOrders: BiomedicalWorkOrder[];
  vendorContracts: VendorServiceContract[];
  safetyAlerts: SafetyAlertFsca[];
  auditLogs: BiomedicalAuditLog[];
  activePersona: BiomedicalPersona;
  testProfiles: ElectricalSafetyTestProfile[];
}
