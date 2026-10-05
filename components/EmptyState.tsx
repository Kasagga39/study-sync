import React from "react";
import { Button } from "./Button";

interface EmptyStateProps {
    title: string;
    description: string;
    actionText?: string;
    onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    actionText,
    onAction,
}) => {
    return (
        <div className="text-center py-12 px-4 bg-brand-bg/50 border-2 border-dashed border-gray-200 rounded-xl my-4">
            <div className="w-12 h-12 bg-brand-accent/50 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl">
                !
            </div>
            <h3 className="text-lg font-bold text-brand-navy mb-1">{title}</h3>
            <p className="text-sm text-brand-slate max-w-md mx-auto mb-6">{description}</p>
            {actionText && onAction && (
                <Button onClick={onAction} variant="primary" className="mx-auto">
                    {actionText}
                </Button>
            )}
        </div>
    );
};