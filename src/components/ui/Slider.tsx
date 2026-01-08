'use client';

import * as React from 'react';

interface SliderProps {
    defaultValue?: number[];
    max?: number;
    step?: number;
    onValueCommit?: (values: number[]) => void;
    className?: string;
}

const Slider = ({
    defaultValue = [0, 100],
    max = 100,
    step = 1,
    onValueCommit,
    className,
}: SliderProps) => {
    const [values, setValues] = React.useState(defaultValue);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value);
        const newValues = [values[0], newValue];
        setValues(newValues);
        onValueCommit?.(newValues);
    };

    return (
        <div className={`w-full ${className}`}>
            <input
                type="range"
                min={0}
                max={max}
                step={step}
                value={values[1]}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
        </div>
    );
};

export { Slider };
