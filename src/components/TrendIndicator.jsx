import React from "react";

export default function TrendIndicator({ value, showIcon = true, className = "" }) {
  const isPositive = value >= 0;
  const absValue = Math.abs(value);

  return (
    <span className={`${isPositive ? "trend-up" : "trend-down"} ${className}`}>
      {showIcon && (
        <svg 
          className={`w-4 h-4 ${isPositive ? "rotate-0" : "rotate-180"}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )}
      {isPositive ? "+" : ""}{absValue}%
    </span>
  );
}

