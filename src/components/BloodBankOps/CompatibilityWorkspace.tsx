import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  Droplet,
  Search,
  Filter,
  Check,
  User,
  Info,
  Clock,
  ArrowRight,
  ShieldAlert,
  Cpu,
  RefreshCw,
  BellRing,
  XCircle,
  Eye,
  FileCheck
} from 'lucide-react';
import {
  CompatibilityRecord,
  CrossmatchMethod,
  ElectronicCrossmatchAssessment,
  RetrospectiveTestingRecord
} from '../../types/bloodBankOps';
import { MOCK_RETROSPECTIVE_TESTING_QUEUE } from '../../data/mockBloodBankOpsData';

interface CompatibilityWorkspaceProps {
  records: CompatibilityRecord[];
  onOpenAllocation?: (requestId: string) => void;
  onOpenEmergencyReleaseModal?: () => void;
}

export const CompatibilityWorkspace: React.FC<CompatibilityWorkspaceProps> = ({
  records,
  onOpenAllocation,
  onOpenEmergencyReleaseModal
}) => {
  const [activeTab, setActiveTab] = useState<'all_crossmatches' | 'retrospective_queue'>('all_crossmatches');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [retrospectiveQueue, setRetrospectiveQueue] = useState<RetrospectiveTestingRecord[]>(MOCK_RETROSPECTIVE_TESTING_QUEUE);
  const [selectedExmRecord, setSelectedExmRecord] = useState<ElectronicCrossmatchAssessment | null>(null);
  const [broadcastAlert, setBroadcastAlert] = useState<string | null>(null);

  const filteredRecords = records.filter(r => {
    const matchesSearch =
      r.patientName.includes(searchTerm) ||
      r.patientMrn.includes(searchTerm) ||
      r.unitNumber.includes(searchTerm) ||
      r.requestId.includes(searchTerm);

    const matchesMethod = methodFilter === 'all' || r.method === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const handleResolveRetrospective = (recordId: string, result: 'compatible' | 'incompatible') => {
    setRetrospectiveQueue(prev =>
      prev.map(item => {
        if (item.id === recordId) {
          return {
            ...item,
            status: result === 'compatible' ? 'completed_compatible' : 'completed_incompatible',
            compatibilityResult: result,
            clinicalActionTaken: result === 'incompatible'
              ? 'إنذار طارئ وفوري: إيقاف النقل فوراً + استدعاء استشاري أمراض الدم وتحضير وحدات بديلة متوافقة'
              : 'تم تأكيد التوافق التام ولا توجد مخاطر تحسسية أو مناعية'
          };
        }
        return item;
      })
    );

    if (result === 'incompatible') {
      setBroadcastAlert('🚨 تنبيه عاجل جداً (Critical Incompatibility Alert): أظهر الفحص الرجعي عدم توافق الوحدة المنصرفة في الطوارئ! تم إطلاق بروتوكول إيقاف النقل الفوري وتنبيه غرفة الإنعاش.');
    }
  };

  const SAMPLE_EXM_ELIGIBLE: ElectronicCrossmatchAssessment = {
    patientMrn: 'MRN-10023',
    patientName: 'خالد عبدالله السبيعي',
    twoIndependentTypingsOnRecord: true,
    historicalGroupConcordant: true,
    currentAntibodyScreenNegative: true,
    historicalAntibodiesAbsent: true,
    validatedSystemLogicConfirmed: true,
    donorUnitAbConfirmed: true,
    isEligibleForElectronicCrossmatch: true,
    prerequisitesList: [
      { id: '1', titleAr: 'عينتان مستقلتان تؤكدان فصيلة الدم (Two Independent ABO Determinations)', met: true },
      { id: '2', titleAr: 'تطابق نتائج الفصيلة السابقة مع الحالية دون أي خلاف (Concordant Typing)', met: true },
      { id: '3', titleAr: 'سلبية مسح الأجسام المضادة الحالي (Current Antibody Screen Negative)', met: true },
      { id: '4', titleAr: 'عدم وجود أي تاريخ مسجل لأجسام مضادة سريرية (No Historical Antibodies)', met: true },
      { id: '5', titleAr: 'إعادة تأكيد فصيلة الوحدة المانحة في المختبر (Donor Confirmatory Check)', met: true }
    ],
    rationaleAr: 'المريض مستوفٍ لجميع متطلبات التوافق الإلكتروني الآمن وفق معايير AABB 35th Ed.'
  };

  const SAMPLE_EXM_INELIGIBLE: ElectronicCrossmatchAssessment = {
    patientMrn: 'MRN-10045',
    patientName: 'سارة عبدالعزيز الراشد',
    twoIndependentTypingsOnRecord: true,
    historicalGroupConcordant: true,
    currentAntibodyScreenNegative: false,
    historicalAntibodiesAbsent: false,
    validatedSystemLogicConfirmed: true,
    donorUnitAbConfirmed: true,
    isEligibleForElectronicCrossmatch: false,
    fallbackMethodRequired: 'antiglobulin_crossmatch_ahg',
    disqualificationReasonAr: 'وجود جسم مضاد سريري معروف (Anti-Kell) - يمنع التوافق الإلكتروني ويلزم فحص AHG كامل ومطابقة مستضدية سالبة لـ K',
    prerequisitesList: [
      { id: '1', titleAr: 'عينتان مستقلتان تؤكدان الفصيلة', met: true },
      { id: '2', titleAr: 'تطابق نتائج الفصيلة التاريخية', met: true },
      { id: '3', titleAr: 'سلبية مسح الأجسام المضادة الحالي', met: false, notes: 'إيجابي Anti-Kell 3+' },
      { id: '4', titleAr: 'عدم وجود أي تاريخ لأجسام مضادة سابقة', met: false, notes: 'مسجل Anti-Kell في السجل الطبي' },
      { id: '5', titleAr: 'إعادة تأكيد فصيلة الوحدة المانحة', met: true }
    ],
    rationaleAr: 'مستبعد من التوافق الإلكتروني بسبب الأجسام المضادة. يلزم فحص AHG كامل مع وحدات K-Negative.'
  };

  return (
    <div className="space-y-4">
      {/* Broadcast Alert */}
      {broadcastAlert && (
        <div className="p-4 bg-red-600 text-white rounded-2xl shadow-lg flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 shrink-0" />
            <span className="font-bold text-xs">{broadcastAlert}</span>
          </div>
          <button
            onClick={() => setBroadcastAlert(null)}
            className="px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold"
          >
            إغلاق التنبيه
          </button>
        </div>
      )}

      {/* Top Header & Fast Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">مختبر التوافق والمطابقة المصلية (Compatibility & Crossmatch)</h2>
              <p className="text-xs text-slate-500">
                فحص التطابق الفوري، AHG الكامل، التوافق الإلكتروني، وتتبع الفحوصات الرجعية (GAP-02)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="بحث برقم الوحدة، المريض، الطلب..."
                className="pr-9 pl-3 py-1.5 rounded-xl border border-slate-200 text-xs w-52 focus:outline-none focus:border-teal-500"
              />
            </div>

            {onOpenEmergencyReleaseModal && (
              <button
                onClick={onOpenEmergencyReleaseModal}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>صرف طارئ</span>
              </button>
            )}
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all_crossmatches')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'all_crossmatches'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              سجل فحوصات التوافق ({records.length})
            </button>
            <button
              onClick={() => setActiveTab('retrospective_queue')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'retrospective_queue'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>طابور الفحص الرجعي للصرف الطارئ (GAP-02)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-800 text-white text-[10px] font-mono">
                {retrospectiveQueue.filter(q => q.status === 'in_progress').length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedExmRecord(SAMPLE_EXM_ELIGIBLE)}
              className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-[11px] font-bold flex items-center gap-1"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>شروط التوافق الإلكتروني (مستوفٍ)</span>
            </button>
            <button
              onClick={() => setSelectedExmRecord(SAMPLE_EXM_INELIGIBLE)}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[11px] font-bold flex items-center gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>حظر التوافق الإلكتروني (Anti-Kell)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'all_crossmatches' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">الطلب والمريض</th>
                  <th className="p-3.5">فصيلة المريض</th>
                  <th className="p-3.5">الوحدة المفحوصة وفصيلتها</th>
                  <th className="p-3.5">طريقة المطابقة المعتمدة</th>
                  <th className="p-3.5">نتيجة التوافق</th>
                  <th className="p-3.5">المتطلبات الخاصة المحققة</th>
                  <th className="p-3.5">الفاحص والمصادقة</th>
                  <th className="p-3.5 text-center">الإجراء التالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-teal-50/20 transition-colors">
                    {/* Request & Patient */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{rec.patientName}</div>
                      <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                        MRN: {rec.patientMrn} • {rec.requestId}
                      </div>
                    </td>

                    {/* Patient Group */}
                    <td className="p-3.5">
                      <span className="px-2 py-1 rounded-lg bg-red-50 text-red-800 font-mono font-bold text-xs border border-red-200">
                        {rec.patientGroup.displayAr}
                      </span>
                    </td>

                    {/* Unit and Group */}
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-slate-900">{rec.unitNumber}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        فصيلة الوحدة: <strong className="font-mono text-red-700">{rec.unitGroup.displayAr}</strong>
                      </div>
                    </td>

                    {/* Method */}
                    <td className="p-3.5">
                      <div className="font-medium text-slate-800">{rec.methodDisplayAr}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">{rec.method}</div>
                    </td>

                    {/* Result */}
                    <td className="p-3.5">
                      {rec.result === 'compatible' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>متوافق (Compatible)</span>
                        </span>
                      ) : rec.result === 'emergency_uncrossmatched_released' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>صرف طارئ غير متوافق</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>الفحص جاري</span>
                        </span>
                      )}
                    </td>

                    {/* Satisfied Requirements */}
                    <td className="p-3.5">
                      <div className="space-y-0.5">
                        {rec.satisfiedRequirementsList.map((req, i) => (
                          <div key={i} className="text-[10px] text-slate-700 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{req}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Tech & Verifier */}
                    <td className="p-3.5">
                      <div className="text-slate-800 font-medium">{rec.technologistName}</div>
                      {rec.verifierName && (
                        <div className="text-[10px] text-teal-700 font-medium mt-0.5">
                          مصادقة: {rec.verifierName}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 mt-0.5">{rec.testedAt}</div>
                    </td>

                    {/* Action */}
                    <td className="p-3.5 text-center">
                      {onOpenAllocation && (
                        <button
                          onClick={() => onOpenAllocation(rec.requestId)}
                          className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>تخصيص الوحدة</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      لا توجد سجلات تطابق البحث في مختبر التوافق.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* RETROSPECTIVE TESTING QUEUE VIEW (GAP-02) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
              <span>
                <strong>سجل الفحص الرجعي الإلزامي (AABB Retrospective Testing Protocol):</strong> الوحدات المصروفة بالحالات الإسعافية الطارئة تخضع فوراً لاختبار تطابق مصلي متوازي. في حال عدم التوافق، يُطلق النظام إشعاراً عاجلاً لإيقاف النقل فوراً.
              </span>
            </div>
            <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-amber-300 font-bold">
              GAP-02 Enforced
            </span>
          </div>

          <div className="space-y-3">
            {retrospectiveQueue.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{item.patientName}</span>
                      <span className="font-mono text-xs text-slate-500">({item.patientMrn})</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                        item.status === 'completed_compatible' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status === 'in_progress' ? 'قيد الفحص الرجعي' :
                         item.status === 'completed_compatible' ? 'مكتمل - متوافق' : 'مكتمل - غير متوافق!'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      الوحدة المنصرفة: <strong className="font-mono text-rose-700">{item.unitNumber}</strong> • عينة السحب المسبق: <strong className="font-mono">{item.preReleaseSampleId}</strong> • وقت الإفراج: {item.emergencyReleasedAt}
                    </div>
                  </div>

                  <div className="text-left">
                    <span className="text-[10px] text-slate-500 font-mono block">سجل الإفراج: {item.emergencyReleaseRecordId}</span>
                    <span className="text-[11px] text-slate-700">الفاحص: {item.technologistName}</span>
                  </div>
                </div>

                {item.clinicalActionTaken && (
                  <div className={`p-2.5 rounded-lg text-xs font-semibold ${
                    item.compatibilityResult === 'incompatible'
                      ? 'bg-red-50 text-red-900 border border-red-200'
                      : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  }`}>
                    الإجراء السريري الموثق: {item.clinicalActionTaken}
                  </div>
                )}

                {item.status === 'in_progress' && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => handleResolveRetrospective(item.id, 'compatible')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>توثيق نتيجة الفحص: متوافق تماماً (Compatible)</span>
                    </button>
                    <button
                      onClick={() => handleResolveRetrospective(item.id, 'incompatible')}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>توثيق: غير متوافق وإطلاق إنذار الإيقاف الفوري</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ELECTRONIC CROSSMATCH ASSESSMENT MODAL */}
      {selectedExmRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-right">
            <div className={`p-4 border-b flex items-center justify-between ${
              selectedExmRecord.isEligibleForElectronicCrossmatch
                ? 'bg-teal-50 border-teal-200 text-teal-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                <h3 className="font-bold text-sm">
                  تقييم معايير التوافق الإلكتروني الآمن (Electronic Crossmatch Criteria)
                </h3>
              </div>
              <button
                onClick={() => setSelectedExmRecord(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900">{selectedExmRecord.patientName}</div>
                <div className="font-mono text-slate-500">MRN: {selectedExmRecord.patientMrn}</div>
              </div>

              {/* Status Banner */}
              <div className={`p-3 rounded-xl border flex items-center gap-2 font-bold ${
                selectedExmRecord.isEligibleForElectronicCrossmatch
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}>
                {selectedExmRecord.isEligibleForElectronicCrossmatch ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>مؤهل للتوافق الإلكتروني (EXM Eligible) - يسمح بالصرف دون فحص أنبوبي</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>ممنوع من التوافق الإلكتروني - {selectedExmRecord.disqualificationReasonAr}</span>
                  </>
                )}
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 block">قائمة شروط الأمان الإلزامية (AABB 35th Ed.):</span>
                <div className="space-y-1.5">
                  {selectedExmRecord.prerequisitesList.map(prereq => (
                    <div
                      key={prereq.id}
                      className={`p-2.5 rounded-lg border flex items-center justify-between ${
                        prereq.met ? 'bg-emerald-50/40 border-emerald-200 text-emerald-900' : 'bg-red-50/60 border-red-200 text-red-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {prereq.met ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                        )}
                        <span>{prereq.titleAr}</span>
                      </div>
                      {prereq.notes && (
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-white rounded border">
                          {prereq.notes}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rationale */}
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {selectedExmRecord.rationaleAr}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedExmRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
