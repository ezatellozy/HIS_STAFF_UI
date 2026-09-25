/**
 * HIS Enterprise Procurement & Purchasing Domain Types
 * 
 * Defines the complete data model for hospital purchasing:
 * - Purchase Requisitions (PR) & Configurable Multi-Level Approval
 * - Sourcing Consolidation, RFQ / Tendering & Supplier Communications
 * - Quotation Intake, UOM Normalization & Multi-Currency Basis
 * - Technical (Specialty) & Commercial Bid Evaluations and Award Decisions
 * - Purchase Orders (PO), Revisions / Amendments & Line Accounting
 * - Supplier Master Registry, Qualification, Compliance & Scorecards
 * - Framework Agreements / Contracts & Call-off Orders
 * - Commercial Supplier Claims, Replacement & Credit Note Tracking
 * 
 * Date: 2026-09-21
 */

import { ItemMasterRecord, StorageLocation, UomType } from './supplyChainOps';

// ============================================================================
// 1. ORGANIZATIONAL & POLICY PROFILES
// ============================================================================

export type ProcurementBranchId = 'main_hospital' | 'suburban_clinic_branch' | 'central_warehouse_hub' | 'all';

export type ProcurementMethod = 
  | 'direct_purchase'             // Single quotation under threshold
  | 'rfq'                         // Request for Quotation (typically 3 quotes)
  | 'rfi'                         // Request for Information (market research)
  | 'formal_tender'               // Public or invited tender / ITB
  | 'rfp_services'                // Request for Proposal (complex services)
  | 'emergency_single_source'     // Clinical urgent / sole agent exception
  | 'contract_call_off';          // Order against existing framework agreement

export type RequisitionPriority = 'routine' | 'urgent' | 'stat_emergency';

export type SourcingItemType = 'catalog_stock' | 'non_catalog_special' | 'biomedical_capital' | 'clinical_service' | 'facility_maintenance';

export interface DelegationOfAuthorityPolicy {
  tierName: string;
  maxAmountSar: number;
  requiredRole: 'department_head' | 'procurement_manager' | 'cfo_executive' | 'board_committee';
  requiresSecondaryReview: boolean;
}

export interface InstitutionalProcurementPolicy {
  policyId: string;
  institutionNameAr: string;
  institutionNameEn: string;
  currency: 'SAR';
  standardVatPercent: number; // e.g. 15
  quotationRules: {
    directPurchaseMaxSar: number;     // e.g. 10000
    rfqMinQuotations: number;         // e.g. 3
    formalTenderThresholdSar: number; // e.g. 150000
  };
  delegationOfAuthority: DelegationOfAuthorityPolicy[];
  allowEmergencyBypassWithPostAudit: boolean;
  allowOverDeliveryTolerancePercent: number; // e.g. 0 for pharma, 5 for consumables
}

// ============================================================================
// 2. SUPPLIER MASTER & QUALIFICATION
// ============================================================================

export type SupplierCategory = 
  | 'pharmaceuticals'
  | 'medical_surgical_consumables'
  | 'laboratory_diagnostics'
  | 'blood_bank_supplies'
  | 'biomedical_capital_equipment'
  | 'cssd_sterilization'
  | 'facilities_and_it'
  | 'general_services';

export type SupplierQualificationStatus = 
  | 'registered'             // Basic account created, not yet evaluated
  | 'under_review'            // Documents submitted, audit pending
  | 'qualified'               // Fully vetted for designated categories
  | 'conditionally_qualified' // Provisional approval with corrective action plan
  | 'restricted'              // Restricted to specific low-risk categories
  | 'suspended'               // Temporary quality or commercial hold
  | 'expired'                 // License or accreditation expired
  | 'rejected';               // Failed prequalification standards

export interface SupplierComplianceDocument {
  id: string;
  documentType: 'commercial_registration' | 'tax_vat_certificate' | 'sfda_establishment_license' | 'iso_13485' | 'gmp_certificate' | 'authorized_distributor_letter' | 'other';
  documentNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  isExpired: boolean;
  verificationStatus: 'verified' | 'pending_verification' | 'rejected';
  notes?: string;
}

