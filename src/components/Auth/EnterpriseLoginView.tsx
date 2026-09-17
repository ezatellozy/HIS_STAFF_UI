import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  UserCheck,
  Stethoscope,
  HeartPulse,
  Siren,
  Bed,
  Scissors,
  Layers,
  Lock,
  ArrowLeft,
  Sparkles,
  Building2,
  CheckCircle2,
  KeyRound,
  FileCode,
  BadgeCheck
} from 'lucide-react';
import { useHis } from '../../context/HisContext';
import { HIS_SECURITY_GROUPS, HisSecurityGroup } from '../../data/securityGroups';
import { EdinaLogo } from '../common/EdinaLogo';

export const EnterpriseLoginView: React.FC = () => {
  const { allStaff, clinics, loginAsSecurityGroup } = useHis();

  const [activeTab, setActiveTab] = useState<'quick_profiles' | 'manual_login'>('quick_profiles');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('group_patient_access');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('staff-rec-1');
  const [username, setUsername] = useState<string>('dina@edina-his.med');
  const [password, setPassword] = useState<string>('••••••••••••');

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

  const getBadgeStyle = (badgeColor: string) => {
    switch (badgeColor) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'teal':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'rose':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cyan':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsSecurityGroup(selectedGroupId, selectedStaffId);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-['Cairo',sans-serif]">
      {/* Top Enterprise Hospital Identity Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 px-4 sm:px-8 py-4 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <EdinaLogo size="lg" theme="dark" showSubtitle={true} />
            <div className="hidden sm:block border-r border-slate-700 pr-4 text-xs text-slate-400">
              <span className="font-bold text-slate-200">بوابة الدخول الموحد وإدارة الصلاحيات السريرية</span>
              <p className="text-[11px] text-slate-400">Enterprise Unified Sign-On & Clinical Access Governance</p>
            </div>
          </div>

          {/* Compliance Accreditation Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>معتمد CBAHI & JCI</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
              <FileCode className="w-3.5 h-3.5 text-blue-400" />
              <span>HL7 FHIR R4 Ready</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>NPHIES Connected</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro Headline */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-800/80 text-teal-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>نظام التحكم في الوصول القائم على الأدوار والمجموعات (Role-Based Access Control)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            اختر مجموعة الصلاحيات (Security Group) لبدء دورة العمل السريرية
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            تم تصميم النظام ليحاكي أرقى أنظمة المستشفيات العالمية (مثل Epic Hyperspace و Cerner Millennium)، حيث تتكيف واجهة العمل وأدوات الفحص والمسارات تماماً مع دور ومسؤولية كل مستخدم يدخل المنظومة.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-slate-800 border border-slate-700 mt-2">
            <button
              onClick={() => setActiveTab('quick_profiles')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'quick_profiles'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              الدخول السريع بمجموعات المسؤولية (1-Click Responsibility Launch)
            </button>
            <button
              onClick={() => setActiveTab('manual_login')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'manual_login'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              تسجيل الدخول بالمصادقة المؤسسية (Enterprise SSO)
            </button>
          </div>
        </div>

        {/* Tab 1: Quick Responsibility Profiles (Enterprise Groups) */}
        {activeTab === 'quick_profiles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {HIS_SECURITY_GROUPS.map(group => {
              const staff = allStaff.find(s => s.id === group.suggestedStaffId) || allStaff[0];

              return (
                <div
                  key={group.id}
                  className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-teal-500/60 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 group shadow-md hover:shadow-teal-950/30"
                >
                  <div className="space-y-4">
                    {/* Top Group Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                        {getGroupIcon(group.iconType)}
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getBadgeStyle(
                          group.badgeColor
                        )}`}
                      >
                        {group.shortCode}
                      </span>
                    </div>

                    {/* Group Title & Subtitle */}
                    <div>
                      <h2 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                        {group.nameAr}
                      </h2>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {group.nameEn}
                      </div>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">
                        {group.descriptionAr}
                      </p>
                    </div>

                    {/* Suggested Persona Card */}
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
                      <img
                        src={staff.avatar}
                        alt={staff.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-200 truncate">
                          {staff.name}
                        </div>
                        <div className="text-[10px] text-teal-400 truncate">
                          {staff.title.split('-')[0]}
                        </div>
                      </div>
                    </div>

                    {/* Key Workflows */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-700/50">
                      <div className="text-[10px] font-bold text-slate-400">مسار العمل في النظام:</div>
                      {group.keyWorkflowsAr.slice(0, 3).map((flow, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-1.5 text-[11px] text-slate-300 leading-snug"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                          <span className="truncate">{flow}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Launch Button */}
                  <button
                    onClick={() => loginAsSecurityGroup(group.id, staff.id, group.defaultDepartment)}
                    className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-md hover:shadow-teal-600/30 cursor-pointer"
                  >
                    <span>دخول محطة العمل السريرية</span>
                    <ArrowLeft className="w-4 h-4 rtl:rotate-0 rotate-180" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Manual Credentials & Department Selection */}
        {activeTab === 'manual_login' && (
          <div className="max-w-xl mx-auto bg-slate-800/90 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">تسجيل الدخول المؤسسي واختيار الصلاحية</h2>
                <p className="text-xs text-slate-400">
                  حدد مجموعة الأمان والمستخدم المسؤول للبدء
                </p>
              </div>
            </div>

            <form onSubmit={handleManualLogin} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  معرف الدخول المؤسسي (Username / Email):
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  كلمة المرور المشفرة (Encrypted Password):
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Security Group Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  مجموعة الصلاحيات (Security Responsibility Group):
                </label>
                <select
                  value={selectedGroupId}
                  onChange={e => {
                    const gId = e.target.value;
                    setSelectedGroupId(gId);
                    const found = HIS_SECURITY_GROUPS.find(g => g.id === gId);
                    if (found) {
                      setSelectedStaffId(found.suggestedStaffId);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-bold focus:ring-2 focus:ring-teal-500"
                >
                  {HIS_SECURITY_GROUPS.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.nameAr} ({g.shortCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Staff Persona Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  حساب الكادر الطبي المعين (Staff User Account):
                </label>
                <select
                  value={selectedStaffId}
                  onChange={e => setSelectedStaffId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-teal-500"
                >
                  {allStaff.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {s.title} ({s.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-6 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-lg hover:shadow-teal-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>تسجيل الدخول وبدء الجلسة السريرية</span>
              </button>
            </form>
          </div>
        )}

        {/* Security & Operational Notice */}
        <div className="mt-12 max-w-2xl mx-auto text-center space-y-1.5 text-slate-500 text-xs">
          <div className="flex items-center justify-center gap-1.5 text-slate-400">
            <Lock className="w-3.5 h-3.5 text-teal-500" />
            <span className="font-bold">نظام محمي ومشفر بالكامل وفق معايير الأمان الصحي (HIPAA & CBAHI)</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            جميع الأنشطة السريرية وإجراءات الفحص والوصفات الطبية موثقة ضمن سجل العمليات السريرية وتاريخ الإصدارات (Mock Operational History & Version History) باسم المستخدم ورقم الترخيص.
          </p>
        </div>
      </main>
    </div>
  );
};
