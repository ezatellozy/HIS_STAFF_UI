import React, { useState } from 'react';
import {
  Bed,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  UserCheck,
  Building,
  ShieldAlert,
  ArrowRight,
  Filter,
  CheckCheck,
  XCircle,
  HelpCircle,
  Zap,
  Activity,
  Check,
  ChevronDown
} from 'lucide-react';
import {
  AdmissionRequestEntity,
  BedLocationEntity,
  EncounterEntity,
  PatientAccessRecord
} from '../../types/patientAccessAdt';

interface AdmissionOpsViewProps {
  admissionRequests: AdmissionRequestEntity[];
  beds: BedLocationEntity[];
  onAcceptRequest: (requestId: string) => void;
  onAssignBedToRequest: (requestId: string, bedId: string, bedNumber: string, unitName: string) => void;
  onFinalizeAdmission: (requestId: string) => void;
  onOpenPatientWorkspace: (mrn: string, encounterId?: string) => void;
}

export const AdmissionOpsView: React.FC<AdmissionOpsViewProps> = ({
  admissionRequests,
  beds,
  onAcceptRequest,
  onAssignBedToRequest,
  onFinalizeAdmission,
  onOpenPatientWorkspace
}) => {
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<AdmissionRequestEntity | null>(
    admissionRequests[0] || null
  );
  const [isAssignBedModalOpen, setIsAssignBedModalOpen] = useState(false);
  const [selectedBedId, setSelectedBedId] = useState<string>('');

  // Filter requests
  const filteredRequests = admissionRequests.filter(req => {
    if (filterUrgency !== 'all' && req.urgency !== filterUrgency) return false;
    if (filterDepartment !== 'all' && req.sourceDepartment !== filterDepartment) return false;
    return true;
  });

  // Eligible available beds for assignment
  const availableBeds = beds.filter(b => b.state === 'available' || b.state === 'reserved');

  const handleOpenAssignModal = (req: AdmissionRequestEntity) => {
    setSelectedRequest(req);
    setIsAssignBedModalOpen(true);
    // Find first available bed matching care level
    const firstMatch = availableBeds.find(b => {
      if (req.requestedCareLevel === 'icu' && !b.unitName.includes('العناية')) return false;
      return true;
    });
    setSelectedBedId(firstMatch?.id || availableBeds[0]?.id || '');
  };

  const handleConfirmBedAssignment = () => {
    if (!selectedRequest || !selectedBedId) return;
    const targetBed = beds.find(b => b.id === selectedBedId);
    if (!targetBed) return;
    onAssignBedToRequest(
      selectedRequest.id,
      targetBed.id,
      targetBed.bedNumber,
      targetBed.unitName
    );
    setIsAssignBedModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Conceptual Invariant */}
      <div className="bg-gradient-to-r from-blue-950 to-indigo-900 text-white rounded-2xl p-5 border border-blue-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>الفصل العملياتي: طلب التنويم (Admission Request) ≠ التنويم الفعلي (Admission) ≠ تخصيص السرير</span>
          </div>
          <h2 className="text-xl font-black text-white">مكتب التنسيق وقبول المرضى وإدارة طلبات التنويم (Bed Coordination)</h2>
          <p className="text-xs text-blue-200 mt-1 max-w-3xl leading-relaxed">
            <strong>قيود التسكين المهيأة:</strong> التحقق من متطلبات العزل، مطابقة الجنس، ومستوى الرعاية يتم بناءً على سياسات المنشأة المهيأة (Configured Placement Constraints).<br />
            <strong>اقتراح الأسرة:</strong> واجهة مساعدة استرشادية فقط (Assistive UX Only) ولا تتخذ قرارات آلية ملزمة للمنسق.<br />
            <strong>طبيعة القائمة:</strong> هذه شاشة تنسيق عملياتي لتدفق المنشأة، وليست صندوق مهام الطبيب الشخصي (My Work Inbox).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="bg-white/10 px-4 py-2 rounded-xl text-center border border-white/10">
            <span className="text-[11px] text-blue-200 block">طلبات بانتظار السرير</span>
            <strong className="text-xl font-black text-amber-300">
              {admissionRequests.filter(r => r.placementStatus === 'unassigned').length}
            </strong>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl text-center border border-white/10">
            <span className="text-[11px] text-blue-200 block">جاهز للدخول الفعلي</span>
            <strong className="text-xl font-black text-emerald-300">
              {admissionRequests.filter(r => r.placementStatus === 'bed_reserved' || r.placementStatus === 'bed_assigned').length}
            </strong>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>تصفية الطلبات:</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto text-xs">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">درجة الاستعجال:</span>
            <select
              value={filterUrgency}
              onChange={e => setFilterUrgency(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-700 focus:outline-none"
            >
              <option value="all">كافة الدرجات</option>
              <option value="stat">طارئ حرج (STAT)</option>
              <option value="urgent">عاجل (Urgent)</option>
              <option value="routine">روتيني مجدول (Routine)</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-400">القسم الطالب:</span>
            <select
              value={filterDepartment}
              onChange={e => setFilterDepartment(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-700 focus:outline-none"
            >
              <option value="all">كافة الأقسام</option>
              <option value="er">الطوارئ والحوادث (ER)</option>
              <option value="opd">العيادات الخارجية (OPD)</option>
              <option value="icu">العناية المركزة (ICU)</option>
              <option value="or">العمليات والإفاقة (OR)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Admission Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            لا توجد طلبات تنويم تطابق الفلتر المحدد
          </div>
        ) : (
          filteredRequests.map(req => {
            const isStat = req.urgency === 'stat';
            const isUrgent = req.urgency === 'urgent';
            const isAssigned = req.placementStatus === 'bed_reserved' || req.placementStatus === 'bed_assigned';
            const isAdmitted = req.placementStatus === 'admitted';

            return (
              <div
                key={req.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-sm space-y-4 ${
                  isStat
                    ? 'border-red-300 bg-red-50/20'
                    : isUrgent
                    ? 'border-amber-300 bg-amber-50/15'
                    : 'border-slate-200'
                }`}
              >
                {/* Header Line */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {req.requestNumber}
                    </span>
                    <h4 className="text-base font-black text-slate-900">{req.patientNameAr}</h4>
                    <span className="font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
                      {req.mrn}
                    </span>

                    {/* Urgency Badge */}
                    {isStat ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-black flex items-center gap-1 border border-red-300 animate-pulse">
                        <Zap className="w-3.5 h-3.5 text-red-600" />
                        حرج جداً (STAT)
                      </span>
                    ) : isUrgent ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
                        عاجل (Urgent)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                        روتيني (Routine)
                      </span>
                    )}

                    {/* Department Badge */}
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold">
                      مصدر الطلب: {req.sourceDepartment.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      وُرد الطلب: {req.submittedAt}
                    </span>
                  </div>
                </div>

                {/* Details Grid: Clinical Summary, Care Level, Equipment, Placement */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                  {/* Summary & Medical Needs (7 cols) */}
                  <div className="md:col-span-7 space-y-2.5">
                    <div>
                      <span className="text-slate-400 block text-[11px]">الملخص السريري ومبرر التنويم:</span>
                      <p className="text-slate-800 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-0.5">
                        {req.clinicalSummaryRef}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-slate-600 flex-wrap">
                      <span>الخدمة المطلوبة: <strong className="text-slate-900 font-bold">{req.requestedService}</strong></span>
                      <span>مستوى الرعاية: <strong className="text-slate-900 font-bold">
                        {req.requestedCareLevel === 'icu' ? 'عناية مركزة (ICU)' : req.requestedCareLevel === 'step_down' ? 'رعاية وسيطة (Step-down)' : 'جناح عام'}
                      </strong></span>
                      <span>الوصول المتوقع: <strong className="font-mono text-slate-900">{req.expectedArrival}</strong></span>
                    </div>

                    {/* Requirements & Isolation */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {req.isolationRequired && (
                        <span className="px-2 py-1 rounded-lg bg-purple-100 text-purple-900 border border-purple-300 text-[11px] font-bold flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />
                          عزل وقائي ({req.isolationType})
                        </span>
                      )}
                      {req.equipmentRequirements.map((eq, i) => (
                        <span key={i} className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Operational Placement Status (5 cols) */}
                  <div className="md:col-span-5 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-slate-500 font-bold">حالة التسكين (Placement):</span>
                        {isAdmitted ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
                            تم التنويم الفعلي (Admitted)
                          </span>
                        ) : isAssigned ? (
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px] border border-blue-300">
                            تم حجز وتخصيص السرير
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-300">
                            بانتظار تخصيص سرير (Unassigned)
                          </span>
                        )}
                      </div>

                      {req.plannedBedNumber ? (
                        <div className="p-2.5 rounded-lg bg-white border border-blue-200 text-xs space-y-0.5">
                          <div className="font-bold text-blue-900">
                            السرير المخصص: {req.plannedBedNumber}
                          </div>
                          <div className="text-[11px] text-blue-700">
                            القسم: {req.plannedUnitName}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                          لم يتم تعيين سرير بعد. يرجى مراجعة وتخصيص سرير مناسب.
                        </div>
                      )}
                    </div>

                    {/* Operational Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200 flex-wrap">
                      {req.requestStatus === 'submitted' && (
                        <button
                          onClick={() => onAcceptRequest(req.id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm cursor-pointer"
                        >
                          قبول واعتماد الطلب
                        </button>
                      )}

                      {!isAssigned && !isAdmitted && (
                        <button
                          onClick={() => handleOpenAssignModal(req)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer flex items-center gap-1"
                        >
                          <Bed className="w-3.5 h-3.5" />
                          <span>تخصيص سرير (Assign Bed)</span>
                        </button>
                      )}

                      {isAssigned && !isAdmitted && (
                        <button
                          onClick={() => onFinalizeAdmission(req.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCheck className="w-4 h-4" />
                          <span>إتمام التنويم الفعلي بالقسم (Admit)</span>
                        </button>
                      )}

                      <button
                        onClick={() => onOpenPatientWorkspace(req.mrn, req.encounterId)}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer"
                      >
                        السجل السريري
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Bed Assignment Selector with Clinical Suitability Validation */}
      {isAssignBedModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Bed className="w-5 h-5 text-blue-600" />
                  تخصيص سرير للمريض: {selectedRequest.patientNameAr}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  رقم الملف: <strong className="font-mono text-blue-700">{selectedRequest.mrn}</strong> | الخدمة المطلوبة: {selectedRequest.requestedService}
                </p>
              </div>
              <button
                onClick={() => setIsAssignBedModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Suitability Requirements Box (Assistive Matching) */}
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-blue-900 block">معايير الملاءمة المهيأة (Configured Constraints):</strong>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                  مساعد استرشادي فقط (Assistive UX Only)
                </span>
              </div>
              <div className="flex items-center gap-4 text-blue-800 flex-wrap">
                <span>الجنس: <strong>{selectedRequest.patientGender === 'male' ? 'ذكر' : 'أنثى'}</strong></span>
                <span>المستوى: <strong>{selectedRequest.requestedCareLevel}</strong></span>
                {selectedRequest.isolationRequired && (
                  <span className="text-purple-700 font-bold">عزل: {selectedRequest.isolationType}</span>
                )}
              </div>
            </div>

            {/* Bed Options */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {availableBeds.map(bed => {
                const isSelected = selectedBedId === bed.id;
                const isIcuMismatch = selectedRequest.requestedCareLevel === 'icu' && !bed.unitName.includes('العناية');
                const isGenderMismatch = bed.genderSuitability !== 'any' && bed.genderSuitability !== selectedRequest.patientGender;

                return (
                  <div
                    key={bed.id}
                    onClick={() => setSelectedBedId(bed.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/80 shadow-sm ring-1 ring-blue-500/30'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="font-mono text-sm text-slate-900 font-bold">{bed.bedNumber}</strong>
                          <span className="text-xs text-slate-600">({bed.unitName})</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            جاهز ونظيف (Clean)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                          <span>الموقع: {bed.floor} - غرفة {bed.roomNumber}</span>
                          <span>ملاءمة الجنس: {bed.genderSuitability === 'any' ? 'مشترك' : bed.genderSuitability === 'male' ? 'رجال' : 'نساء'}</span>
                          {bed.isNegativePressure && <span className="text-purple-700 font-bold">ضغط سالب (عزل)</span>}
                        </div>
                      </div>

                      {/* Suitability flags */}
                      <div className="text-left">
                        {isIcuMismatch ? (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            جناح عادي (المطلوب ICU)
                          </span>
                        ) : isGenderMismatch ? (
                          <span className="text-[10px] text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            عدم تطابق جنس الجناح
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            ملائم سريرياً
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                الحجز يمنع تعيين السرير لمريض آخر حتى وصول الحالة
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAssignBedModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleConfirmBedAssignment}
                  disabled={!selectedBedId}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50"
                >
                  تأكيد حجز وتخصيص السرير
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
