import React from 'react';
import {
  AlertTriangle,
  Clock,
  Flame,
  UserCheck,
  HelpCircle,
  PlayCircle
} from 'lucide-react';
import { MyWorkOperationalView } from '../../../types/clinicalWorkItems';

interface MyWorkSummaryStripProps {
  criticalCount: number;
  dueSoonCount: number;
  overdueCount: number;
  unassignedCount: number;
  inProgressCount: number;
  myClaimedCount: number;
  activeView: MyWorkOperationalView;
  onSelectView: (view: MyWorkOperationalView) => void;
  onFilterUrgentOnly: () => void;
}

export const MyWorkSummaryStrip: React.FC<MyWorkSummaryStripProps> = ({
  criticalCount,
  dueSoonCount,
  overdueCount,
  unassignedCount,
  inProgressCount,
  myClaimedCount,
  activeView,
  onSelectView,
  onFilterUrgentOnly
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
      {/* 1. Critical Needs Attention */}
      <button
        type="button"
        onClick={onFilterUrgentOnly}
        className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
          criticalCount > 0
            ? 'bg-red-50 border-red-200 text-red-950 hover:bg-red-100/80 shadow-xs'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="font-extrabold">انتباه فوري (Critical)</span>
          <AlertTriangle className={`w-4 h-4 ${criticalCount > 0 ? 'text-red-600 animate-pulse' : 'text-slate-400'}`} />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-black font-mono text-red-600">{criticalCount}</span>
          <span className="text-[10px] text-slate-500">حالات/نتائج حرجة</span>
        </div>
      </button>

      {/* 2. Due Soon */}
      <button
        type="button"
        onClick={() => onSelectView('team_queue')}
        className="p-3 rounded-2xl border bg-white border-slate-200 text-slate-700 hover:bg-slate-50 text-right transition-all cursor-pointer flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="font-extrabold">مستحق قريباً (Due Soon)</span>
          <Clock className="w-4 h-4 text-amber-500" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-black font-mono text-amber-600">{dueSoonCount}</span>
          <span className="text-[10px] text-slate-500">خلال &lt; 30 دقيقة</span>
        </div>
      </button>

      {/* 3. Overdue SLA */}
      <button
        type="button"
        onClick={() => onSelectView('team_queue')}
        className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
          overdueCount > 0
            ? 'bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100/80'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="font-extrabold">تجاوز المهلة (Overdue)</span>
          <Flame className={`w-4 h-4 ${overdueCount > 0 ? 'text-amber-600 animate-bounce' : 'text-slate-400'}`} />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-black font-mono text-amber-700">{overdueCount}</span>
          <span className="text-[10px] text-slate-500">تجاوزت وقت الانتظار</span>
        </div>
      </button>

      {/* 4. Unassigned */}
      <button
        type="button"
        onClick={() => onSelectView('unassigned')}
        className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
          activeView === 'unassigned'
            ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 text-teal-950'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="font-extrabold">غير مسند (Unassigned)</span>
          <HelpCircle className="w-4 h-4 text-slate-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-black font-mono text-slate-800">{unassignedCount}</span>
          <span className="text-[10px] text-slate-500">متاح للاستلام (Claim)</span>
        </div>
      </button>

      {/* 5. In Progress */}
      <button
        type="button"
        onClick={() => onSelectView('in_progress')}
        className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
          activeView === 'in_progress'
            ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 text-teal-950'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="font-extrabold">قيد الإجراء (In Progress)</span>
          <PlayCircle className="w-4 h-4 text-blue-500" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl font-black font-mono text-blue-600">{inProgressCount}</span>
          <span className="text-[10px] text-slate-500">يجري العمل عليها</span>
        </div>
      </button>

      {/* 6. Claimed by Me */}
      <button
        type="button"
        onClick={() => onSelectView('my_work')}
        className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
          activeView === 'my_work'
            ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={`font-extrabold ${activeView === 'my_work' ? 'text-white' : 'text-slate-800'}`}>
            أعمالي (My Items)
          </span>
          <UserCheck className={`w-4 h-4 ${activeView === 'my_work' ? 'text-teal-200' : 'text-teal-600'}`} />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className={`text-xl font-black font-mono ${activeView === 'my_work' ? 'text-white' : 'text-teal-700'}`}>
            {myClaimedCount}
          </span>
          <span className={`text-[10px] ${activeView === 'my_work' ? 'text-teal-100' : 'text-slate-500'}`}>
            مسندة / مستلمة لي
          </span>
        </div>
      </button>
    </div>
  );
};
