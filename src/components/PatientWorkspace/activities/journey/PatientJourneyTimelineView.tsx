import React, { useState } from 'react';
import {
  GitFork,
  ArrowRightLeft,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  Activity,
  Filter,
  Layers,
  MapPin,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  HelpCircle
} from 'lucide-react';
import { Patient } from '../../../../types/his';
import { JourneyActualEvent, JourneyEventType } from '../../../../types/clinicalCarePlanJourney';

interface PatientJourneyTimelineViewProps {
  patient: Patient;
  actualEvents: JourneyActualEvent[];
  onRequestTransition: () => void;
}

export const PatientJourneyTimelineView: React.FC<PatientJourneyTimelineViewProps> = ({
  patient,
  actualEvents,
  onRequestTransition
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [milestonesOnly, setMilestonesOnly] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const filteredEvents = actualEvents.filter(ev => {
    if (milestonesOnly && !ev.isMilestone) return false;
    if (filterCategory !== 'all' && ev.category !== filterCategory) return false;
    return true;
  });

  const getEventBadge = (category: JourneyActualEvent['category']) => {
    switch (category) {
      case 'encounter':
        return { label: 'تنويم واستقبال', color: 'bg-blue-100 text-blue-900 border-blue-200' };
      case 'location':
      case 'transfer':
        return { label: 'انتقال مكاني/سريري', color: 'bg-purple-100 text-purple-900 border-purple-200' };
      case 'procedure':
        return { label: 'إجراء جراحي/قسطرة', color: 'bg-amber-100 text-amber-900 border-amber-200' };
      case 'milestone':
        return { label: 'محطة سريرية هامة', color: 'bg-emerald-100 text-emerald-900 border-emerald-200' };
      case 'disposition':
        return { label: 'قرار سريري وتصريف', color: 'bg-rose-100 text-rose-900 border-rose-200' };
      default:
        return { label: 'حدث سريري', color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header & Filters Ribbon */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <GitFork className="w-4 h-4 text-teal-600" />
            <span>المسار السريري الزمني الفعلي (Actual Chronological Patient Journey)</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            سجل تاريخي دقيق للأحداث السريرية المتحققة، الانتقالات المكانية، والإجراءات الطبية المنفذة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRequestTransition}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>بدء طلب انتقال جديد (Transfer Request)</span>
          </button>
        </div>
      </div>

      {/* Filter and Category Ribbon */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-bold text-[11px] ml-1">تصفية الأحداث:</span>
          {[
            { id: 'all', label: 'كافة الأحداث' },
            { id: 'encounter', label: 'الاستقبال والتنويم' },
            { id: 'location', label: 'الانتقالات المكانية' },
            { id: 'procedure', label: 'الإجراءات والقسطرة' },
            { id: 'disposition', label: 'القرارات السريرية' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                filterCategory === tab.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={milestonesOnly}
            onChange={e => setMilestonesOnly(e.target.checked)}
            className="w-4 h-4 text-teal-600 rounded cursor-pointer"
          />
          <span>المحطات الرئيسية فقط (Milestones Only)</span>
        </label>
      </div>

      {/* 2. Chronological Timeline Chain */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="relative pl-2 pr-4 sm:pr-8 space-y-6 before:absolute before:right-7.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {filteredEvents.map(event => {
            const badge = getEventBadge(event.category);
            const isExpanded = expandedEventId === event.id;

            return (
              <div key={event.id} className="relative flex items-start gap-4 text-xs">
                {/* Timeline Node */}
                <div
                  className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 z-10 shadow-xs ${
                    event.isMilestone
                      ? 'bg-teal-600 border-teal-700 text-white'
                      : 'bg-white border-slate-300 text-slate-600'
                  }`}
                >
                  {event.category === 'procedure' ? (
                    <Activity className="w-4 h-4" />
                  ) : event.category === 'location' || event.category === 'transfer' ? (
                    <ArrowRightLeft className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>

                {/* Event Card */}
                <div
                  className={`flex-1 rounded-xl border transition-all p-4 space-y-2 ${
                    event.isMilestone
                      ? 'bg-teal-50/30 border-teal-200 hover:border-teal-300'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{event.titleAr}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                        {badge.label}
                      </span>
                      {event.isMilestone && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[9px] font-bold">
                          محطة مفصلية
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-slate-500 text-[11px]">{event.effectiveDateTime}</span>
                  </div>

                  <p className="text-slate-700 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-slate-200/60">
                    {event.clinicalSummary}
                  </p>

                  {/* Locations & Responsible Care Team */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/50 text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span>المسؤول: <strong className="text-slate-800">{event.clinicianName}</strong> ({event.clinicianRole})</span>
                      <span>•</span>
                      <span>الوحدة: <strong className="text-teal-900">{event.responsibleTeamOrService}</strong></span>
                    </div>

                    {event.fromLocation && event.toLocation && (
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <span>من: {event.fromLocation}</span>
                        <ArrowRightLeft className="w-3 h-3 text-teal-600" />
                        <span>إلى: {event.toLocation}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
