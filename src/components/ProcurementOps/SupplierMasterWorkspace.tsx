import React, { useState } from 'react';
import { 
  Building, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  Phone, 
  Mail, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { SupplierMaster, SupplierCategory, QualificationStatus } from '../../types/procurementOps';

interface SupplierMasterProps {
  suppliers: SupplierMaster[];
  activeRole: string;
  onUpdateQualificationStatus?: (supplierId: string, status: QualificationStatus) => void;
}

export const SupplierMasterWorkspace: React.FC<SupplierMasterProps> = ({
  suppliers,
  activeRole,
  onUpdateQualificationStatus
}) => {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  const filteredSuppliers = suppliers.filter(s => {
    if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && s.qualificationStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNameAr = s.legalNameAr.toLowerCase().includes(q);
      const matchNameEn = s.legalNameEn.toLowerCase().includes(q);
      const matchCr = s.commercialRegistrationNumber.includes(q);
      const matchTax = s.taxIdentificationNumber.includes(q);
      if (!matchNameAr && !matchNameEn && !matchCr && !matchTax) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-600" />
            <span>سجل الموردين والتأهيل والامتثال (Suppliers & Qualification)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إدارة بيانات الموردين المعتمدين، متابعة سريان السجلات التجارية ورخص الغذاء والدواء (SFDA)، ومراقبة الأداء التعاقدي.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">
            إجمالي الموردين: <strong className="text-indigo-700">{suppliers.length} مورد</strong>
          </span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* Search & Filter Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث باسم المورد، السجل التجاري، أو الرقم الضريبي..."
                className="w-full pr-9 pl-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
              >
                <option value="all">كافة حالات التأهيل</option>
                <option value="qualified">مؤهل معتمد</option>
                <option value="conditionally_qualified">مؤهل مشروط</option>
                <option value="expired">منتهي التأهيل</option>
                <option value="restricted">محظور / استبعاد</option>
              </select>
            </div>
          </div>

          {/* Suppliers Cards */}
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredSuppliers.map(sup => {
              const isSelected = sup.id === selectedSupplierId;
              return (
                <div
                  key={sup.id}
                  onClick={() => setSelectedSupplierId(sup.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/50 border-indigo-500 shadow-xs ring-1 ring-indigo-500/30'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{sup.supplierCode}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sup.qualificationStatus === 'qualified' ? 'bg-emerald-100 text-emerald-800' :
                      sup.qualificationStatus === 'conditionally_qualified' ? 'bg-amber-100 text-amber-800' :
                      sup.qualificationStatus === 'expired' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {sup.qualificationStatus === 'qualified' ? 'مؤهل معتمد' :
                       sup.qualificationStatus === 'conditionally_qualified' ? 'مؤهل مشروط' :
                       sup.qualificationStatus === 'expired' ? 'منتهي التأهيل' : 'محظور / غير مؤهل'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 mt-1">{sup.legalNameAr}</h4>
                  <div className="text-[11px] text-slate-500 mt-0.5">{sup.legalNameEn}</div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>السجل: {sup.commercialRegistrationNumber}</span>
                    <span className="font-bold text-indigo-600">{sup.performanceRating}/5.0 ★</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Detail (7 cols) */}
        <div className="lg:col-span-7">
          {selectedSupplier ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900">{selectedSupplier.supplierCode}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      selectedSupplier.qualificationStatus === 'qualified' ? 'bg-emerald-100 text-emerald-800' :
                      selectedSupplier.qualificationStatus === 'conditionally_qualified' ? 'bg-amber-100 text-amber-800' :
                      selectedSupplier.qualificationStatus === 'expired' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedSupplier.qualificationStatus === 'qualified' ? 'مورد مؤهل ومصرح له بالترسية' :
                       selectedSupplier.qualificationStatus === 'conditionally_qualified' ? 'مؤهل مشروط بموافقة إضافية' :
                       selectedSupplier.qualificationStatus === 'expired' ? 'منتهي التأهيل (ممنوع الترسية)' :
                       'محظور وغير مؤهل (Restricted)'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-1">{selectedSupplier.legalNameAr}</h3>
                  <p className="text-xs text-slate-500">{selectedSupplier.legalNameEn}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-left shrink-0">
                  <span className="text-[10px] text-slate-400 font-semibold block">تقييم أداء التوريد (KPI)</span>
                  <span className="font-mono text-lg font-bold text-indigo-700">
                    {selectedSupplier.performanceRating} / 5.0
                  </span>
                  <span className="text-[10px] text-emerald-600 block font-medium">توريد ملتزم</span>
                </div>
              </div>

              {/* Expired / Warning Banner if applicable (PROC09, PROC10) */}
              {(selectedSupplier.qualificationStatus === 'expired' || selectedSupplier.qualificationStatus === 'restricted') && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-800">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">تنبيه نظامي: لا يجوز إصدار أمر شراء أو ترسية منافسة لهذا المورد:</strong>
                    <span>
                      انتهت صلاحية الوثائق التأهيلية أو السجل التجاري أو رخصة الهيئة العامة للغذاء والدواء. يتطلب النظام تجديد التأهيل الرسمي قبل فتح المجال للمشاركة.
                    </span>
                  </div>
                </div>
              )}

              {/* Registration & Legal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                  <span className="font-bold text-slate-700 block">البيانات النظامية والتجارية:</span>
                  <div>السجل التجاري: <strong className="font-mono">{selectedSupplier.commercialRegistrationNumber}</strong></div>
                  <div>الرقم الضريبي (ZATCA): <strong className="font-mono">{selectedSupplier.taxIdentificationNumber}</strong></div>
                  <div>سريان التأهيل حتى: <strong className="font-mono text-indigo-700">{selectedSupplier.qualificationExpiryDate}</strong></div>
                  <div>التصنيف: <strong>{selectedSupplier.category}</strong></div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                  <span className="font-bold text-slate-700 block">بيانات الاتصال والحساب البنكي:</span>
                  <div>مسؤول الاتصال: <strong>{selectedSupplier.contactPersonName}</strong></div>
                  <div>الهاتف: <strong className="font-mono text-slate-700">{selectedSupplier.contactPhone}</strong></div>
                  <div>البريد: <strong className="text-slate-700">{selectedSupplier.contactEmail}</strong></div>
                  <div>الآيبان البنكي: <strong className="font-mono text-[11px] text-slate-600">{selectedSupplier.bankIban}</strong></div>
                </div>
              </div>

              {/* Compliance Documents Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                  الشهادات والتراخيص النظامية ({selectedSupplier.complianceDocuments.length})
                </h4>

                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">نوع الوثيقة</th>
                        <th className="p-2.5">الرقم المرجعي</th>
                        <th className="p-2.5">تاريخ الانتهاء</th>
                        <th className="p-2.5 text-center">حالة السريان</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedSupplier.complianceDocuments.map((doc, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-bold text-slate-800">{doc.documentType}</td>
                          <td className="p-2.5 font-mono text-slate-600">{doc.documentNumber}</td>
                          <td className="p-2.5 font-mono text-slate-700">{doc.expiryDate}</td>
                          <td className="p-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              doc.status === 'valid' ? 'bg-emerald-100 text-emerald-800' :
                              doc.status === 'expired' ? 'bg-red-100 text-red-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {doc.status === 'valid' ? 'ساري الصلاحية' :
                               doc.status === 'expired' ? 'منتهي الصلاحية' : 'قارب على الانتهاء'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              اختر مورداً من القائمة لعرض ملف التأهيل.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
