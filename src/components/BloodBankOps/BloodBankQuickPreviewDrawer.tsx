import React from 'react';
import {
  X,
  Droplet,
  User,
  ShieldCheck,
  AlertTriangle,
  Clock,
  FlaskConical,
  ExternalLink,
  Tag,
  CheckCircle2,
  Calendar,
  Thermometer,
  Layers,
  FileCheck
} from 'lucide-react';
import {
  BloodProductRequest,
  PreTransfusionSample,
  BloodProductUnit,
  TransfusionReactionCase
} from '../../types/bloodBankOps';

interface BloodBankQuickPreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  request?: BloodProductRequest;
  sample?: PreTransfusionSample;
  unit?: BloodProductUnit;
  reaction?: TransfusionReactionCase;
  onOpenPatientWorkspace?: (patientId: string) => void;
  onNavigateTab?: (tab: any) => void;
}

export const BloodBankQuickPreviewDrawer: React.FC<BloodBankQuickPreviewDrawerProps> = ({
  isOpen,
  onClose,
  request,
  sample,
  unit,
  reaction,
  onOpenPatientWorkspace,
  onNavigateTab
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-full max-w-md bg-white shadow-2xl border-r border-slate-200 flex flex-col animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30">
            <Droplet className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold">معاينة السلامة السريرية السريعة (Transfusion Quick Preview)</h3>
            <p className="text-[11px] text-slate-400">سياق فوري للسلامة ومطابقة المشتق والعينة</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
        {/* Patient Identity Banner if request or sample or reaction */}
        {(request || sample || reaction) && (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-600" />
                <span className="font-bold text-slate-900 text-sm">
                  {request?.patientName || sample?.patientName || reaction?.patientName}
                </span>
              </div>
              <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-bold">
                {request?.mrn || sample?.mrn || reaction?.mrn}
              </span>
            </div>

            <div className="text-[11px] text-slate-600 flex items-center gap-2">
              <span>الموقع:</span>
              <span className="font-semibold text-slate-800">
                {request?.locationWardBed || sample?.collectionLocation || reaction?.locationWardBed}
              </span>
            </div>

            {onOpenPatientWorkspace && (
              <button
                onClick={() => {
                  const pid = request?.patientId || sample?.patientId || reaction?.patientId;
                  if (pid) onOpenPatientWorkspace(pid);
                }}
                className="w-full mt-2 py-1.5 px-3 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فتح الملف السريري للمريض (Patient Workspace)</span>
              </button>
            )}
          </div>
        )}

        {/* Request Details Preview */}
        {request && (
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-red-600" />
                <span>تفاصيل طلب نقل الدم</span>
              </span>
              <span className="font-mono text-[11px] text-slate-500 font-bold">{request.id}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 block">المشتق المطلوب:</span>
                <span className="font-bold text-slate-900">{request.componentNameAr}</span>
              </div>
              <div>
                <span className="text-slate-500 block">الكمية المقررة:</span>
                <span className="font-bold text-slate-900">{request.requestedQuantity} {request.quantityUnit}</span>
              </div>
              <div>
                <span className="text-slate-500 block">درجة الأولوية:</span>
                <span className={`font-bold ${request.priority === 'stat_emergency' ? 'text-red-700' : 'text-slate-800'}`}>
                  {request.priority === 'stat_emergency' ? '🚨 طوارئ قصوى (STAT)' : request.priority === 'urgent' ? '⚡ عاجل' : 'اعتيادي'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">الهيموجلوبين المبدئي:</span>
                <span className="font-mono font-bold text-slate-900">{request.hemoglobinBaseline || 'غير محدد'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-500 block text-[10px]">المبرر السريري:</span>
              <p className="text-[11px] text-slate-800 mt-0.5 leading-relaxed">{request.clinicalIndication}</p>
            </div>

            {request.specialRequirements.length > 0 && (
              <div className="pt-1 flex flex-wrap gap-1">
                {request.specialRequirements.map(req => (
                  <span key={req} className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                    {req === 'irradiated' ? 'مشعع (Irradiated)' : req === 'leukocyte_reduced' ? 'مفلتر الكريات البيضاء' : req === 'antigen_negative' ? 'سالب لمستضد معين' : req}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sample Details Preview */}
        {sample && (
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
                <span>عينة ما قبل النقل (Pre-Transfusion Specimen)</span>
              </span>
              <span className="font-mono text-[11px] text-slate-500 font-bold">{sample.id}</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">نوع الأنبوبة:</span>
                <span className="font-semibold text-slate-800">{sample.tubeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ساعة السحب:</span>
                <span className="font-semibold text-slate-800">{sample.collectedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ساعة الاستلام بالبنك:</span>
                <span className="font-semibold text-slate-800">{sample.receivedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">صلاحية العينة:</span>
                <span className="font-bold text-emerald-700">{sample.validUntil}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">التحقق من الهوية الثنائية:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>مؤكد بالسياسة</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Unit Details Preview */}
        {unit && (
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-red-600" />
                <span>وحدة مشتق الدم (Unit Identity)</span>
              </span>
              <span className="font-mono text-[11px] text-slate-500 font-bold">{unit.id}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-50/60 border border-red-100">
              <div>
                <div className="text-[10px] text-slate-500">فصيلة الوحدة (ABO/Rh):</div>
                <div className="text-base font-bold text-red-700 font-mono">{unit.bloodGroup.displayAr}</div>
              </div>
              <div className="text-left">
                <div className="text-[10px] text-slate-500">الحجم المقدر:</div>
                <div className="text-sm font-bold text-slate-900">{unit.volumeMl} mL</div>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">باركود ISBT-128:</span>
                <span className="font-mono font-bold text-slate-800">{unit.unitNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">موقع الحفظ:</span>
                <span className="font-semibold text-slate-800">{unit.storageLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">درجة حرارة الحفظ:</span>
                <span className="font-mono text-slate-800">{unit.storageTemperatureC}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">تاريخ انتهاء الصلاحية:</span>
                <span className="font-mono font-bold text-slate-900">{unit.expiryDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">حالة الوحدة:</span>
                <span className="font-bold text-teal-700 uppercase">{unit.status}</span>
              </div>
            </div>
          </div>
        )}

        {/* Reaction Context Preview */}
        {reaction && (
          <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-rose-200">
              <span className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>حالة اشتباه تفاعل نقل دم نشطة</span>
              </span>
              <span className="font-mono text-[10px] text-rose-700 font-bold">{reaction.id}</span>
            </div>

            <div className="text-[11px] text-rose-900">
              <span className="font-bold block">الأعراض المبلغة:</span>
              <ul className="list-disc list-inside space-y-0.5 mt-1 text-[10px] text-rose-800">
                {reaction.clinicalSymptoms.map((sym, idx) => (
                  <li key={idx}>{sym}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-rose-200 flex justify-between text-[11px]">
              <span className="text-rose-800">الإجراء السريري المتخذ:</span>
              <span className="font-bold text-rose-900">إيقاف النقل فوراً</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
        <span className="text-[11px] text-slate-500">معاينة تفاعلية مساعدة</span>
        <button
          onClick={onClose}
          className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
        >
          إغلاق المعاينة
        </button>
      </div>
    </div>
  );
};
