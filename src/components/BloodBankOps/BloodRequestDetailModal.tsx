import React from 'react';
import {
  X,
  Droplet,
  User,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Tag,
  Calendar,
  Layers,
  FlaskConical,
  HeartPulse,
  ExternalLink
} from 'lucide-react';
import { BloodProductRequest, BloodProductUnit } from '../../types/bloodBankOps';

interface BloodRequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: BloodProductRequest | null;
  allUnits?: BloodProductUnit[];
  onOpenSampleWorkspace?: (sampleId: string) => void;
  onOpenCompatibilityWorkspace?: (requestId: string) => void;
  onOpenAllocationModal?: (request: BloodProductRequest) => void;
  onOpenIssueModal?: (request: BloodProductRequest) => void;
  onOpenPatientWorkspace?: (patientId: string) => void;
}

export const BloodRequestDetailModal: React.FC<BloodRequestDetailModalProps> = ({
  isOpen,
  onClose,
  request,
  allUnits = [],
  onOpenSampleWorkspace,
  onOpenCompatibilityWorkspace,
  onOpenAllocationModal,
  onOpenIssueModal,
  onOpenPatientWorkspace
}) => {
  if (!isOpen || !request) return null;

  const allocatedUnits = (allUnits || []).filter(u => (request.allocatedUnitIds || []).includes(u.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30">
              <Droplet className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">تفاصيل طلب نقل الدم ومشتقاته</h3>
                <span className="font-mono text-xs text-red-300 font-bold bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
                  {request.id}
                </span>
                {request.priority === 'stat_emergency' && (
                  <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[11px] font-bold animate-pulse">
                    🚨 طوارئ قصوى (STAT)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تاريخ الطلب: {request.requestedAt} • المصلحة الطالبة: {request.requestingDepartment}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Patient Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 border border-red-200 flex items-center justify-center font-bold text-red-800 text-sm">
                {request.patientHistoricalBloodGroup?.abo ? `${request.patientHistoricalBloodGroup.abo}${request.patientHistoricalBloodGroup.rh === 'positive' ? '+' : '-'}` : '?'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{request.patientName}</span>
                  <span className="text-xs text-slate-500">({request.patientNameEn})</span>
                </div>
                <div className="text-[11px] text-slate-600 flex items-center gap-3 mt-0.5">
                  <span>الملف: <strong className="font-mono text-slate-800">{request.mrn}</strong></span>
                  <span>•</span>
                  <span>الموقع: <strong className="text-slate-800">{request.locationWardBed}</strong></span>
                  <span>•</span>
                  <span>العمر/الجنس: {request.patientAge} سنة ({request.patientGender === 'male' ? 'ذكر' : 'أنثى'})</span>
                </div>
              </div>
            </div>

            {onOpenPatientWorkspace && (
              <button
                onClick={() => onOpenPatientWorkspace(request.patientId)}
                className="px-3 py-1.5 rounded-lg bg-white border border-teal-300 text-teal-800 hover:bg-teal-50 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فتح ملف المريض السريري</span>
              </button>
            )}
          </div>

          {/* Clinical Context & Indication */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <span className="text-slate-500 font-bold text-[11px] block">المشتق والكمية المطلوبة:</span>
              <div className="text-sm font-bold text-red-900">{request.componentNameAr}</div>
              <div className="text-xs text-slate-600">الكمية: <strong>{request.requestedQuantity} {request.quantityUnit}</strong></div>
              <div className="text-xs text-slate-600">وقت الاحتياج: <strong>{request.requiredByTime}</strong></div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <span className="text-slate-500 font-bold text-[11px] block">المؤشرات المخبرية والسريرية:</span>
              <div className="text-xs text-slate-700">التشخيص: <strong>{request.patientPrimaryDiagnosis}</strong></div>
              <div className="text-xs text-slate-700">
                الهيموجلوبين الأساسي: <strong className="font-mono text-red-700">{request.hemoglobinBaseline || 'غير محدد'}</strong>
              </div>
              {request.plateletBaseline && (
                <div className="text-xs text-slate-700">
                  الصفائح: <strong className="font-mono text-purple-700">{request.plateletBaseline}</strong>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
              <span className="text-slate-500 font-bold text-[11px] block">الطبيب المصرح والمصادقة:</span>
              <div className="text-xs font-bold text-slate-900">{request.requestingClinician}</div>
              <div className="text-[11px] text-slate-600">{request.requestingRole}</div>
              <div className="text-[11px] text-slate-600">{request.requestingDepartment}</div>
            </div>
          </div>

          {/* Special Requirements & Attributes */}
          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-950 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-700" />
                <span>المتطلبات الخاصة بالمشتق (Special Requirements & Phenotype matching):</span>
              </span>
              <span className="text-[11px] text-purple-800 font-medium">سياسة السلامة والمناعة التراكمية</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {request.specialRequirements.map(req => (
                <span key={req} className="px-2.5 py-1 rounded-lg bg-white text-purple-900 border border-purple-300 font-bold text-xs shadow-2xs">
                  {req === 'irradiated' ? 'مشعع (Irradiated) لمنع TA-GvHD' :
                   req === 'leukocyte_reduced' ? 'مفلتر الكريات البيضاء (Leukoreduced)' :
                   req === 'washed' ? 'مغسول بالكامل (Washed)' :
                   req === 'cmv_negative' ? 'سالب لفيروس المضخم للخلايا (CMV-Negative)' :
                   req === 'antigen_negative' ? 'سالب لمستضدات محددة (Antigen-Negative)' :
                   req === 'phenotype_matched' ? 'مطابقة فينوتيبية ممتدة (Phenotype Matched)' : req}
                </span>
              ))}
            </div>

            {request.specialInstructions && (
              <p className="text-xs text-purple-900 mt-2 bg-white/80 p-2.5 rounded-lg border border-purple-200 font-medium">
                تعليمات الطبيب المصرح: {request.specialInstructions}
              </p>
            )}
          </div>

          {/* Operational Progress Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] text-slate-500 block mb-1">حالة عينة ما قبل النقل:</span>
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800 text-xs">
                  {request.sampleStatus === 'received_valid' ? 'مستلمة وصالحة' :
                   request.sampleStatus === 'expiring_soon' ? 'تنتهي قريباً' :
                   request.sampleStatus === 'collected_in_transit' ? 'مسحوبة في الطريق' : 'بانتظار العينة'}
                </span>
              </div>
              {request.linkedSampleId && onOpenSampleWorkspace && (
                <button
                  onClick={() => onOpenSampleWorkspace(request.linkedSampleId!)}
                  className="mt-2 text-[11px] text-blue-600 hover:text-blue-800 font-bold underline block"
                >
                  عرض سجل العينة ({request.linkedSampleId})
                </button>
              )}
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] text-slate-500 block mb-1">حالة فحص التوافق والمطابقة:</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800 text-xs">
                  {request.compatibilityStatus === 'compatible' ? 'متطابق بالكامل (Compatible)' :
                   request.compatibilityStatus === 'emergency_released' ? 'صرف طارئ غير متوافق' :
                   request.compatibilityStatus === 'testing' ? 'الفحص جاري' : 'لم يبدأ'}
                </span>
              </div>
              {onOpenCompatibilityWorkspace && (
                <button
                  onClick={() => onOpenCompatibilityWorkspace(request.id)}
                  className="mt-2 text-[11px] text-teal-600 hover:text-teal-800 font-bold underline block"
                >
                  سجل التوافق والمطابقة
                </button>
              )}
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] text-slate-500 block mb-1">الوحدات المخصصة والصرف:</span>
              <div className="text-xs font-bold text-slate-900">
                {request.allocatedUnitIds.length} من {request.requestedQuantity} وحدة مخصصة
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                المصروف سريرياً: {request.issuedUnitIds.length} وحدة
              </div>
            </div>
          </div>

          {/* Allocated Units List */}
          {allocatedUnits.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-slate-900 text-xs block">الوحدات المخصصة لهذا الطلب:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allocatedUnits.map(unit => (
                  <div key={unit.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="font-mono font-bold text-slate-900 text-xs">{unit.unitNumber}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        فصيلة: <strong>{unit.bloodGroup.displayAr}</strong> • حجم: {unit.volumeMl} mL
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        صلاحية حتى: {unit.expiryDate} • {unit.storageLocation}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                      unit.status === 'issued' ? 'bg-blue-100 text-blue-800' :
                      unit.status === 'ready_for_issue' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {unit.status === 'issued' ? 'تم الصرف' : unit.status === 'ready_for_issue' ? 'جاهز للصرف' : 'مخصص'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Actions */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            ملاحظة: الإعطاء الفعلي للدم بجانب السرير وتوثيق العلامات الحيوية يتم حصرياً في ملف المريض السريري.
          </span>
          <div className="flex items-center gap-2">
            {onOpenAllocationModal && request.allocatedUnitIds.length < request.requestedQuantity && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAllocationModal(request);
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shadow-2xs"
              >
                تخصيص وحدات من المخزون
              </button>
            )}
            {onOpenIssueModal && request.allocatedUnitIds.length > 0 && request.issuedUnitIds.length < request.allocatedUnitIds.length && (
              <button
                onClick={() => {
                  onClose();
                  onOpenIssueModal(request);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-2xs"
              >
                صرف وتسليم المشتق للقسم
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
