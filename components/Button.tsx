import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "outline";
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    isLoading = false,
    className = "",
    disabled,
    ...props
}) => {
    const baseStyles = "px-4 py-2.5 rounded-lg font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm";

    const variants = {
        primary: "bg-brand-primary text-brand-bg hover:bg-brand-navy focus:ring-brand-primary",
        secondary: "bg-brand-accent text-brand-navy hover:bg-opacity-80 focus:ring-brand-accent",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        outline: "border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-brand-bg focus:ring-brand-primary",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {children}
        </button>
    );
};