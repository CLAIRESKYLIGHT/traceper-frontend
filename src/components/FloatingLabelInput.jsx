import React, { useState } from "react";

export default function FloatingLabelInput({
  label,
  type = "text",
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder,
  className = "",
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.toString().length > 0;

  return (
    <div className={`input-floating ${className}`}>
      <input
        type={type}
        value={value || ""}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder || (isFocused || hasValue ? "" : " ")}
        required={required}
        disabled={disabled}
        className={`
          w-full px-4 py-3 border rounded-lg transition-all duration-200
          ${error 
            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200" 
            : "border-teal-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          }
          ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}
          ${hasValue || isFocused ? "pt-5 pb-1" : ""}
        `}
        {...props}
      />
      <label
        className={`
          ${hasValue || isFocused 
            ? "-top-2 left-3 text-xs text-teal-600 bg-white px-2" 
            : "top-1/2 -translate-y-1/2 left-4 text-gray-500"
          }
          transition-all duration-200 pointer-events-none
        `}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

