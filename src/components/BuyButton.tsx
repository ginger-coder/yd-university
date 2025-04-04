import React from 'react';
import { useTranslation } from 'react-i18next';

interface BuyButtonProps {
    onClick: () => void;
    purchasing: boolean;
    className?: string;
}

const BuyButton: React.FC<BuyButtonProps> = ({
    onClick,
    purchasing,
    className = '',
}) => {
    const { t } = useTranslation();

    return (
        <button
            onClick={onClick}
            disabled={purchasing}
            className={`group bg-green-600 text-white p-2.5 rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 disabled:opacity-70 flex items-center justify-center ${className}`}
            aria-label={purchasing ? "Purchasing..." : t("home.buy")}
        >
            {purchasing ? (
                <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 group-hover:scale-110 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                </svg>
            )}
        </button>
    );
};

export default BuyButton;