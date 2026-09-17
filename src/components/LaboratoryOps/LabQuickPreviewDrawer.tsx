import React from 'react';
import {
  X,
  User,
  FlaskConical,
  Clock,
  MapPin,
  AlertTriangle,
  FileText,
  ExternalLink,
  Barcode,
  Layers,
  CheckCircle2,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import {
  IncomingLabOrder,
  LabSpecimen,
  LabAccession,
  MicrobiologyCase,
  PathologyCase
} from '../../types/laboratoryOps';

interface LabQuickPreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  order?: IncomingLabOrder | null;
  specimen?: LabSpecimen | null;
  accession?: LabAccession | null;
  microCase?: MicrobiologyCase | null;
  pathCase?: PathologyCase | null;
  onDeepLinkAxis6: (patientId: string) => void;
  onDeepLinkAxis7: (patientId: string) => void;
}

export const LabQuickPreviewDrawer: React.FC<LabQuickPreviewDrawerProps> = ({
  isOpen,
  onClose,
  order,
  specimen,
  accession,
  microCase,
  pathCase,
  onDeepLinkAxis6,
  onDeepLinkAxis7
}) => {
  if (!isOpen) return null;

  // Derive common metadata
  const patientName =
    order?.patientName ||
    specimen?.patientName ||
    accession?.patientName ||
    microCase?.patientName ||
    pathCase?.patientName ||
    'مريض مجهول';

  const mrn =
    order?.mrn ||
    specimen?.mrn ||
    accession?.mrn ||
    microCase?.mrn ||
    pathCase?.mrn ||
    '—';

  const patientId =
    order?.patientId ||
    specimen?.patientId ||
    accession?.patientId ||
    microCase?.patientId ||
    pathCase?.patientId ||
    '';

  const encounterId =
    order?.encounterId ||
    specimen?.encounterId ||
    accession?.encounterId ||
    microCase?.encounterId ||
    pathCase?.encounterId ||
    '—';

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-full max-w-md bg-slate-900 text-slate-100 shadow-2xl border-r border-slate-700 flex flex-col animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400">المعاينة السريعة للعمليات المخبرية</div>
            <div className="text-sm font-black text-white">Diagnostic Operational Preview</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Patient Safety Banner */}
      <div className="p-4 bg-slate-800/80 border-b border-slate-700 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-sm text-white">{patientName}</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-xs border border-slate-700">
            {mrn}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>الزيارة السريرية: <strong className="text-slate-200 font-mono">{encounterId}</strong></span>
          <span className="text-[11px] text-teal-400">سياق سلامة المريض موثق</span>
        </div>

        {/* Deep link bridges to Patient Workspace */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60">
          <button
            onClick={() => onDeepLinkAxis6(patientId)}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-950/70 hover:bg-blue-900 text-blue-300 border border-blue-800 text-[11px] font-bold transition-all cursor-pointer"
            title="الانتقال إلى المحور 6: طلبات الفحوصات السريرية الأصلية للطبيب"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>طلب الطبيب (Axis 6)</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </button>
          <button
            onClick={() => onDeepLinkAxis7(patientId)}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[11px] font-bold transition-all cursor-pointer"
            title="الانتقال إلى المحور 7: مراجعة الطبيب للنتائج السريرية"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>نتائج الطبيب (Axis 7)</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Main Preview Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Order Details */}
        {order && (
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-700 pb-2">
              <span className="flex items-center gap-1.5 text-blue-400">
                <FileText className="w-4 h-4" />
                <span>الطلب السريري المخبري (Clinical Order)</span>
              </span>
              <span className="font-mono text-slate-400">{order.orderNumber}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">الطبيب الطالب:</span>
                <span className="font-bold text-slate-200">{order.orderingDoctor}</span>
              </div>
              <div>
                <span className="text-slate-400 block">القسم السريري:</span>
                <span className="font-bold text-slate-200">{order.orderingService}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">دواعي الفحص (Clinical Indication):</span>
              <p className="text-slate-200 text-xs bg-slate-900/50 p-2 rounded-lg border border-slate-700/50 mt-1">
                {order.clinicalIndication}
              </p>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">الباقات المطلوبة:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {order.testPanelsRequested.map((p, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-700 text-teal-300 text-[11px] font-medium">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Specimen Details */}
        {specimen && (
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-700 pb-2">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Barcode className="w-4 h-4" />
                <span>بيانات العينة والحاوية (Specimen Context)</span>
              </span>
              <span className="font-mono text-amber-300 font-bold">{specimen.specimenBarcode}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">نوع العينة:</span>
                <span className="font-bold text-slate-200">{specimen.specimenType}</span>
              </div>
              <div>
                <span className="text-slate-400 block">الوعاء / الأنبوب:</span>
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: specimen.containerColorHex }} />
                  {specimen.containerType}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">موقع السحب:</span>
                <span className="font-bold text-slate-200">{specimen.collectionLocation}</span>
              </div>
              <div>
                <span className="text-slate-400 block">حالة العينة الحالية:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block mt-0.5 ${
                  specimen.status === 'accepted'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : specimen.status === 'rejected'
                    ? 'bg-red-950 text-red-300 border border-red-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {specimen.status}
                </span>
              </div>
            </div>
            {specimen.rejectionInfo && (
              <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-red-300">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>العينة مرفوضة مخبرياً (Specimen Rejected)</span>
                </div>
                <p className="text-[11px] leading-relaxed">{specimen.rejectionInfo.reasonDescription}</p>
                <div className="text-[10px] text-red-400 pt-1 border-t border-red-800/60">
                  مرفوضة بواسطة: {specimen.rejectionInfo.rejectedBy} في {specimen.rejectionInfo.rejectedAt}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Accession Details */}
        {accession && (
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-700 pb-2">
              <span className="flex items-center gap-1.5 text-teal-400">
                <Layers className="w-4 h-4" />
                <span>رقم الترقيم المخبري (Accession Number)</span>
              </span>
              <span className="font-mono text-teal-300 font-bold">{accession.accessionNumber}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">القسم الفني:</span>
                <span className="font-bold text-slate-200 capitalize">{accession.section}</span>
              </div>
              <div>
                <span className="text-slate-400 block">الجهاز المحلل:</span>
                <span className="font-bold text-slate-200">{accession.instrumentContext.analyzerName}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">الفحوصات والنتائج ({accession.tests.length}):</span>
              <div className="space-y-1.5 mt-1.5">
                {accession.tests.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-700/60">
                    <div>
                      <span className="font-bold text-slate-200 text-xs block">{t.testNameAr}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{t.testCode} • المرجع: {t.referenceRangeText}</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono font-bold text-sm block ${
                        t.flag === 'critical_high' || t.flag === 'critical_low'
                          ? 'text-red-400 animate-pulse'
                          : t.flag === 'abnormal_high' || t.flag === 'abnormal_low'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}>
                        {t.numericValue ?? t.textValue} {t.unit}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Microbiology Case Details */}
        {microCase && (
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-700 pb-2">
              <span className="flex items-center gap-1.5 text-purple-400">
                <FlaskConical className="w-4 h-4" />
                <span>حالة الأحياء الدقيقة والمزارع (Microbiology)</span>
              </span>
              <span className="font-mono text-purple-300 font-bold">{microCase.accessionNumber}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">فترة التحضين:</span>
                <span className="font-bold text-slate-200">{microCase.incubationDurationHours} ساعة / {microCase.incubationTargetHours} س</span>
              </div>
              <div>
                <span className="text-slate-400 block">حالة النمو:</span>
                <span className="font-bold text-slate-200">{microCase.status}</span>
              </div>
            </div>
            {microCase.gramStainPreliminary && (
              <div className="p-2 rounded bg-purple-950/40 border border-purple-800/60 space-y-1">
                <span className="font-bold text-[11px] text-purple-300 block">صبغة غرام الأولية:</span>
                <p className="text-slate-300 text-[11px]">{microCase.gramStainPreliminary.findings}</p>
              </div>
            )}
          </div>
        )}

        {/* Pathology Case Details */}
        {pathCase && (
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-700 pb-2">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <FileText className="w-4 h-4" />
                <span>حالة علم الأمراض والأنسجة (Pathology Case)</span>
              </span>
              <span className="font-mono text-emerald-300 font-bold">{pathCase.caseNumber}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">الإجراء الجراحي:</span>
                <span className="font-bold text-slate-200">{pathCase.procedureName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">الاستشاري المعين:</span>
                <span className="font-bold text-slate-200">{pathCase.assignedPathologist}</span>
              </div>
            </div>
            {pathCase.grossExamination && (
              <div className="p-2 rounded bg-slate-900/60 border border-slate-700/60 text-[11px]">
                <span className="text-slate-400 block">أبعاد العينة العيانية:</span>
                <span className="font-bold text-slate-200">{pathCase.grossExamination.dimensions} ({pathCase.grossExamination.weightGrams} جم)</span>
                <div className="text-[10px] text-teal-400 mt-1">عدد البلوكات النسيجية: {pathCase.grossExamination.blocks.length} بلوك</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-slate-400 text-xs">
        <span>المعاينة السريعة لا تعدّل البيانات</span>
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer transition-colors"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
};
