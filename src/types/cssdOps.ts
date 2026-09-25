// ============================================================================
// CSSD & STERILE PROCESSING OPERATIONS TYPES
// Synthetic Healthcare Design Preview Reference
// ============================================================================

export type SpauldingClassification = 'critical' | 'semicritical' | 'noncritical';

export type DeviceReprocessingEligibility = 
  | 'reusable'
  | 'single_use'
  | 'single_patient_use'
  | 'unknown';

export type ReprocessingMethodCategory =
  | 'steam_sterilization'
  | 'low_temp_vhp_sterilization'
  | 'high_level_disinfection'
  | 'external_specialized_processing'
  | 'processing_profile_not_verified';

export type ProcessZoningArea =
  | 'dirty_decontamination'
  | 'clean_inspection_assembly'
  | 'packaging_preparation'
  | 'sterilization_processing'
  | 'sterile_storage_distribution';

export type ContaminatedReturnStatus =
  | 'returned_pending_receipt'
  | 'received_complete'
  | 'received_with_discrepancy'
  | 'rejected_quarantine';

export type DecontaminationStatus =
  | 'pending_precleaning'
  | 'in_manual_cleaning'
  | 'in_ultrasonic'
  | 'in_washer_disinfector'
  | 'cleaning_passed'
  | 'cleaning_failed_reclean_required';

export type CleaningInspectionFinding =
  | 'clean_functional'
  | 'visible_residual_soil'
  | 'magnified_inspection_failed'
  | 'residual_protein_test_failed'
  | 'corrosion_crack_damage'
  | 'blunt_malaligned'
  | 'not_tested';

export type InspectionStatus =
  | 'pending_inspection'
  | 'inspection_passed'
  | 'reclean_required'
  | 'repair_required_biomed'
  | 'quarantine_damaged'
  | 'component_replacement_needed'
  | 'not_verified';

export type SetAssemblyStatus =
  | 'pending_assembly'
  | 'set_complete'
  | 'set_incomplete_missing_parts'
  | 'substitution_pending_approved'
  | 'released_with_approved_variance'
  | 'quarantined';

export type PackagingMethod =
  | 'rigid_container_with_filter'
  | 'double_wrap_nonwoven'
  | 'peel_pouch_paper_plastic'
  | 'tyvek_pouch_vhp'
  | 'tyvek_steam_validated'
  | 'hld_covered_tray'
  | 'incompatible_profile';

export type PackagingCompatibilityStatus =
  | 'compatible'
  | 'incompatible'
  | 'conditional'
  | 'not_verified'
  | 'ifu_unavailable';

export type PackagingStatus =
  | 'not_packaged'
  | 'packaged_pending_load'
  | 'in_sterilization_load'
  | 'released_sterile'
  | 'package_integrity_compromised';

export type SterilizerCycleStatus =
  | 'cycle_scheduled'
  | 'cycle_running_simulation'
  | 'cycle_completed'
  | 'monitoring_pending'
  | 'release_review'
  | 'released'
  | 'held'
  | 'failed'
  | 'quarantined'
  | 'reprocessing_required';

export type ChemicalIndicatorClass =
  | 'Class 1 Process Tape/Label'
  | 'Class 2 Specific Air-Removal (Bowie-Dick)'
  | 'Class 4 Multi-Variable'
  | 'Class 5 Integrating'
  | 'Class 6 Emulating'
  | 'None_Configured';

export type IndicatorResult = 'passed' | 'failed' | 'pending' | 'not_applicable';

export type StorageIntegrityStatus =
  | 'intact_sterile'
  | 'wet_pack_compromised'
  | 'torn_punctured'
  | 'opened_unsealed'
  | 'handling_breach_dropped'
  | 'quarantined_recalled'
  | 'not_verified';

export type DistributionStatus =
  | 'requested'
  | 'allocated'
  | 'dispatched'
  | 'received_at_unit'
  | 'used_in_case'
  | 'returned_to_cssd';

export type QualityExceptionCategory =
  | 'missing_instrument'
  | 'damaged_instrument'
  | 'wrong_set_item'
  | 'cleaning_failure'
  | 'inspection_failure'
  | 'packaging_failure'
  | 'indicator_failure'
  | 'load_failure'
  | 'missing_monitoring_evidence'
  | 'equipment_unavailable'
  | 'ifu_profile_conflict'
  | 'single_use_item_detected'
  | 'storage_integrity_failure'
  | 'distribution_discrepancy'
  | 'case_set_shortage'
  | 'sterilization_recall'
  | 'unidentified_device';

