import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, id, className = "", ...props }) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor={inputId} className="text-sm font-semibold text-brand-slate">
                {label}
            </label>
            <input
                id={inputId}
                className={`w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-brand-slate focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all ${error ? "border-red-500" : ""
                    } ${className}`}
                {...props}
            />
            {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
        </div>
    );
};