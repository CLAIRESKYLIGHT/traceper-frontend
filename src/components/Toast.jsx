import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const bgColor = type === "success" 
    ? "bg-green-50 border-green-200" 
    : type === "error"
    ? "bg-red-50 border-red-200"
    : "bg-blue-50 border-blue-200";

  const textColor = type === "success"
    ? "text-green-800"
    : type === "error"
    ? "text-red-800"
    : "text-blue-800";

  const iconColor = type === "success"
    ? "text-green-600"
    : type === "error"
    ? "text-red-600"
    : "text-blue-600";

  const icon = type === "success" ? (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ) : type === "error" ? (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ) : (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div className={`fixed top-4 right-4 z-[100] ${bgColor} border-2 rounded-xl shadow-2xl p-4 min-w-[320px] max-w-md animate-slideInRight`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${iconColor}`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className={`font-semibold ${textColor}`}>
            {type === "success" ? "Success" : type === "error" ? "Error" : "Info"}
          </p>
          <p className={`text-sm mt-1 ${textColor} opacity-90`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${textColor} hover:opacity-70 transition-opacity`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

