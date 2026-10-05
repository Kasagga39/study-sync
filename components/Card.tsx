import React from "react";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow duration-200 ${onClick ? "cursor-pointer" : ""
                } ${className}`}
        >
            {children}
        </div>
    );
};