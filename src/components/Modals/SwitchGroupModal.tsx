import React from 'react';
import {
  X,
  UserCheck,
  Stethoscope,
  HeartPulse,
  Siren,
  Bed,
  Scissors,
  Activity,
  ShieldCheck,
  Building2,
  CheckCircle2,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { HIS_SECURITY_GROUPS } from '../../data/securityGroups';
import { EdinaLogo } from '../common/EdinaLogo';

export const SwitchGroupModal: React.FC = () => {
  const {
    isSwitchGroupModalOpen,
    setIsSwitchGroupModalOpen,
    activeSecurityGroupId,
    loginAsSecurityGroup,
    logout
  } = useHis();

  if (!isSwitchGroupModalOpen) return null;

  const getGroupIcon = (iconType: string) => {
    switch (iconType) {
      case 'UserCheck':
        return <UserCheck className="w-5 h-5 text-emerald-600" />;
      case 'Stethoscope':
        return <Stethoscope className="w-5 h-5 text-blue-600" />;
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5 text-teal-600" />;
      case 'Siren':
        return <Siren className="w-5 h-5 text-rose-600" />;
      case 'Bed':
        return <Bed className="w-5 h-5 text-indigo-600" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-purple-600" />;
      case 'Scissors':
        return <Scissors className="w-5 h-5 text-amber-600" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-cyan-600" />;
      default:
        return <Building2 className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <EdinaLogo variant="mark-only" size="sm" theme="dark" />
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>تبديل مجموعة الصلاحيات والمسؤولية السريرية</span>
                <span className="text-[10px] font-mono text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                  Edina RBAC
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                اختر دورك الحالي للانتقال المباشر لواجهة العمل السريرية المناسبة
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSwitchGroupModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Groups Grid */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {HIS_SECURITY_GROUPS.map(group => {
              const isActive = group.id === activeSecurityGroupId;

              return (
                <div
                  key={group.id}
                  onClick={() => {
                    loginAsSecurityGroup(group.id);
                    setIsSwitchGroupModalOpen(false);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'bg-teal-950/40 border-teal-500 shadow-md shadow-teal-950/40'
                      : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center">
                          {getGroupIcon(group.iconType)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{group.nameAr}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{group.nameEn}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                        {group.shortCode}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {group.descriptionAr}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    {isActive ? (
                      <span className="flex items-center gap-1.5 text-teal-400 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>أنت تعمل بهذه الصلاحية حالياً</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 group-hover:text-teal-300 text-[11px] flex items-center gap-1">
                        <span>التبديل إلى هذه المجموعة</span>
                        <ArrowLeft className="w-3 h-3 rtl:rotate-0 rotate-180" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={() => {
              setIsSwitchGroupModalOpen(false);
              logout();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج والعودة لبوابة الدخول</span>
          </button>

          <button
            onClick={() => setIsSwitchGroupModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