export interface SupplierContact {
  id: string;
  fullNameAr: string;
  fullNameEn: string;
  title: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface SupplierMaster {
  id: string;                         // e.g. "VEND-SA-9021"
  vendorCode: string;                 // Hospital catalog reference code
  legalNameAr: string;
  legalNameEn: string;
  tradeName?: string;
  taxRegistrationNumber: string;      // ZATCA 15-digit VAT number
  commercialRegistrationNumber: string;
  country: string;                    // e.g. "SA" (Saudi Arabia)
  cityAr: string;
  cityEn: string;
  addressAr: string;
  addressEn: string;
  approvedCategories: SupplierCategory[];
  qualificationStatus: SupplierQualificationStatus;
  qualificationExpiryDate?: string;
  qualificationScopeSummaryAr: string;
  qualificationScopeSummaryEn: string;
  paymentTerms: string;               // e.g. "Net 60 Days", "Net 30 Days"
  standardCurrency: 'SAR' | 'USD' | 'EUR';
  contacts: SupplierContact[];
  complianceDocuments: SupplierComplianceDocument[];
  performanceMetrics?: {
    onTimeDeliveryRatePercent: number;
    qaAcceptanceRatePercent: number;
    completedOrdersCount: number;
    activeClaimsCount: number;
    averageLeadTimeDays: number;
  };
  notes?: string;
  isNupcoAffiliated?: boolean;
}

// ============================================================================
// 3. PURCHASE REQUISITIONS (PR)
// ============================================================================

export type PurchaseRequisitionStatus = 
  | 'draft'
  | 'submitted_pending_approval'
  | 'returned_for_revision'
  | 'approved'
  | 'rejected'
  | 'partially_sourced'
  | 'fully_sourced'
  | 'cancelled';

export interface PurchaseRequisitionLine {
  id: string;                         // e.g. "PR-LINE-101"
  lineNumber: number;
  itemType: SourcingItemType;
  catalogItemId?: string;             // Reference to ItemMasterRecord.id if catalog item
  itemCode: string;                   // Catalog code or 'NON-CATALOG'
  itemDescriptionAr: string;
  itemDescriptionEn: string;
  requestedUom: UomType;
  requestedQuantity: number;
  estimatedUnitPriceSar: number;
  estimatedTotalSar: number;
  requiredDeliveryDate: string;
  deliveryLocationId: string;         // e.g. "LOC-WH-MAIN-DOCK"
  suggestedSupplierId?: string;
  costCenterCode: string;
  notes?: string;
  
  // Fulfillment Tracking:
  approvedQuantity: number;
  sourcedQuantity: number;            // Quantity assigned to RFQ or PO
  remainingUnsourcedQuantity: number; // approvedQuantity - sourcedQuantity
  sourcingStatus: 'unsourced' | 'partially_sourced' | 'fully_sourced' | 'cancelled';
  
