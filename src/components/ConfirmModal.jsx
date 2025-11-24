export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger" // "danger" or "warning"
}) {
  if (!isOpen) return null;

  const bgColor = type === "danger" 
    ? "bg-red-50 border-red-200" 
    : "bg-gradient-to-r from-yellow-soft to-yellow-pale border-yellow-200";

  const iconColor = type === "danger"
    ? "text-red-600"
    : "text-yellow-warm";

  const buttonColor = type === "danger"
    ? "bg-red-600 hover:bg-red-700"
    : "bg-gradient-to-r from-yellow-warm to-yellow-accent hover:from-yellow-accent hover:to-yellow-warm text-teal-900";

  const icon = type === "danger" ? (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ) : (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn border border-teal-100">
        <div className={`${bgColor} border-b-2 p-6 rounded-t-2xl`}>
          <div className="flex items-center gap-4">
            <div className={`flex-shrink-0 ${iconColor}`}>
              {icon}
            </div>
            <h3 className="text-xl font-bold text-teal-900">{title}</h3>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed">{message}</p>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-teal-100">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors font-semibold border border-teal-200"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-6 py-3 ${buttonColor} rounded-lg transition-all font-semibold shadow-lg hover:shadow-xl`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

