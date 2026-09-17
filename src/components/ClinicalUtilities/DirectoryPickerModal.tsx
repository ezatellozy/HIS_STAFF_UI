import React, { useState } from 'react';
import { Search, UserCheck, Users, Stethoscope, Building2, X, Check, Activity } from 'lucide-react';
import { ChatParticipant, StaffPresence } from '../../types/clinicalUtilities';
import { MOCK_STAFF_DIRECTORY } from '../../data/mockClinicalUtilitiesData';

interface DirectoryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectParticipant: (participant: ChatParticipant) => void;
  titleAr?: string;
  excludeIds?: string[];
}

export const DirectoryPickerModal: React.FC<DirectoryPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectParticipant,
  titleAr = 'دليل الكادر والفرق السريرية (Staff & Teams Directory)',
  excludeIds = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'doctors' | 'nurses' | 'pharmacists' | 'teams'>('all');

  if (!isOpen) return null;

  const filteredDirectory = MOCK_STAFF_DIRECTORY.filter(item => {
    if (excludeIds.includes(item.id)) return false;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.unit && item.unit.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.specialty && item.specialty.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeCategory === 'doctors') return item.role.includes('استشاري') || item.role.includes('طبيب');
    if (activeCategory === 'nurses') return item.role.includes('تمريض') || item.role.includes('RN');
    if (activeCategory === 'pharmacists') return item.role.includes('صيدلي') || item.role.includes('PharmD');
    if (activeCategory === 'teams') return item.role.includes('Team') || item.role.includes('فريق');

    return true;
  });

  const getPresenceBadge = (presence: StaffPresence) => {
    switch (presence) {
      case 'available':
        return (
          <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            متاح (Available)
          </span>
        );
      case 'in_procedure':
        return (
          <span className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            في عملية جراحية
          </span>
        );
      case 'busy':
        return (
          <span className="flex items-center gap-1 text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            مشغول بحالة حرجة
          </span>
        );
      case 'offline':
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            غير متصل
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">{titleAr}</h3>
              <p className="text-[11px] text-slate-400">تحديد المستلم أو الفريق للتنسيق والتواصل المباشر</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="ابحث بالاسم، التخصص، أو الوحدة السريرية..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-3 pr-9 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-xs">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-colors ${
                activeCategory === 'all'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              الكل ({MOCK_STAFF_DIRECTORY.length})
            </button>
            <button
              onClick={() => setActiveCategory('doctors')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-colors ${
                activeCategory === 'doctors'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              الأطباء والاستشاريون
            </button>
            <button
              onClick={() => setActiveCategory('nurses')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-colors ${
                activeCategory === 'nurses'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              التمريض
            </button>
            <button
              onClick={() => setActiveCategory('pharmacists')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-colors ${
                activeCategory === 'pharmacists'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              الصيادلة الإكلينيكيون
            </button>
            <button
              onClick={() => setActiveCategory('teams')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-colors ${
                activeCategory === 'teams'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              الفرق المناوبة
            </button>
          </div>
        </div>

        {/* Directory List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-100">
          {filteredDirectory.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              لم يتم العثور على أفراد أو فرق مطابقة لبحثك
            </div>
          ) : (
            filteredDirectory.map(participant => (
              <div
                key={participant.id}
                onClick={() => {
                  onSelectParticipant(participant);
                  onClose();
                }}
                className="pt-2 first:pt-0 p-2 rounded-xl hover:bg-teal-50/60 border border-transparent hover:border-teal-200 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-teal-100 text-slate-700 group-hover:text-teal-800 flex items-center justify-center font-bold text-sm border border-slate-200 group-hover:border-teal-300 shrink-0">
                    {participant.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-xs group-hover:text-teal-900">
                        {participant.name}
                      </h4>
                      {participant.isCurrentUser && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                          أنت (You)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{participant.role}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                      {participant.unit && <span>الوحدة: {participant.unit}</span>}
                      {participant.specialty && <span>• {participant.specialty}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {getPresenceBadge(participant.presence)}
                  <span className="text-[11px] font-bold text-teal-600 group-hover:underline flex items-center gap-1">
                    بدء محادثة ➔
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>دليل الكادر والفرق السريرية (سياق إرشادي تجريبي — لا يقيد أهلية التواصل)</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-slate-700 text-xs transition-colors cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