  // Stock Availability Warning:
  internalStockAvailable?: number;    // Read-only reference from warehouse if catalog item
}

export interface RequisitionApprovalRecord {
  id: string;
  stageNameAr: string;
  stageNameEn: string;
  reviewerRoleId: string;
  reviewerStaffId?: string;
  reviewerStaffNameAr?: string;
  decision: 'pending' | 'approved' | 'rejected' | 'returned_for_revision';
  decisionTimestamp?: string;
  comments?: string;
}

export interface PurchaseRequisition {
  id: string;                         // e.g. "PR-2026-00101"
  requisitionNumber: string;
  branchId: ProcurementBranchId;
  requestingDepartmentId: string;     // e.g. "ICU", "ER", "PHARMACY", "BIOMEDICAL"
  requestingDepartmentNameAr: string;
  requestingDepartmentNameEn: string;
  requesterStaffId: string;
  requesterNameAr: string;
  requesterNameEn: string;
  requesterRoleTitle: string;
  costCenterCode: string;
  budgetAccountCode?: string;
  budgetStatus: 'funds_available' | 'budget_exhausted' | 'pending_finance_review' | 'not_tracked';
  priority: RequisitionPriority;
  requiredDate: string;
  businessJustificationAr: string;
  businessJustificationEn: string;
  status: PurchaseRequisitionStatus;
  lines: PurchaseRequisitionLine[];
  estimatedTotalValueSar: number;
  approvalHistory: RequisitionApprovalRecord[];
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// ============================================================================
// 4. SOURCING EVENTS (RFQ, TENDER, DIRECT)
// ============================================================================

export type SourcingEventStatus = 
  | 'draft'
  | 'approved_to_publish'
  | 'published_awaiting_bids'
  | 'bidding_closed'
  | 'under_evaluation'
  | 'awarded'
  | 'cancelled';

export interface SourcingEventLine {
  id: string;
  sourcingEventId: string;
  sourceRequisitionId: string;
  sourceRequisitionLineId: string;
  itemType: SourcingItemType;
  catalogItemId?: string;
  itemCode: string;
  descriptionAr: string;
  descriptionEn: string;
  targetQuantity: number;
  targetUom: UomType;
  deliveryLocationId: string;
  targetDeliveryDate: string;
  technicalSpecificationsAr: string;
  technicalSpecificationsEn: string;
}

export interface SupplierInvitation {
  supplierId: string;
  invitedAt: string;
  transmissionMethod: 'synthetic_email' | 'portal_invitation' | 'direct_handover';
  invitationStatus: 'prepared' | 'simulated_sent' | 'receipt_unconfirmed' | 'acknowledged' | 'quotation_received' | 'declined' | 'no_response';
  acknowledgedAt?: string;
  declineReason?: string;
}

export interface SourcingEvent {
  id: string;                         // e.g. "SRC-2026-RFQ-01"
  sourcingNumber: string;
  titleAr: string;
  titleEn: string;
  method: ProcurementMethod;
  status: SourcingEventStatus;
  branchId: ProcurementBranchId;
  category: SupplierCategory;
  responsibleBuyerStaffId: string;
  responsibleBuyerNameAr: string;
  publishDate?: string;
  submissionDeadline: string;
  invitedSuppliers: SupplierInvitation[];
  lines: SourcingEventLine[];
  evaluationCriteria: {
    id: string;
    nameAr: string;
    nameEn: string;
    weightPercent: number; // e.g. 40% technical, 60% commercial
    category: 'technical' | 'commercial' | 'delivery_compliance' | 'quality_assurance';
  }[];
  isEmergencyException?: boolean;
  emergencyJustification?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 5. SUPPLIER QUOTATIONS & BID EVALUATION
// ============================================================================

export interface QuotationLine {
  id: string;
  quotationId: string;
  sourcingLineId: string;
  supplierItemCode?: string;
  quotedDescriptionAr: string;
  quotedDescriptionEn: string;
  quotedPackaging: string;            // e.g. "Box of 50 each"
  quotedUom: UomType;
  quotedQuantity: number;
  quotedUnitPrice: number;
  quotedLineSubtotal: number;
  applicableTaxPercent: number;       // e.g. 15% VAT, or 0% for zero-rated medical
  quotedLineTotal: number;
  
  // Normalization to Base UOM for Commercial Comparison:
  normalizedBaseUom: UomType;
  normalizedBaseQuantity: number;
  normalizedUnitPriceSar: number;     // Normalized price per single Base UOM in SAR
  uomConversionVerified: boolean;
  uomConversionFactor: number;        // e.g. 50
  
  leadTimeDays: number;
  offeredDeliveryDate: string;
  brandOrManufacturer: string;
  countryOfOrigin?: string;
  warrantyPeriodMonths?: number;
  technicalComplianceNotes?: string;
}

export interface SupplierQuotation {
  id: string;                         // e.g. "QUOTE-2026-0041"
  sourcingEventId: string;
  supplierId: string;
  quotationReferenceNumber: string;   // Supplier's official quote #
  quotationDate: string;
  validUntilDate: string;
  currency: 'SAR' | 'USD' | 'EUR';
  exchangeRateToSar: number;          // e.g. 1.0 for SAR, 3.75 for USD
  exchangeRateDate?: string;
  lines: QuotationLine[];
  totalQuotedAmountNative: number;
  totalQuotedAmountSar: number;
  paymentTerms: string;
  deliveryTerms: string;              // e.g. "DDP Hospital Dock", "FOB Destination"
  completenessStatus: 'complete' | 'incomplete_missing_data' | 'disqualified';
  incompletenessReasons?: string[];
  submittedAt: string;
  attachments?: string[];
}

export interface TechnicalEvaluationFinding {
  criterionId: string;
  scoreOutOf100: number;
  isCompliant: boolean;
  specialistNotesAr: string;
  specialistNotesEn: string;
  evaluatedByStaffName: string;
}

export interface BidEvaluationSheet {
  id: string;
  sourcingEventId: string;
  supplierId: string;
  quotationId: string;
  
