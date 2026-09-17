import React from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Syringe,
  Bed,
  ArrowRight,
  Clock,
  Layers
} from 'lucide-react';
import {
  InterventionalRadiologyContext
} from '../../types/radiologyOps';

interface InterventionalRadiologyViewProps {
  cases: InterventionalRadiologyContext[];
  onUpdateStage: (caseId: string, stage: InterventionalRadiologyContext['procedureStage']) => void;
}

export const InterventionalRadiologyView: React.FC<InterventionalRadiologyViewProps> = ({
  cases,
  onUpdateStage
}) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            <span>جناح الأشعة التداخلية والقسطرة (Interventional Radiology Workspace)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            متابعة الإجراءات التداخلية الموجهة بالأشعة (خزعات، تصريف سوائل، قسطرة علاجية) ومراجعة السيولة والتهدئة والإفاقة.
          </p>
        </div>
        <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
          {cases.length} حالات تداخلية مجدولة
        </span>
      </div>

      {/* Cases List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {cases.map(item => (
          <div
            key={item.id}
            className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4"
          >
            {/* Top Info */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-900">{item.patientName}</h4>
                <div className="text-[11px] text-slate-500 font-mono">MRN: {item.mrn}</div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                {item.procedureStage === 'pre_procedure_prep' ? 'تحضير ما قبل الإجراء' :
                 item.procedureStage === 'in_suite' ? 'داخل الجناح التداخلي' :
                 item.procedureStage === 'procedure_completed' ? 'اكتمل الإجراء' :
                 item.procedureStage === 'recovery_monitoring' ? 'مراقبة الإفاقة' : 'تم الخروج للقسم'}
              </span>
            </div>

            {/* Procedure Details */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
              <strong className="text-slate-900 block font-bold">{item.procedureNameAr}</strong>
              <div className="text-[11px] text-slate-500 font-mono">{item.procedureNameEn}</div>
            </div>

            {/* Safety & Pre-procedure Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <span className="text-[11px] text-slate-500 block">الموافقة الإجرائية:</span>
                <strong className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>موقعة ومكتملة</span>
                </strong>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <span className="text-[11px] text-slate-500 block">فحص السيولة والتجلط:</span>
                <strong className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>INR 1.1 (سليم)</span>
                </strong>
              </div>

              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <span className="text-[11px] text-slate-500 block">خطة التهدئة (Sedation):</span>
                <strong className="text-slate-800 font-bold">
                  تهدئة واعية مراقبة
                </strong>
              </div>
            </div>

            {/* Recovery & Specimen Tracking */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <div className="text-slate-600">
                سرير الإفاقة المخصص: <strong className="text-slate-900">{item.recoveryBedAssigned || 'قيد التعيين'}</strong>
              </div>
              <div className="text-slate-600">
                عينات الأنسجة: <strong className="font-mono text-teal-700">{item.specimensCollectedCount || 0} عينات</strong>
              </div>
            </div>

            {/* Stage Progress Action */}
            <div className="pt-2 flex items-center justify-end gap-2">
              {item.procedureStage === 'pre_procedure_prep' && (
                <button
                  onClick={() => onUpdateStage(item.id, 'in_suite')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <span>دخول الجناح التداخلي والبدء</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                </button>
              )}
              {item.procedureStage === 'in_suite' && (
                <button
                  onClick={() => onUpdateStage(item.id, 'recovery_monitoring')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>اكتمال الإجراء ونقل المريض للإفاقة</span>
                </button>
              )}
              {item.procedureStage === 'recovery_monitoring' && (
                <button
                  onClick={() => onUpdateStage(item.id, 'discharged_to_ward')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <span>استقرار العلامات والتصريح بالعودة للجناح</span>
                </button>
              )}
              {item.procedureStage === 'discharged_to_ward' && (
                <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم خروج المريض بسلام للقسم الداخلي</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