export type CSSDWorkspaceId =
  | 'overview'
  | 'dirty_receipt_decon'
  | 'cleaning_inspection'
  | 'assembly_packaging'
  | 'sterilization_loads'
  | 'load_release_quality'
  | 'sterile_storage_distribution'
  | 'sets_traceability'
  | 'recall_exceptions';

export type CSSDPersona =
  | 'receiving_tech'
  | 'decon_tech'
  | 'assembly_tech'
  | 'sterilization_operator'
  | 'release_reviewer'
  | 'cssd_supervisor'
  | 'or_receiver'
  | 'infection_prevention_reviewer';

// Master Reusable Device & Set Definitions
export interface InstrumentItemComponent {
  id: string; // e.g. 'INST-001'
  nameAr: string;
  nameEn: string;
  udiCode: string;
  reusableStatus: DeviceReprocessingEligibility; // Reusable vs Single-Use vs Unknown
  spauldingClass: SpauldingClassification;
  manufacturer: string;
  model: string;
  ifuDocumentRef: string;
  specialHandlingNotes?: string;
  requiresDisassembly: boolean;
  lumensChannelsCount: number;
}

export interface InstrumentSetComponentRequirement {
  componentId: string;
  componentNameAr: string;
  componentNameEn: string;
  requiredQuantity: number;
  isOptional: boolean;
  eligibleSubstitutes?: string[]; // IDs of approved substitute items
}

export interface InstrumentSetDefinition {
  id: string; // e.g. 'SET-DEF-CABG-01'
  code: string;
  nameAr: string;
  nameEn: string;
  serviceCategory: string; // e.g. 'Cardiac Surgery', 'Orthopedics', 'General Laparoscopy'
  version: string;
  spauldingClass: SpauldingClassification;
  compatibleProcessMethod: ReprocessingMethodCategory;
  compatiblePackaging: PackagingMethod;
  components: InstrumentSetComponentRequirement[];
  isImplantRelated: boolean;
  totalInstrumentCount: number;
  manufacturerIfuRef?: string;
  isIfuAvailable?: boolean;
}

// Active Processing Instances
export interface CSSDReusableSetInstance {
  id: string; // Instance barcode e.g. 'SET-INST-701'
  setDefinitionId: string;
  setNameAr: string;
  setNameEn: string;
  serialNumber: string;
  currentZoningArea: ProcessZoningArea;
  pointOfUseStatus: 'in_or' | 'in_transit' | 'at_cssd';
  decontaminationStatus: DecontaminationStatus;
  inspectionStatus: InspectionStatus;
  assemblyStatus: SetAssemblyStatus;
  packagingStatus: PackagingStatus;
  currentPackageId?: string;
  lastSterilizerCycleId?: string;
  isSingleUseBlocked?: boolean;
  missingComponentsList: string[];
  damagedComponentsList: string[];
  substitutedComponentsList: string[];
  notes?: string;
}

// 1. Contaminated Return & Receipt
export interface ContaminatedReturnRecord {
  id: string; // e.g. 'RET-2026-001'
  returnTimestamp: string;
  originDepartment: string; // e.g. 'OR-1', 'ICU', 'ER', 'Endoscopy'
  orCaseReference?: string; // e.g. 'or-case-201'
  patientMrnReference?: string;
  patientNameSynthetic?: string;
  setInstanceIds: string[];
  expectedCount: number;
  returnedCount: number;
  hasSharpsHazard: boolean;
  pointOfUsePretreatment: 'enzymatic_foam_applied' | 'dry_untreated' | 'rinsed_saline_improper';
  transportContainerId: string;
  transportCondition: 'closed_biohazard_cart' | 'open_improper';
  receiptStatus: ContaminatedReturnStatus;
  receivingStaff: string;
  exceptionNotes?: string;
  discrepancyDetails?: {
    missingItems: string[];
    unexpectedItems: string[];
    damagedItems: string[];
    singleUseFound: string[];
  };
}

