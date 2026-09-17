import { Patient, Appointment, ConsultationRecord, LabOrder, NphiesEligibility, NphiesPreAuth, NphiesClaim } from '../types/his';

/**
 * NPHIES (National Platform for Health Information Exchange Services)
 * Universal Health Insurance & Unified Exchange Engine
 */

export function verifyNphiesEligibility(patient: Patient): NphiesEligibility {
  const timestamp = new Date().toISOString();
  const isCash = patient.insuranceClass === 'Cash' || patient.insuranceProvider.includes('نقدي');

  if (isCash) {
    return {
      status: 'ineligible',
      inquiryId: `NPH-INQ-${Date.now().toString().slice(-6)}`,
      verificationTimestamp: timestamp,
      payerName: 'سداد نقدي مباشر (Self-Pay)',
      policyNumber: 'N/A',
      memberId: patient.nationalId,
      coveragePlan: 'دفع ذاتي بدون تغطية تأمينية',
      class: 'Standard',
      patientCoPayPercent: 100,
      maxAnnualBenefit: 0,
      remainingBenefit: 0,
      isPreAuthRequired: false,
      limitations: ['لا توجد تغطية تأمينية للمريض']
    };
  }

  // Active policy calculation
  const coPay = 100 - patient.insuranceCoveragePercent;
  const isVip = patient.insuranceClass === 'VIP';
  const remaining = isVip ? 450000 : 185000;

  return {
    status: 'eligible',
    inquiryId: `NPH-ELIG-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    verificationTimestamp: timestamp,
    payerName: patient.insuranceProvider,
    tpaName: 'منصة نفيس الموحدة (NPHIES Gateway API)',
    policyNumber: patient.insurancePolicyNo,
    memberId: `MBR-${patient.nationalId.slice(-6)}`,
    coveragePlan: `وثيقة التأمين الطبي المعتمدة - الفئة (${patient.insuranceClass})`,
    class: patient.insuranceClass === 'VIP' ? 'VIP' : patient.insuranceClass === 'A' ? 'Class A' : 'Class B',
    patientCoPayPercent: coPay,
    maxAnnualBenefit: isVip ? 500000 : 250000,
    remainingBenefit: remaining,
    isPreAuthRequired: true,
    limitations: [
      'الأدوية التخصصية تقتضي وصفة طبيب استشاري',
      'الفحوصات الإشعاعية المتقدمة (رنين/مقطعية) تتطلب موافقة مسبقة (Pre-Auth)'
    ]
  };
}

/**
 * Checks if a clinical diagnostic order or procedure requires NPHIES Pre-Auth
 */
export function evaluatePreAuthNeed(serviceCode: string, testName: string, category: string): boolean {
  const highTierCodes = ['SBS-93306', 'RAD-MRI-01', 'RAD-CT-02', 'CARD-ANGIO', 'SBS-ECHO'];
  if (highTierCodes.some(c => serviceCode.toUpperCase().includes(c))) return true;
  if (testName.includes('رنين') || testName.includes('مقطعية') || testName.includes('إيكو') || testName.includes('قسطرة')) {
    return true;
  }
  return false;
}

/**
 * Submit NPHIES Prior-Authorization Request
 */
export function submitNphiesPreAuthRequest(params: {
  patient: Patient;
  appointmentId: string;
  serviceCode: string;
  serviceName: string;
  category: 'radiology' | 'laboratory' | 'procedure' | 'specialized_rx';
  amount: number;
  justification: string;
}): NphiesPreAuth {
  const isApproved = Math.random() > 0.15; // 85% approval simulation
  const coPayPercent = (100 - params.patient.insuranceCoveragePercent) / 100;
  const approvedAmount = isApproved ? params.amount : 0;
  const patientShare = isApproved ? params.amount * coPayPercent : 0;

  return {
    id: `pa-${Date.now()}`,
    preAuthRefNumber: `NPH-PA-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    patientId: params.patient.id,
    appointmentId: params.appointmentId,
    serviceCode: params.serviceCode,
    serviceName: params.serviceName,
    category: params.category,
    status: isApproved ? 'approved' : 'pending_payer',
    requestedAmount: params.amount,
    approvedAmount,
    patientShare,
    requestedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    decisionAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    payerResponseNotes: isApproved
      ? 'تمت الموافقة المسبقة إلكترونياً استناداً للتشخيص السريري المرفق وبنود الوثيقة'
      : 'قيد المراجعة الفنية لدى الطبيب المعتمد لشركة التأمين',
    medicalJustification: params.justification
  };
}
