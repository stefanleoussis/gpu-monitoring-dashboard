'use client';

import { TooltipProps } from './LineChart';

export function ChartTooltip({ active, payload, label }: TooltipProps) {
    if (!active || !payload || payload.length === 0 || !label) return null;

    const data = payload[0].payload;

    const date = new Date(label);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });

    return (
        <div className='rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-gray-950'>
            <p className='mb-2 text-sm font-semibold text-gray-900 dark:text-gray-50'>
                {formattedTime} <span className='text-gray-400'>{formattedDate}</span>
            </p>
            <div className='space-y-1.5'>
                <div className='flex items-center justify-between gap-4'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>Utilization</span>
                    <span className='font-medium text-gray-900 dark:text-gray-50'>
                        {data.utilization}%
                    </span>
                </div>
                <div className='flex items-center justify-between gap-4'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>Temperature</span>
                    <span className='font-medium text-gray-900 dark:text-gray-50'>
                        {data.temperature}°C
                    </span>
                </div>
                <div className='flex items-center justify-between gap-4'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>Memory</span>
                    <span className='font-medium text-gray-900 dark:text-gray-50'>
                        {(data.memory_used / 1024).toFixed(1)} GB
                    </span>
                </div>

                <div className='flex items-center justify-between gap-4'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>Power</span>
                    <span className='font-medium text-gray-900 dark:text-gray-50'>
                        {data.power_draw.toFixed(1)} W
                    </span>
                </div>
            </div>
        </div>
    );
}
