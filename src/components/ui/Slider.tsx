'use client';

import * as React from 'react';

interface SliderProps {
    value: number[];
    max?: number;
    step?: number;
    onChange: (values: number[]) => void;
    className?: string;
}

const Slider = ({
    value,
    max = 100,
    step = 1,
    onChange,
    className,
}: SliderProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value) || 0;
        const newValues = [value[0] || 0, newValue];
        onChange(newValues);
    };

    return (
        <div className={`w-full ${className}`}>
            <input
                type="range"
                min={0}
                max={max}
                step={step}
                value={value[1] ?? 0}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
        </div>
    );
};

export { Slider };
