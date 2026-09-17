import React, { useState } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Layers,
  ArrowUpDown,
  CheckCircle2,
  Inbox,
  Users,
  Clock,
  Archive
} from 'lucide-react';
import {
  MyWorkOperationalView,
  ClinicalPriority,
  WorkItemType,
  WorkQueueDefinition
} from '../../../types/clinicalWorkItems';

interface MyWorkFiltersBarProps {
  activeView: MyWorkOperationalView;
  onChangeView: (view: MyWorkOperationalView) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedQueueId: string;
  onSelectQueue: (queueId: string) => void;
  availableQueues: WorkQueueDefinition[];
  selectedPriority: ClinicalPriority | 'all';
  onSelectPriority: (p: ClinicalPriority | 'all') => void;
  selectedType: WorkItemType | 'all';
  onSelectType: (t: WorkItemType | 'all') => void;
  sortBy: 'priority' | 'due_soon' | 'oldest' | 'newest' | 'patient';
  onSortChange: (sort: 'priority' | 'due_soon' | 'oldest' | 'newest' | 'patient') => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  totalFilteredCount: number;
}

export const MyWorkFiltersBar: React.FC<MyWorkFiltersBarProps> = ({
  activeView,
  onChangeView,
  searchQuery,
  onSearchChange,
  selectedQueueId,
  onSelectQueue,
  availableQueues,
  selectedPriority,
  onSelectPriority,
  selectedType,
  onSelectType,
  sortBy,
  onSortChange,
  onResetFilters,
  hasActiveFilters,
  totalFilteredCount
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const viewTabs: { id: MyWorkOperationalView; labelAr: string; icon: React.ReactNode }[] = [
    { id: 'my_work', labelAr: 'أعمالي (My Items)', icon: <Inbox className="w-3.5 h-3.5" /> },
    { id: 'team_queue', labelAr: 'طابور الفريق (Team Queue)', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'unassigned', labelAr: 'غير مسندة (Unassigned)', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'in_progress', labelAr: 'قيد التنفيذ (In Progress)', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'waiting', labelAr: 'بانتظار معلومة / مريض (Waiting)', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
    { id: 'completed', labelAr: 'المكتملة حديثاً (Completed)', icon: <Archive className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 space-y-3 text-xs">
      {/* 1. Primary Operational View Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
        {viewTabs.map(tab => {
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeView(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.labelAr}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Main Search & Quick Controls Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="بحث سريع باسم المريض، رقم الملف MRN، عنوان الإجراء، أو رقم الطلب..."
            className="w-full pr-9 pl-8 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-xs font-semibold placeholder:text-slate-400 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Filter Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Queue Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <span className="text-slate-400 font-bold text-[11px]">الطابور:</span>
            <select
              value={selectedQueueId}
              onChange={e => onSelectQueue(e.target.value)}
              className="bg-transparent font-bold text-slate-800 text-xs focus:outline-hidden cursor-pointer"
            >
              {availableQueues.map(q => (
                <option key={q.id} value={q.id}>
                  {q.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-bold text-[11px]">الترتيب:</span>
            <select
              value={sortBy}
              onChange={e => onSortChange(e.target.value as any)}
              className="bg-transparent font-bold text-slate-800 text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="priority">الأولوية السريرية (Priority)</option>
              <option value="due_soon">المستحق أولاً (Due Soon)</option>
              <option value="oldest">الأقدم انتظاراً (Oldest)</option>
              <option value="newest">الأحدث وروداً (Newest)</option>
              <option value="patient">اسم المريض (Patient)</option>
            </select>
          </div>

          {/* Advanced Filter Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-colors cursor-pointer ${
              showAdvancedFilters || hasActiveFilters
                ? 'bg-teal-50 border-teal-300 text-teal-800'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>فلاتر متقدمة</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-teal-600" />
            )}
          </button>
        </div>
      </div>

      {/* 3. Advanced Collapsible Filters */}
      {showAdvancedFilters && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
          {/* Priority filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              الأولوية السريرية (Clinical Priority):
            </label>
            <select
              value={selectedPriority}
              onChange={e => onSelectPriority(e.target.value as any)}
              className="w-full bg-white p-2 rounded-lg border border-slate-200 font-bold text-slate-800"
            >
              <option value="all">كافة الأولويات</option>
              <option value="critical">حرج وفوري (Critical)</option>
              <option value="urgent">عاجل (Urgent)</option>
              <option value="priority">أولوية متوسطة (Priority)</option>
              <option value="routine">روتيني (Routine)</option>
            </select>
          </div>

          {/* Work Type filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              نوع الإجراء / العمل (Work Type):
            </label>
            <select
              value={selectedType}
              onChange={e => onSelectType(e.target.value as any)}
              className="w-full bg-white p-2 rounded-lg border border-slate-200 font-bold text-slate-800"
            >
              <option value="all">كافة أنواع الأعمال</option>
              <option value="consultation_review">استشارات طبية متخصصة (Consults)</option>
              <option value="admission_review">طلبات التنويم والقبول (Admissions)</option>
              <option value="critical_result_followup">نتائج حرجة للاعتماد (Critical Results)</option>
              <option value="medication_reconciliation">مطابقة وتدقيق الأدوية (Med Rec)</option>
              <option value="handover_receipt">استلام وتسليم المناوبة (Handover SBAR)</option>
              <option value="care_plan_review">مراجعة الخطة العلاجية (Care Plan)</option>
              <option value="transfer_review">مراجعة الجاهزية الجراحية / النقل</option>
            </select>
          </div>

          {/* Reset / Actions */}
          <div className="flex items-end justify-between gap-2">
            <div className="text-[11px] text-slate-500">
              عدد النتائج المطابقة: <strong className="text-slate-900 font-mono text-xs">{totalFilteredCount}</strong>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-200 border border-slate-200 font-bold text-slate-700 transition-colors cursor-pointer"
              >
                إعادة ضبط الفلاتر
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
