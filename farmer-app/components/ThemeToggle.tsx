'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState, useRef } from 'react';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (!mounted) return null;

    const themes = [
        { name: 'Light', value: 'light', icon: 'light_mode' },
        { name: 'Dark', value: 'dark', icon: 'dark_mode' },
        { name: 'System', value: 'system', icon: 'computer' },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                title="Toggle Theme"
            >
                <div className="flex items-center gap-3">
                    <span className="material-icons text-gray-500 group-hover:text-primary transition-colors">
                        {theme === 'dark' ? 'dark_mode' : 'light_mode'}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-primary transition-colors">
                        Theme
                    </span>
                </div>
                <span className="material-icons text-gray-400 text-sm">expand_more</span>
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden z-50 animate-fade-in">
                    {themes.map((t) => (
                        <button
                            key={t.value}
                            onClick={() => {
                                setTheme(t.value);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 p-3 text-sm transition-colors text-left ${theme === t.value
                                    ? 'bg-primary/10 text-primary'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                                }`}
                        >
                            <span className={`material-icons text-lg ${theme === t.value ? 'text-primary' : 'text-gray-400'}`}>
                                {t.icon}
                            </span>
                            {t.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
