import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState;
  props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    (this as any).setState({ hasError: false, error: null });
    if ((this as any).props.onReset) {
      (this as any).props.onReset();
    }
  };

  render() {
    const { hasError, error } = (this as any).state;
    const { fallbackTitle, children } = (this as any).props;

    if (hasError) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-slate-800 shadow-sm my-4 text-right">
          <div className="flex items-center gap-3 mb-3 text-amber-700">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <h3 className="text-base font-bold">
              {fallbackTitle || 'حدث تنبيه أثناء عرض هذا المكون السريري'}
            </h3>
          </div>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            تم رصد استثناء برمجي وتم حصر نطاقه بأمان لمنع تأثر باقي لوحات النظام وسجل المريض.
            {error?.message && (
              <span className="block font-mono text-[11px] text-red-600 bg-white p-2 rounded mt-2 border border-amber-200 dir-ltr text-left">
                {error.message}
              </span>
            )}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة المحاولة</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <span>تحديث الصفحة</span>
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}

