import React from 'react';
import {
  AlertCircle,
  Inbox,
  RefreshCw,
  SearchX,
  FilterX,
  CalendarX2,
  BedDouble,
  ClockAlert,
  ArrowRight
} from 'lucide-react';

// ============================================================================
// 1. SKELETON LOADING COMPONENT (Table rows, Bed cards, Timeline blocks)
// ============================================================================
interface BoardSkeletonLoadingProps {
  type: 'table' | 'bed_grid' | 'timeline';
  count?: number;
}

export const BoardSkeletonLoading: React.FC<BoardSkeletonLoadingProps> = ({
  type,
  count = 4
}) => {
  if (type === 'table') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-pulse">
        <div className="bg-slate-50 border-b border-slate-200 p-3.5 flex items-center justify-between">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-4 bg-slate-200 rounded w-1/6" />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <div className="w-12 h-7 bg-slate-200 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/4" />
              </div>
              <div className="w-24 h-5 bg-slate-100 rounded" />
              <div className="w-20 h-5 bg-slate-100 rounded" />
              <div className="w-28 h-6 bg-slate-200 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'timeline') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs animate-pulse space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="h-5 bg-slate-200 rounded w-1/4" />
          <div className="h-4 bg-slate-100 rounded w-1/3" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-28 h-14 bg-slate-100 rounded-xl shrink-0" />
              <div className="flex-1 h-14 bg-slate-100 rounded-xl flex items-center px-4 gap-4">
                <div className="w-48 h-8 bg-slate-200 rounded-lg" />
                <div className="w-24 h-6 bg-slate-200/70 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Bed Grid Skeletons
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-slate-200 rounded w-28" />
            <div className="h-5 bg-slate-100 rounded w-16" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
          <div className="h-16 bg-slate-50 rounded-xl border border-slate-100" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-4 bg-slate-100 rounded w-20" />
            <div className="h-6 bg-slate-200 rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// 2. CONTEXTUAL EMPTY STATE COMPONENT
// ============================================================================
export type BoardEmptyReason =
  | 'unit_empty'
  | 'filter_mismatch'
  | 'no_incoming'
  | 'no_discharges'
  | 'no_or_cases'
  | 'no_attention_items';

interface BoardEmptyStateProps {
  reason: BoardEmptyReason;
  onResetFilters?: () => void;
  customMessage?: string;
}

export const BoardEmptyState: React.FC<BoardEmptyStateProps> = ({
  reason,
  onResetFilters,
  customMessage
}) => {
  const getEmptyConfig = () => {
    switch (reason) {
      case 'filter_mismatch':
        return {
          icon: <FilterX className="w-8 h-8 text-slate-400" />,
          title: 'لا توجد حالات تطابق الفلاتر المحددة',
          description: customMessage || 'جرّب إعادة تعيين شروط التصفية أو تغيير كلمات البحث لإظهار بقية حالات القسم.',
          showReset: true
        };
      case 'no_incoming':
        return {
          icon: <Inbox className="w-8 h-8 text-sky-400" />,
          title: 'لا توجد حالات دخول أو تحويل متوقعة حالياً',
          description: customMessage || 'لم يتم تسجيل أي طلبات تحويل جديدة من الطوارئ أو العيادات بانتظار استلام السرير.',
          showReset: false
        };
      case 'no_discharges':
        return {
          icon: <CalendarX2 className="w-8 h-8 text-emerald-400" />,
          title: 'لا توجد حالات تخريج مقررة لهذه الفترة',
          description: customMessage || 'كافة المرضى المنومين في هذا الجناح مستمرون في خطة العلاج السريري.',
          showReset: false
        };
      case 'no_or_cases':
        return {
          icon: <CalendarX2 className="w-8 h-8 text-indigo-400" />,
          title: 'لا توجد جراحات مجدولة في هذا المسرح',
          description: customMessage || 'غرفة العمليات شاغرة أو جاهزة لاستقبال الحالات الطارئة المجدولة لاحقاً.',
          showReset: false
        };
      case 'no_attention_items':
        return {
          icon: <BedDouble className="w-8 h-8 text-emerald-500" />,
          title: 'كافة الحالات مستقرة ولا تتطلب تدخلاً عاجلاً',
          description: customMessage || 'لا توجد علامات حيوية حرجة أو استشارات متأخرة بدون استجابة في هذا القسم.',
          showReset: false
        };
      case 'unit_empty':
      default:
        return {
          icon: <BedDouble className="w-8 h-8 text-slate-400" />,
          title: 'القسم شاغر حالياً',
          description: customMessage || 'لا يوجد مرضى منومون مسجلون في هذا القسم في الوقت الحالي.',
          showReset: false
        };
    }
  };

  const config = getEmptyConfig();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs max-w-lg mx-auto my-6">
      <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
        {config.icon}
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{config.title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto mb-5">
        {config.description}
      </p>
      {config.showReset && onResetFilters && (
        <button
          onClick={onResetFilters}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>إعادة تعيين الفلاتر والبحث</span>
        </button>
      )}
    </div>
  );
};

// ============================================================================
// 3. ERROR RECOVERY COMPONENT
// ============================================================================
interface BoardErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const BoardErrorState: React.FC<BoardErrorStateProps> = ({
  message = 'تعذر تحميل بيانات اللوحة التشغيلية للقسم',
  onRetry
}) => {
  return (
    <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-6 sm:p-8 text-center max-w-md mx-auto my-6">
      <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-rose-900 mb-1">خطأ في مزامنة بيانات اللوحة</h3>
      <p className="text-xs text-rose-700 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>إعادة المحاولة (Mock Retry)</span>
        </button>
      )}
    </div>
  );
};

// ============================================================================
// 4. STALE / CHANGED BOARD NOTICE (Simulated Live Updates)
// ============================================================================
interface BoardStaleNoticeProps {
  message: string;
  onRefresh: () => void;
}

export const BoardStaleNotice: React.FC<BoardStaleNoticeProps> = ({
  message,
  onRefresh
}) => {
  return (
    <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 px-4 flex items-center justify-between text-xs mb-4 shadow-xs">
      <div className="flex items-center gap-2 font-medium">
        <ClockAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span>{message}</span>
      </div>
      <button
        onClick={onRefresh}
        className="px-3 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-bold transition-colors cursor-pointer shrink-0 text-[11px]"
      >
        تحديث العرض
      </button>
    </div>
  );
};