  // Technical Evaluation:
  technicalEvaluationStatus: 'pending' | 'compliant' | 'non_compliant' | 'conditional';
  technicalScore: number;             // Out of 100
  specialtyApprovalReference?: string;// e.g. "PHARM-TECH-APPR-441"
  technicalFindings: TechnicalEvaluationFinding[];
  
  // Commercial Evaluation:
  commercialEvaluationStatus: 'under_review' | 'evaluated' | 'disqualified';
  commercialScore: number;            // Out of 100
  totalEvaluatedCostSar: number;
  normalizedUnitCostSummary: string;
  
  // Aggregate:
  weightedTotalScore: number;
  ranking: number;
  isRecommendedForAward: boolean;
  recommendationRationale?: string;
}

export interface AwardDecisionRecord {
  id: string;
  sourcingEventId: string;
  winningSupplierId: string;
  winningQuotationId: string;
  awardedLines: {
    sourcingLineId: string;
    quotationLineId: string;
    awardedQuantity: number;
    awardedUnitPriceSar: number;
    awardedTotalSar: number;
  }[];
  totalAwardValueSar: number;
  authorizedByStaffId: string;
  authorizedByStaffNameAr: string;
  decisionDate: string;
  awardJustificationAr: string;
  awardJustificationEn: string;
  status: 'recommended' | 'formally_awarded' | 'cancelled';
  purchaseOrderGeneratedId?: string;
}

// ============================================================================
// 6. PURCHASE ORDERS (PO) & LIFECYCLE
// ============================================================================

export type PurchaseOrderDocumentStatus = 
  | 'draft'
  | 'submitted_pending_approval'
  | 'approved'
  | 'rejected'
  | 'under_amendment'
  | 'superseded'
  | 'cancelled';

export type SupplierCommunicationStatus = 
  | 'not_sent'
  | 'prepared'
  | 'simulated_sent'
  | 'receipt_unconfirmed'
  | 'acknowledged'
  | 'rejected_change_requested';

export type PurchaseOrderFulfillmentStatus = 
  | 'not_started'
  | 'partially_shipped'
  | 'fully_shipped'
  | 'partially_received'
  | 'fully_received'
  | 'partially_accepted'
  | 'fully_accepted_resolved'
  | 'commercially_closed';

export interface PurchaseOrderLine {
  id: string;                         // e.g. "POL-2026-001"
  poId: string;
  lineNumber: number;
  sourceRequisitionId?: string;
  sourceRequisitionLineId?: string;
  sourcingLineId?: string;
  catalogItemId?: string;
  itemCode: string;
  itemDescriptionAr: string;
  itemDescriptionEn: string;
  orderedPackaging: string;
  orderedUom: UomType;
  
  // Discrete Unit Quantities (Mutually Non-Overlapping Lifecycle Stages):
  originalOrderedQuantity: number;
  revisedOrderedQuantity: number;     // Current valid commitment
  cancelledRemainingQuantity: number; // Formally cancelled via approved amendment
  
  supplierAcknowledgedQuantity: number;
  reportedShippedQuantity: number;    // From ASN / DN
  physicallyReceivedQuantity: number; // Dock GRN receipts
  qaAcceptedQuantity: number;         // Passed inspection, entered stock
  qaRejectedQuantity: number;         // Quarantined / Damaged
  
  unitPriceSar: number;
  applicableVatRatePercent: number;   // e.g. 15 or 0
  netAmountSar: number;               // orderedQty * unitPrice
  vatAmountSar: number;
  totalAmountSar: number;
  
  deliveryLocationId: string;         // Warehouse dock bin
  requestedDeliveryDate: string;
  supplierConfirmedDeliveryDate?: string;
  lineFulfillmentStatus: 'open' | 'partially_received' | 'fully_received' | 'cancelled';
}

export interface PurchaseOrderRevision {
  revisionNumber: number;
  amendmentReasonAr: string;
  amendmentReasonEn: string;
  requestedByStaffName: string;
  approvedByStaffName: string;
  amendmentDate: string;
  previousTotalSar: number;
  revisedTotalSar: number;
  amendedLines: {
    lineId: string;
    oldQuantity: number;
    newQuantity: number;
    oldPriceSar: number;
    newPriceSar: number;
  }[];
}

export interface PurchaseOrder {
  id: string;                         // e.g. "PO-2026-MED-101"
  poNumber: string;
  revisionNumber: number;
  branchId: ProcurementBranchId;
  supplierId: string;
  supplierNameAr: string;
  supplierNameEn: string;
  supplierTaxNumber: string;
  supplierAddress: string;
  sourceSourcingEventId?: string;
  sourceAwardId?: string;
  sourceFrameworkContractId?: string;
  
