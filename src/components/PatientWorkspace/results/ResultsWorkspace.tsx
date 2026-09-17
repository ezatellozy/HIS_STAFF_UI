import React, { useState } from 'react';
import {
  FlaskConical,
  Radio,
  Bug,
  FileSearch,
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Filter,
  Search,
  ShieldAlert,
  Clock,
  Check,
  Eye,
  PhoneCall,
  MessageSquare,
  Sparkles,
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { Patient } from '../../../types/his';
import { useHis } from '../../../context/HisContext';
import {
  ResultDomainType,
  LabReportItem,
  ImagingReportItem,
  MicrobiologyReportItem,
  PathologyReportItem,
  CriticalResultPresentationPolicy
} from '../../../types/clinicalResults';
import {
  MOCK_RESULT_DOMAINS,
  MOCK_LAB_REPORTS,
  MOCK_IMAGING_REPORTS,
  MOCK_MICROBIOLOGY_REPORTS,
  MOCK_PATHOLOGY_REPORTS,
  MOCK_CUMULATIVE_TRENDS
} from '../../../data/mockClinicalResultsData';
import { LabResultsPanel } from './LabResultsPanel';
import { ImagingReportsPanel } from './ImagingReportsPanel';
import { MicrobiologyPanel } from './MicrobiologyPanel';
import { PathologyPanel } from './PathologyPanel';
import { CumulativeTrendVisualizer } from './CumulativeTrendVisualizer';
import { DicomStudyViewerModal } from './DicomStudyViewerModal';
import { ResultAmendmentModal } from './ResultAmendmentModal';
import { ResultFollowUpModal } from './ResultFollowUpModal';
import { ResultFollowUpMetadata } from '../../../types/clinicalIdentityVerification';

interface ResultsWorkspaceProps {
  patient: Patient;
}

export type CareAreaResultPreset = 'all' | 'er' | 'icu' | 'wards' | 'opd' | 'or';
export type AttentionFilterType = 'all' | 'critical' | 'abnormal' | 'unreviewed' | 'amended';

export const ResultsWorkspace: React.FC<ResultsWorkspaceProps> = ({ patient }) => {
  const { currentStaff, playChime } = useHis();

  // Active Domain & Filter States
  const [activeDomain, setActiveDomain] = useState<ResultDomainType>('laboratory');
  const [activePreset, setActivePreset] = useState<CareAreaResultPreset>('all');
  const [attentionFilter, setAttentionFilter] = useState<AttentionFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Datasets State
  const [labReports, setLabReports] = useState<LabReportItem[]>(MOCK_LAB_REPORTS);
  const [imagingReports, setImagingReports] = useState<ImagingReportItem[]>(MOCK_IMAGING_REPORTS);
  const [microReports, setMicroReports] = useState<MicrobiologyReportItem[]>(MOCK_MICROBIOLOGY_REPORTS);
  const [pathologyReports, setPathologyReports] = useState<PathologyReportItem[]>(MOCK_PATHOLOGY_REPORTS);

  // Modals
  const [activeTrendAnalyte, setActiveTrendAnalyte] = useState<string | null>(null);
  const [selectedDicomStudy, setSelectedDicomStudy] = useState<ImagingReportItem | null>(null);
  const [selectedAmendedReport, setSelectedAmendedReport] = useState<LabReportItem | null>(null);
  const [followUpModalReport, setFollowUpModalReport] = useState<LabReportItem | null>(null);

  // Critical Result Presentation Policy (Policy-Driven: Visual / Banner / Optional Sound / Optional Motion to mitigate Alert Fatigue)
  const [alertPolicy, setAlertPolicy] = useState<CriticalResultPresentationPolicy>({
    showVisualIndicator: true,
    visualIndicatorStyle: 'standard',
    showBanner: true,
    enableOptionalSound: false,
    enableOptionalMotion: false,
    slaMinutesToAcknowledge: 15
  });

  // User Authority State: Result Consumer vs Authorized Result Source
  const [userAuthorityRole, setUserAuthorityRole] = useState<'consumer' | 'source'>('consumer');

  // Critical Result Communication / Acknowledgement Modal State (Axis 1 Integration)
  const [criticalActionModalOpen, setCriticalActionModalOpen] = useState(false);
  const [selectedCriticalAlert, setSelectedCriticalAlert] = useState<any | null>(null);
  const [commRecipientName, setCommRecipientName] = useState('سارة مصطفى');
  const [commRecipientRole, setCommRecipientRole] = useState('RN - تمريض سريري متقدم');
  const [commMethod, setCommMethod] = useState<'telephone' | 'in_person' | 'secure_messaging'>('telephone');
  const [readBackConfirmed, setReadBackConfirmed] = useState(true);
  const [commNotes, setCommNotes] = useState('تمت مراجعة وقراءة النتيجة بالكامل هاتفياً وإقرار الإجراء العلاجي الفوري.');

  // Counts for quick badges
  const totalCriticalLabs = labReports.filter(r =>
    r.observations.some(o => o.flag === 'critical_high' || o.flag === 'critical_low')
  ).length;
  const totalCriticalImaging = imagingReports.filter(r => r.hasCriticalFindings).length;
  const totalCriticalMicro = microReports.filter(r => r.isCriticalAlert).length;
  const totalCriticalAll = totalCriticalLabs + totalCriticalImaging + totalCriticalMicro;

  const totalUnreviewedLabs = labReports.filter(r => r.reviewStatus !== 'acknowledged').length;

  // Handlers
  const handleAcknowledgeLab = (reportId: string) => {
    setLabReports(prev =>
      prev.map(r => {
        if (r.id === reportId) {
          const staffSignature = `${currentStaff.name} (${currentStaff.role.toUpperCase()})`;
          return {
            ...r,
            reviewStatus: 'acknowledged',
            reviewState: r.reviewState || 'reviewed',
            reviewedBy: r.reviewedBy || staffSignature,
            reviewedAt: r.reviewedAt || 'الآن',
            acknowledgementState: 'acknowledged',
            acknowledgedBy: staffSignature,
            acknowledgedAt: 'الآن'
          };
        }
        return r;
      })
    );
    playChime('success');
  };

  const handleUpdateLabFollowUp = (metadata: ResultFollowUpMetadata) => {
    setLabReports(prev =>
      prev.map(r => {
        if (r.id === metadata.resultId) {
          return {
            ...r,
            followUpStatus: metadata.followUpStatus,
            followUpMetadata: metadata
            // reviewState and acknowledgementState remain strictly independent; follow-up logging does not mutate review or acknowledgement provenance
          } as any;
        }
        return r;
      })
    );
    playChime('success');
  };

  const handleAcknowledgeImaging = (reportId: string) => {
    setImagingReports(prev =>
      prev.map(r => {
        if (r.id === reportId) {
          const staffSignature = `${currentStaff.name} (${currentStaff.role.toUpperCase()})`;
          return {
            ...r,
            reviewStatus: 'acknowledged',
            reviewState: r.reviewState || 'reviewed',
            reviewedBy: r.reviewedBy || staffSignature,
            reviewedAt: r.reviewedAt || 'الآن',
            acknowledgementState: 'acknowledged',
            acknowledgedBy: staffSignature,
            acknowledgedAt: 'الآن'
          };
        }
        return r;
      })
    );
    playChime('success');
  };

  const handleAcknowledgeMicro = (reportId: string) => {
    setMicroReports(prev =>
      prev.map(r => {
        if (r.id === reportId) {
          const staffSignature = `${currentStaff.name} (${currentStaff.role.toUpperCase()})`;
          return {
            ...r,
            reviewStatus: 'acknowledged',
            reviewState: r.reviewState || 'reviewed',
            reviewedBy: r.reviewedBy || staffSignature,
            reviewedAt: r.reviewedAt || 'الآن',
            acknowledgementState: 'acknowledged',
            acknowledgedBy: staffSignature,
            acknowledgedAt: 'الآن'
          };
        }
        return r;
      })
    );
    playChime('success');
  };

  const handleAcknowledgePathology = (reportId: string) => {
    setPathologyReports(prev =>
      prev.map(r => {
        if (r.id === reportId) {
          const staffSignature = `${currentStaff.name} (${currentStaff.role.toUpperCase()})`;
          return {
            ...r,
            reviewStatus: 'acknowledged',
            reviewState: r.reviewState || 'reviewed',
            reviewedBy: r.reviewedBy || staffSignature,
            reviewedAt: r.reviewedAt || 'الآن',
            acknowledgementState: 'acknowledged',
            acknowledgedBy: staffSignature,
            acknowledgedAt: 'الآن'
          };
        }
        return r;
      })
    );
    playChime('success');
  };

  const handleDocumentCriticalCommunication = () => {
    setCriticalActionModalOpen(false);
    playChime('success');
  };

  // Filtered Lab Reports
  const filteredLabs = labReports.filter(r => {
    if (attentionFilter === 'critical') {
      return r.observations.some(o => o.flag === 'critical_high' || o.flag === 'critical_low');
    }
    if (attentionFilter === 'abnormal') {
      return r.observations.some(o => o.flag !== 'normal');
    }
    if (attentionFilter === 'unreviewed') {
      return r.reviewStatus !== 'acknowledged';
    }
    if (attentionFilter === 'amended') {
      return r.status === 'amended' || r.status === 'corrected';
    }
    if (searchQuery.trim()) {
      return (
        r.panelNameAr.includes(searchQuery) ||
        r.panelNameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.observations.some(o => o.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Critical Results Alert Banner (Policy-Driven: Visual / Banner / Optional Sound / Optional Motion) */}
      {totalCriticalAll > 0 && alertPolicy.showBanner && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className={`w-5 h-5 ${alertPolicy.enableOptionalMotion ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-rose-950">
                  تنبيه النتائج السريرية الحرجة (Critical Results SLA Alert)
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                  {totalCriticalAll} نتائج حرجة
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-0.5">
                تتطلب سياسة المستشفى إبلاغ الطبيب المعالج وتوثيق القراءة التأكيدية (Read-Back) خلال 30 دقيقة من ظهور النتيجة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedCriticalAlert({
                  testName: 'Troponin I High-Sensitivity (3.85 ng/mL)',
                  reportedAt: '14:15 اليوم',
                  reporter: 'المختبر الإسعافي المركزي'
                });
                setCriticalActionModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>توثيق التواصل وتأكيد القراءة (Document Read-Back)</span>
            </button>
            <button
              onClick={() => {
                setActiveTrendAnalyte('LOINC: 89579-7');
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-rose-800 border border-rose-200 hover:bg-rose-100 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>عرض منحنى التروبونين</span>
            </button>
          </div>
        </div>
      )}

      {/* 1.1 Policy-Driven Presentation & Authority Control Bar (Alert Fatigue Mitigation) */}
      <div className="p-3.5 rounded-2xl bg-slate-100/90 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <ShieldAlert className="w-4 h-4 text-teal-700" />
            <span>سياسة عرض التنبيهات والحد من الإرهاق السريري:</span>
          </div>

          {/* Banner Toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              checked={alertPolicy.showBanner}
              onChange={e => setAlertPolicy(prev => ({ ...prev, showBanner: e.target.checked }))}
              className="accent-teal-600 rounded"
            />
            <span>شريط التنبيه العلوي (Banner)</span>
          </label>

          {/* Motion Toggle */}
          <label
            className="flex items-center gap-1.5 cursor-pointer text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200"
            title="حركة نابضة اختيارية - معطلة افتراضياً لتجنب إجهاد وتشتت الطبيب"
          >
            <input
              type="checkbox"
              checked={alertPolicy.enableOptionalMotion}
              onChange={e => setAlertPolicy(prev => ({ ...prev, enableOptionalMotion: e.target.checked }))}
              className="accent-teal-600 rounded"
            />
            <span>حركة نابضة (Optional Motion)</span>
          </label>

          {/* Sound Toggle */}
          <label
            className="flex items-center gap-1.5 cursor-pointer text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200"
            title="رنين صوتي اختياري بحسب سياسة القسم"
          >
            <input
              type="checkbox"
              checked={alertPolicy.enableOptionalSound}
              onChange={e => setAlertPolicy(prev => ({ ...prev, enableOptionalSound: e.target.checked }))}
              className="accent-teal-600 rounded"
            />
            <span>صوت تنبيه (Optional Sound)</span>
          </label>

          {/* Visual Style */}
          <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">النمط البصري:</span>
            <select
              value={alertPolicy.visualIndicatorStyle}
              onChange={e => setAlertPolicy(prev => ({ ...prev, visualIndicatorStyle: e.target.value as any }))}
              className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
            >
              <option value="standard">قياسي (Standard)</option>
              <option value="prominent">بارز (Prominent)</option>
              <option value="subtle">هادئ (Subtle)</option>
            </select>
          </div>
        </div>

        {/* Authority Role Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-600">دور الصلاحية:</span>
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setUserAuthorityRole('consumer')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                userAuthorityRole === 'consumer'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              طبيب معالج (Consumer)
            </button>
            <button
              onClick={() => setUserAuthorityRole('source')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                userAuthorityRole === 'source'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              مصدر تشخيصي (Source)
            </button>
          </div>
        </div>
      </div>

      {/* 2. Care-Area Context Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 ml-1">سياق الرعاية (Care Area):</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActivePreset('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activePreset === 'all' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              شامل القياسي (All)
            </button>
            <button
              onClick={() => {
                setActivePreset('er');
                setActiveDomain('laboratory');
                setAttentionFilter('critical');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activePreset === 'er' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              طوارئ STAT (ER Mode)
            </button>
            <button
              onClick={() => {
                setActivePreset('icu');
                setActiveDomain('laboratory');
                setActiveTrendAnalyte('LOINC: 89579-7');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activePreset === 'icu' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              عناية مركزة (ICU Dense Flow)
            </button>
            <button
              onClick={() => {
                setActivePreset('wards');
                setActiveDomain('laboratory');
                setAttentionFilter('unreviewed');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activePreset === 'wards' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              أجنحة التنويم (Wards Rounds)
            </button>
            <button
              onClick={() => {
                setActivePreset('or');
                setActiveDomain('pathology');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activePreset === 'or' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              العمليات / جراحة (OR / Surgery)
            </button>
          </div>
        </div>

        {/* Quick Trend Visualizer Trigger */}
        <button
          onClick={() => setActiveTrendAnalyte(MOCK_CUMULATIVE_TRENDS[0].analyteCode)}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <TrendingUp className="w-4 h-4 text-teal-600" />
          <span>مقارنة المسارات التراكمية (Cumulative Trends)</span>
        </button>
      </div>

      {/* 3. Configured Result Domain Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {MOCK_RESULT_DOMAINS.map(domain => {
          const isSelected = activeDomain === domain.id;
          let count = 0;
          let critCount = 0;

          if (domain.id === 'laboratory') {
            count = labReports.length;
            critCount = totalCriticalLabs;
          } else if (domain.id === 'imaging') {
            count = imagingReports.filter(r => r.modality !== 'ECG').length;
            critCount = imagingReports.filter(r => r.modality !== 'ECG' && r.hasCriticalFindings).length;
          } else if (domain.id === 'microbiology') {
            count = microReports.length;
            critCount = totalCriticalMicro;
          } else if (domain.id === 'pathology') {
            count = pathologyReports.length;
          } else if (domain.id === 'diagnostic_cardiology') {
            count = imagingReports.filter(r => r.modality === 'ECG').length;
            critCount = imagingReports.filter(r => r.modality === 'ECG' && r.hasCriticalFindings).length;
          }

          return (
            <button
              key={domain.id}
              onClick={() => {
                setActiveDomain(domain.id);
                setAttentionFilter('all');
              }}
              className={`p-3 rounded-2xl border text-right transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-teal-700 text-white border-teal-800 shadow-md ring-2 ring-teal-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-teal-700'
                  }`}
                >
                  {domain.id === 'laboratory' && <FlaskConical className="w-4 h-4" />}
                  {domain.id === 'imaging' && <Radio className="w-4 h-4" />}
                  {domain.id === 'microbiology' && <Bug className="w-4 h-4" />}
                  {domain.id === 'pathology' && <FileSearch className="w-4 h-4" />}
                  {domain.id === 'diagnostic_cardiology' && <Activity className="w-4 h-4" />}
                </div>

                <div className="flex items-center gap-1">
                  {critCount > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isSelected ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {critCount} حرج
                    </span>
                  )}
                  <span
                    className={`px-1.5 py-0.2 rounded-md font-mono text-[10px] font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </div>
              </div>

              <strong className="text-xs block font-extrabold truncate">
                {domain.nameAr}
              </strong>
              <span
                className={`text-[10px] block truncate ${
                  isSelected ? 'text-teal-100' : 'text-slate-400'
                }`}
              >
                {domain.nameEn}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Attention & Search Sub-Bar (For Laboratory domain) */}
      {activeDomain === 'laboratory' && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 ml-1">تصفية حسب الاهتمام:</span>
            <button
              onClick={() => setAttentionFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                attentionFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              جميع التقارير ({labReports.length})
            </button>
            <button
              onClick={() => setAttentionFilter('critical')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                attentionFilter === 'critical'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <span>قيم حرجة</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-200 text-rose-900 text-[10px]">
                {totalCriticalLabs}
              </span>
            </button>
            <button
              onClick={() => setAttentionFilter('unreviewed')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                attentionFilter === 'unreviewed'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              بحاجة لإقرار ومراجعة ({totalUnreviewedLabs})
            </button>
            <button
              onClick={() => setAttentionFilter('abnormal')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                attentionFilter === 'abnormal'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              نتائج خارج النطاق (Abnormal)
            </button>
            <button
              onClick={() => setAttentionFilter('amended')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                attentionFilter === 'amended'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
              }`}
            >
              تقارير معدلة (Amended)
            </button>
          </div>

          <div className="relative min-w-56">
            <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث في أسماء الفحوصات..."
              className="w-full pr-8 pl-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>
      )}

      {/* 5. Render Selected Domain Component */}
      {activeDomain === 'laboratory' && (
        <LabResultsPanel
          reports={filteredLabs}
          onOpenTrend={code => setActiveTrendAnalyte(code)}
          onAcknowledgeReport={handleAcknowledgeLab}
          onViewAmendments={report => setSelectedAmendedReport(report)}
          onOpenFollowUp={report => setFollowUpModalReport(report)}
          alertPresentationPolicy={alertPolicy}
          userAuthorityRole={userAuthorityRole}
        />
      )}

      {activeDomain === 'imaging' && (
        <ImagingReportsPanel
          reports={imagingReports.filter(r => r.modality !== 'ECG')}
          onOpenDicomViewer={study => setSelectedDicomStudy(study)}
          onAcknowledgeReport={handleAcknowledgeImaging}
        />
      )}

      {activeDomain === 'diagnostic_cardiology' && (
        <ImagingReportsPanel
          reports={imagingReports.filter(r => r.modality === 'ECG')}
          onOpenDicomViewer={study => setSelectedDicomStudy(study)}
          onAcknowledgeReport={handleAcknowledgeImaging}
        />
      )}

      {activeDomain === 'microbiology' && (
        <MicrobiologyPanel
          reports={microReports}
          onAcknowledgeReport={handleAcknowledgeMicro}
        />
      )}

      {activeDomain === 'pathology' && (
        <PathologyPanel
          reports={pathologyReports}
          onAcknowledgeReport={handleAcknowledgePathology}
        />
      )}

      {/* 6. Cumulative Trend Visualizer Modal */}
      {activeTrendAnalyte && (
        <CumulativeTrendVisualizer
          seriesList={MOCK_CUMULATIVE_TRENDS}
          initialSelectedCode={activeTrendAnalyte}
          onClose={() => setActiveTrendAnalyte(null)}
        />
      )}

      {/* 7. DICOM / Imaging Study Viewer Modal */}
      {selectedDicomStudy && (
        <DicomStudyViewerModal
          study={selectedDicomStudy}
          patient={patient}
          onClose={() => setSelectedDicomStudy(null)}
        />
      )}

      {/* 8. Result Amendment Audit Modal */}
      {selectedAmendedReport && (
        <ResultAmendmentModal
          report={selectedAmendedReport}
          userRole={userAuthorityRole}
          onClose={() => setSelectedAmendedReport(null)}
        />
      )}

      {/* 8b. Clinical Follow-Up & Communication Responsibility Modal */}
      {followUpModalReport && (
        <ResultFollowUpModal
          isOpen={true}
          onClose={() => setFollowUpModalReport(null)}
          resultId={followUpModalReport.id}
          resultTitle={followUpModalReport.panelNameAr}
          domainName="المختبر السريري"
          orderingClinician={(followUpModalReport as any).orderingClinician}
          attendingClinician={(followUpModalReport as any).attendingClinician}
          currentStatus={(followUpModalReport as any).followUpStatus || 'pending_communication'}
          urgency={followUpModalReport.observations.some(o => o.flag === 'critical_high' || o.flag === 'critical_low') ? 'critical_stat' : 'routine'}
          onUpdateFollowUp={handleUpdateLabFollowUp}
          staffName={currentStaff.name}
          staffRole={currentStaff.role}
        />
      )}

      {/* 9. Critical Result Communication & Read-Back Modal (Axis 1 Integration) */}
      {criticalActionModalOpen && selectedCriticalAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-rose-800 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center text-rose-300">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    توثيق التواصل وإقرار القراءة التأكيدية (Read-Back)
                  </h3>
                  <span className="text-[11px] text-rose-200/80">
                    سياسة إبلاغ النتائج الحرجة لإنزيمات وشوارد القلب (Critical SLA)
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
                <strong className="text-rose-950 font-extrabold text-xs block">
                  {selectedCriticalAlert.testName}
                </strong>
                <span className="text-[11px] text-rose-800 block">
                  أبلغت في: {selectedCriticalAlert.reportedAt} • المصدر: {selectedCriticalAlert.reporter}
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  طريقة التواصل السريري (Communication Method):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCommMethod('telephone')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      commMethod === 'telephone'
                        ? 'bg-teal-50 border-teal-600 text-teal-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    اتصال هاتفي
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommMethod('in_person')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      commMethod === 'in_person'
                        ? 'bg-teal-50 border-teal-600 text-teal-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    مباشر وجهاً لوجه
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommMethod('secure_messaging')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      commMethod === 'secure_messaging'
                        ? 'bg-teal-50 border-teal-600 text-teal-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    رسالة سريرية آمنة
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    اسم متلقي البلاغ:
                  </label>
                  <input
                    type="text"
                    value={commRecipientName}
                    onChange={e => setCommRecipientName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    الصفة السريرية:
                  </label>
                  <input
                    type="text"
                    value={commRecipientRole}
                    onChange={e => setCommRecipientRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Read-Back Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={readBackConfirmed}
                  onChange={e => setReadBackConfirmed(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-emerald-900 font-bold leading-relaxed">
                  أقر بأنه تمت إعادة قراءة النتيجة لفظياً وتأكيدها بدقة (Read-Back Confirmed) مع الطرف الآخر وفق سياسة الجودة وسلامة المرضى.
                </span>
              </label>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  ملاحظات الإجراء السريري المتخذ:
                </label>
                <textarea
                  rows={2}
                  value={commNotes}
                  onChange={e => setCommNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCriticalActionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 text-slate-700 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDocumentCriticalCommunication}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>حفظ التوثيق السريري والإقرار</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
