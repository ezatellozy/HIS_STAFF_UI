import React, { useState } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  PhoneCall,
  Clock,
  Cpu,
  CheckCircle2,
  FileQuestion,
  Search,
  ExternalLink,
  ShieldAlert,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  LabSpecimen,
  LabAccession,
  IncomingLabOrder,
  InstrumentOperationalStatus
} from '../../types/laboratoryOps';

interface ExceptionsDelayedViewProps {
  specimens: LabSpecimen[];
  accessions: LabAccession[];
  orders: IncomingLabOrder[];
  instruments: InstrumentOperationalStatus[];
  onOpenRejectionModal: (specimen: LabSpecimen) => void;
  onOpenCriticalModal: (accession: LabAccession) => void;
  onPreviewAccession: (accession: LabAccession) => void;
  onPreviewSpecimen: (specimen: LabSpecimen) => void;
}

export const ExceptionsDelayedView: React.FC<ExceptionsDelayedViewProps> = ({
  specimens,
  accessions,
  orders,
  instruments,
  onOpenRejectionModal,
  onOpenCriticalModal,
  onPreviewAccession,
  onPreviewSpecimen
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'rejected' | 'critical' | 'instruments' | 'clarifications'>('all');

  const rejectedSpecimens = specimens.filter(s => s.status === 'rejected');
  const criticalAccessions = accessions.filter(
    a =>
      a.tests.some(t => t.flag === 'critical_high' || t.flag === 'critical_low') &&
      a.criticalCommunication?.acknowledgementStatus !== 'acknowledged'
  );
  const maintenanceInstruments = instruments.filter(i => i.status === 'maintenance' || i.qcStatus !== 'acceptable');
  const clarifyingOrders = orders.filter(o => o.status === 'clarification_required' || o.clarificationNote);

  return (
    <div className="space-y-4 text-right font-['Cairo',sans-serif]">
      {/* Header */}
      <div className="bg-red-950 text-white p-5 rounded-2xl border border-red-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
            <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
            <span>مركز الاستثناءات والتنبيهات المخبرية الحرجة ومراقبة الجودة</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">
            Laboratory Exceptions, Critical Alerts & Operational Deviations
          </h2>
          <p className="text-xs text-red-200 mt-1 max-w-2xl leading-relaxed">
            متابعة العينات المرفوضة التي تتطلب إعادة السحب، القيم الحرجة غير المكتملة بالقراءة المتبادلة، والأجهزة تحت الصيانة لضمان أمان المرضى وعدم تأخر الرعاية الطبية.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-red-900 border border-red-700 text-xs font-mono font-bold text-red-100">
            إجمالي التنبيهات: {rejectedSpecimens.length + criticalAccessions.length + maintenanceInstruments.length}
          </span>
        </div>
      </div>

      {/* Category Selector */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          كافة الاستثناءات
        </button>

        <button
          onClick={() => setActiveCategory('critical')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeCategory === 'critical'
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-white text-red-700 hover:bg-red-50 border border-red-200'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>قيم حرجة بانتظار الإبلاغ ({criticalAccessions.length})</span>
        </button>

        <button
          onClick={() => setActiveCategory('rejected')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeCategory === 'rejected'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>عينات مرفوضة وإعادة سحب ({rejectedSpecimens.length})</span>
        </button>

        <button
          onClick={() => setActiveCategory('instruments')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeCategory === 'instruments'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>أجهزة تحت الصيانة ({maintenanceInstruments.length})</span>
        </button>
      </div>

      {/* Exception Items List */}
      <div className="space-y-4">
        {/* Critical Alerts Section */}
        {(activeCategory === 'all' || activeCategory === 'critical') && criticalAccessions.length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-red-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-red-100 pb-2">
              <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
                <PhoneCall className="w-4 h-4 animate-bounce" />
                <span>قيم مخبرية حرجة تتطلب إبلاغاً هاتفياً وقراءة متبادلة (Critical Value Actions)</span>
              </div>
              <span className="text-xs text-red-600 font-mono font-bold">Closed-Loop Required</span>
            </div>

            <div className="space-y-2.5">
              {criticalAccessions.map(acc => (
                <div
                  key={acc.id}
                  className="p-3 bg-red-50/70 border border-red-200 rounded-xl flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900 text-xs">{acc.patientName}</strong>
                      <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-red-200">
                        {acc.mrn}
                      </span>
                      <span className="text-[10px] text-red-800 font-bold bg-red-200 px-2 py-0.5 rounded">
                        STAT EMERGENCY
                      </span>
                    </div>
                    <div className="text-xs text-red-950 flex items-center gap-2">
                      <span className="font-bold">{acc.testPanelName}:</span>
                      {acc.tests
                        .filter(t => t.flag === 'critical_high' || t.flag === 'critical_low')
                        .map(t => (
                          <span key={t.id} className="font-mono font-black text-red-700 bg-red-100 px-2 py-0.5 rounded">
                            {t.testNameAr} = {t.numericValue ?? t.textValue} {t.unit} (مرجع: {t.referenceRangeText})
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenCriticalModal(acc)}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 animate-pulse"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>فتح نموذج الإبلاغ وإغلاق الدائرة</span>
                    </button>
                    <button
                      onClick={() => onPreviewAccession(acc)}
                      className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl cursor-pointer text-xs"
                    >
                      معاينة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejected Specimens Section */}
        {(activeCategory === 'all' || activeCategory === 'rejected') && rejectedSpecimens.length > 0 && (
          <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-100 pb-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <RefreshCw className="w-4 h-4 text-amber-700" />
                <span>عينات مرفوضة وفق سياسات الجودة - تتطلب إعادة سحب (Rejected Specimens & Recollections)</span>
              </div>
              <span className="text-xs text-amber-700 font-bold">Original Order Preserved</span>
            </div>

            <div className="space-y-2.5">
              {rejectedSpecimens.map(spec => (
                <div
                  key={spec.id}
                  className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900 text-xs">{spec.patientName}</strong>
                      <span className="text-[11px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-amber-200">
                        {spec.mrn}
                      </span>
                      <span className="text-[10px] text-amber-800 font-mono font-bold bg-amber-100 px-2 py-0.5 rounded">
                        {spec.specimenBarcode}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700">
                      سبب الرفض: <strong className="text-red-700">{spec.rejectionInfo?.reasonDescription}</strong>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      مرفوضة بواسطة: {spec.rejectionInfo?.rejectedBy} في {spec.rejectionInfo?.rejectedAt}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenRejectionModal(spec)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      إعادة تقييم الرفض
                    </button>
                    <button
                      onClick={() => onPreviewSpecimen(spec)}
                      className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl cursor-pointer text-xs"
                    >
                      معاينة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Maintenance Instruments Section */}
        {(activeCategory === 'all' || activeCategory === 'instruments') && maintenanceInstruments.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Cpu className="w-4 h-4 text-teal-600" />
                <span>أجهزة مخبرية تخضع للصيانة وإعادة المعايرة (Analyzer Maintenance & Rerouting)</span>
              </div>
            </div>

            <div className="space-y-2">
              {maintenanceInstruments.map(inst => (
                <div
                  key={inst.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-slate-900 text-xs block">{inst.name}</strong>
                    <span className="text-slate-500 text-[11px]">{inst.statusMessage}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold text-[10px]">
                    صيانة دورية مجدولة
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