  // Triple-Axis Lifecycle:
  documentStatus: PurchaseOrderDocumentStatus;
  communicationStatus: SupplierCommunicationStatus;
  fulfillmentStatus: PurchaseOrderFulfillmentStatus;
  
  orderDate: string;
  expectedDeliveryDate: string;
  supplierConfirmedDeliveryDate?: string;
  deliveryDestinationLocationId: string;
  paymentTerms: string;
  deliveryTerms: string;
  currency: 'SAR';
  
  lines: PurchaseOrderLine[];
  subtotalAmountSar: number;
  vatAmountSar: number;
  totalAmountSar: number;
  
  revisions: PurchaseOrderRevision[];
  approvalRecord?: {
    approvedByStaffName: string;
    approvedAt: string;
    approvalComments?: string;
  };
  transmissionRecord?: {
    transmittedAt: string;
    transmissionMethod: 'synthetic_edi' | 'synthetic_email' | 'portal';
    transmittedByStaffName: string;
  };
  acknowledgmentRecord?: {
    acknowledgedAt: string;
    supplierContactName: string;
    confirmedDeliveryDate: string;
    acknowledgmentNotes?: string;
  };
  simulatedSentTimestamp?: string;
  supplierAcknowledgmentTimestamp?: string;
  promisedDeliveryDate?: string;
  notes?: string;
}

export type Quotation = SupplierQuotation;
export type ClaimType = SupplierClaimType;
export type ClaimStatus = SupplierClaimStatus;
export type QualificationStatus = SupplierQualificationStatus;

// ============================================================================
// 7. COMMERCIAL CLAIMS & RETURN TO VENDOR
// ============================================================================

export type SupplierClaimType = 'replacement_goods' | 'credit_note' | 'commercial_refund' | 'price_adjustment';

export type SupplierClaimStatus = 
  | 'claim_draft'
  | 'submitted_to_supplier'
  | 'supplier_acknowledged'
  | 'replacement_shipped'
  | 'credit_note_received_in_finance'
  | 'commercially_resolved'
  | 'rejected_by_supplier';

export interface SupplierClaim {
  id: string;                         // e.g. "CLM-2026-001"
  claimNumber: string;
  poId: string;
  poNumber: string;
  supplierId: string;
  supplierNameAr: string;
  inventoryReceiptReferenceId?: string; // Links to GoodsReceiptRecord.id
  quarantineRecordReferenceId?: string; // Links to quarantined lot
  claimType: SupplierClaimType;
  status: SupplierClaimStatus;
  claimDate: string;
  claimedLine: {
    itemCode: string;
    itemDescriptionAr: string;
    lotNumber?: string;
    claimedQuantity: number;
    claimedUom: UomType;
    estimatedValueSar: number;
  };
  discrepancyReasonAr: string;
  discrepancyReasonEn: string;
  supplierResponseNotes?: string;
  resolvedAt?: string;
  creditNoteReferenceNumber?: string; // From finance when credit note arrives
}

// ============================================================================
// 8. CONTRACTS & FRAMEWORK AGREEMENTS
// ============================================================================

export interface ContractedItemPrice {
  catalogItemId: string;
  itemCode: string;
  itemDescriptionAr: string;
  itemDescriptionEn: string;
  contractedPackaging: string;
  contractedUom: UomType;
  agreedUnitPriceSar: number;
  standardLeadTimeDays: number;
  minimumOrderQuantity?: number;
}

export interface FrameworkAgreement {
  id: string;                         // e.g. "LTA-2026-NUPCO-01"
  contractNumber: string;
  titleAr: string;
  titleEn: string;
  agreementType: 'nupco_unified_tender' | 'hospital_direct_lta' | 'group_purchasing_contract';
  supplierId: string;
  supplierNameAr: string;
  supplierNameEn: string;
  effectiveDate: string;
  expiryDate: string;
  isExpired: boolean;
  contractCeilingValueSar: number;
  utilizedValueSar: number;
  remainingCeilingSar: number;
  contractOwnerStaffName: string;
  status: 'active' | 'approaching_expiry' | 'expired' | 'suspended';
  contractedItems: ContractedItemPrice[];
  callOffOrdersCount: number;
  notes?: string;
}
