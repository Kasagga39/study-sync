import React, { useEffect } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/50 backdrop-blur-sm animate-fade-in">
            <div
                className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-gray-100 relative"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
                    <h2 id="modal-title" className="text-xl font-bold text-brand-navy">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-brand-slate text-xl font-bold p-1 rounded focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};