// 2. Decontamination & Washer Cycle (ISO 15883-1 / ISO 15883-2 Profile)
export interface WasherDisinfectorCycleRecord {
  id: string; // e.g. 'WASH-CYC-101'
  equipmentId: string; // e.g. 'EQ-WD-01'
  equipmentName: string;
  applicableStandard: 'ISO 15883-2:2024 (Critical/Semi-Critical Surgical)' | 'ISO 15883-1:2024 (General)';
  cycleProfile: string; // e.g. 'Surgical Instruments Thermal Disinfection A0>=3000'
  targetA0Profile: number; // e.g. 3000 for surgical instruments, or 600 for low-level
  startTime: string;
  endTime?: string;
  operatorId: string;
  operatorName: string;
  status: 'running' | 'completed_pass' | 'failed_abort' | 'quarantined';
  maxTempReachedCelsius?: number;
  disinfectionHoldTimeSeconds?: number;
  a0CalculatedValue?: number;
  detergentLotNumber: string;
  enzymeWashVerified: boolean;
  thermalDisinfectionVerified: boolean;
  cycleEvidencePresent: boolean;
  includedSetInstanceIds: string[];
  notes?: string;
}

// 3. Packaging & Biological/Chemical Indicator Evidence
export interface CSSDPackageRecord {
  id: string; // e.g. 'PKG-2026-8801'
  setInstanceId: string;
  setNameAr: string;
  packagingMethod: PackagingMethod;
  containerBarcode: string;
  internalIndicatorType: ChemicalIndicatorClass;
  internalIndicatorVerified: boolean;
  externalIndicatorType: 'Class 1 Process Tape/Label';
  externalIndicatorVerified: boolean;
  packagedBy: string;
  packagingTimestamp: string;
  integrityConfirmed: boolean;
  compatibleProcessMethod: ReprocessingMethodCategory;
  compatibilityStatus: PackagingCompatibilityStatus;
  currentStatus: PackagingStatus;
  loadId?: string;
  storageIntegrity: StorageIntegrityStatus;
  storageLocation?: string; // e.g. 'Zone S-Rack-A3'
  eventRelatedCompromiseReason?: string;
}

// 4. Sterilization Load & Process Monitoring
export interface SterilizerCycleRecord {
  id: string; // e.g. 'STER-2026-CYC-401'
  sterilizerEquipmentId: string; // e.g. 'EQ-AUTOCLAVE-01'
  sterilizerName: string;
  sterilizerType: 'prevacuum_steam' | 'gravity_steam' | 'vhp_plasma' | 'et_gas';
  methodCategory: ReprocessingMethodCategory;
  cycleProfileName: string; // e.g. '134°C Pre-Vacuum 4 min Steam (ISO 17665)'
  targetTempCelsius: number;
  targetPressureBar: number;
  exposureTimeMinutes: number;
  operatorId: string;
  operatorName: string;
  startTime: string;
  endTime?: string;
  cycleStatus: SterilizerCycleStatus;
  isIUSSException: boolean;
  iussDocumentation?: {
    urgentClinicalNeed: string;
    itemDeviceDescription: string;
    reasonJustification: string;
    operatingRoomDestination: string;
    operatorStaff: string;
    immediateUseContext: string;
    clinicalApprovalRef: string;
  };
  hasImplantTray: boolean;
  // Mechanical monitoring evidence
  mechanicalParamEvidence: {
    passed: boolean;
    tempGraphVerified: boolean;
    pressureGraphVerified: boolean;
    vacuumLeakRateVerified: boolean;
    airRemovalTestRequired: boolean; // Required for prevacuum steam
    airRemovalTestPassed: boolean; // Bowie-Dick passed today
  };
  // Configurable chemical monitoring evidence
  chemicalIndicatorEvidence: {
    passed: boolean;
    indicatorType: ChemicalIndicatorClass;
    colorChangeVerified: boolean;
    requiredByPolicy: boolean;
  };
  // Biological indicator evidence
  biologicalIndicatorEvidence: {
    isRequired: boolean;
    biStatus: IndicatorResult; // 'passed' | 'failed' | 'pending' | 'not_applicable'
    biVialLot?: string;
    biReadTimestamp?: string;
    controlVialPositiveVerified?: boolean;
    incubatorId?: string;
    quarantinePendingResult: boolean;
  };
  // Release
  releaseDecision: {
    decision: 'released' | 'held' | 'failed_rejected' | 'pending_review';
    releasedBy?: string;
    releaseTimestamp?: string;
    holdReason?: string;
    exceptionNote?: string;
  };
  includedPackageIds: string[];
}

