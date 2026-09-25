import React from 'react';
import { ShieldAlert, Info, Lock } from 'lucide-react';

export const TreasuryPreviewBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div
        id="treasury-synthetic-banner-compact"
        className="w-full bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200"
      >
        <div className="flex items-center gap-2 font-medium">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Synthetic Treasury Design Preview — No Real Banking or Money Movement.</span>
        </div>
        <div className="flex items-center gap-3 text-amber-700 dark:text-amber-300">
          <span className="hidden sm:inline">بيئة محاكاة تصميمية للعمليات المصرفية والخزينة - دون أي سداد أو تحويل مالي فعلي</span>
          <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded text-[10px] font-semibold">
            <Lock className="w-3 h-3" /> محاكاة آمنة
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      id="treasury-synthetic-banner-prominent"
      className="w-full bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 dark:from-amber-950/30 dark:via-amber-900/20 dark:to-amber-950/30 border border-amber-300/70 dark:border-amber-700/50 rounded-lg p-3.5 shadow-sm mb-4"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500/15 dark:bg-amber-500/20 rounded-md shrink-0 mt-0.5 sm:mt-0">
            <ShieldAlert className="w-5 h-5 text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-amber-950 dark:text-amber-100">
                Synthetic Treasury Design Preview — No Real Banking or Money Movement.
              </span>
              <span className="bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[11px] font-semibold px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700">
                محاكاة مالية مستقلة
              </span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">
              جميع أرقام الحسابات البنكية (IBAN)، أسطر كشوف الحساب، واستجابات نظام سريع (SARIE) هي بيانات نموذجية محاكية لا ترتبط بأي شبكة بنكية أو حسابات حقيقية. تم تصميم هذه الوحدة لتأكيد الضوابط الرقابية والفصل المحاسبي عن الحسابات الدائنة (AP) ودفتر الأستاذ العام (GL).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <span className="text-[11px] text-amber-800 dark:text-amber-300 bg-white/70 dark:bg-neutral-800/80 px-2.5 py-1 rounded border border-amber-200 dark:border-amber-800 font-mono">
            HIS-TR-2026-REV-01
          </span>
        </div>
      </div>
    </div>
  );
};