// 5. Sterile Storage & Distribution Request
export interface SterileDistributionRequest {
  id: string; // e.g. 'DIST-REQ-501'
  destinationDepartment: string; // e.g. 'OR Theatre 1', 'ICU', 'Wards 3B'
  orCaseReference?: string; // e.g. 'or-case-201'
  patientMrnReference?: string;
  requiredByTime: string;
  urgency: 'routine' | 'urgent_stat';
  requestedSetDefinitionIds: string[];
  allocatedPackageIds: string[];
  dispatchTime?: string;
  courierStaff?: string;
  acknowledgedByDestination?: string;
  acknowledgementTimestamp?: string;
  status: DistributionStatus;
  clinicalUseConfirmed: boolean;
  exposureVerificationStatus: 'verified' | 'not_verified' | 'no_or_linkage';
  usedInPatientMrn?: string;
  useTimestamp?: string;
  notes?: string;
}

// 6. Traceability Audit Chain
export interface FullDeviceTraceRecord {
  setInstanceId: string;
  setNameAr: string;
  setNameEn: string;
  packageId?: string;
  sterilizerCycleId?: string;
  washerCycleId?: string;
  distributionRequestId?: string;
  orCaseId?: string;
  patientMrn?: string;
  patientNameSynthetic?: string;
  exposureVerificationStatus: 'verified' | 'not_verified' | 'no_or_linkage';
  currentStatus: string;
  isRecalled: boolean;
  recallCaseId?: string;
}

// 7. Recall & Quality Exception
export interface CSSDQualityException {
  id: string; // e.g. 'EXC-2026-01'
  category: QualityExceptionCategory;
  severity: 'critical_safety_block' | 'high_priority' | 'medium_operational';
  sourceReference: string; // Set ID, Package ID, or Cycle ID
  affectedEntities: string[];
  detectedTimestamp: string;
  detectedBy: string;
  descriptionAr: string;
  descriptionEn: string;
  status: 'open_action_required' | 'under_investigation' | 'resolved' | 'reprocessed';
  resolutionAction?: string;
  quarantineApplied: boolean;
  resolvedAt?: string;
}

export interface CSSDRecallCase {
  id: string; // e.g. 'RECALL-2026-001'
  titleAr: string;
  triggerReason: string;
  suspectSterilizerCycleId: string;
  openedTimestamp: string;
  openedBy: string;
  status: 'active_investigation' | 'quarantine_enforced' | 'retrieval_complete' | 'closed';
  affectedPackageIds: string[];
  locatedInStorageCount: number;
  distributedToOrCount: number;
  usedInPatientCount: number;
  exposureVerificationStatus: 'verified' | 'not_verified' | 'exposure_reference_not_verified';
  returnedReprocessedCount: number;
  ipcNotificationSent: boolean;
  biomedReviewRequested: boolean;
  reprocessingPlanAr: string;
  notes: string;
}

// 8. Reusable Equipment Master Reference (Biomedical Read-only)
export interface CSSDEquipmentReference {
  id: string;
  nameAr: string;
  nameEn: string;
  category: 'autoclave_steam' | 'vhp_sterilizer' | 'washer_disinfector' | 'ultrasonic_cleaner' | 'heat_sealer';
  sterilizerType?: 'prevacuum_steam' | 'gravity_steam' | 'vhp_plasma' | 'et_gas';
  operationalStatus: 'operational_validated' | 'under_maintenance' | 'qualification_pending' | 'out_of_service';
  validationExpiryDate: string;
  lastBiomedCheck: string;
  airRemovalTestRequired: boolean; // Prevacuum autoclaves require daily Bowie-Dick
  bowieDickStatusToday: 'passed' | 'pending' | 'failed' | 'not_applicable';
  locationZone: ProcessZoningArea;
}

// Top Level State
export interface CSSDOpsState {
  activePersona: CSSDPersona;
  selectedBranchId: string;
  setDefinitions: InstrumentSetDefinition[];
  setInstances: CSSDReusableSetInstance[];
  contaminatedReturns: ContaminatedReturnRecord[];
  washerCycles: WasherDisinfectorCycleRecord[];
  packages: CSSDPackageRecord[];
  sterilizerCycles: SterilizerCycleRecord[];
  distributionRequests: SterileDistributionRequest[];
  equipmentList: CSSDEquipmentReference[];
  qualityExceptions: CSSDQualityException[];
  recallCases: CSSDRecallCase[];
  auditLogs: Array<{
    id: string;
    timestamp: string;
    actionType: string;
    entityId: string;
    actor: string;
    descriptionAr: string;
  }>;
}
