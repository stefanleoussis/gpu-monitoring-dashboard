'use client';

import { GPUMetric, WorkloadStatus } from '@/lib/types';
import { Badge } from './ui/badge';
import { useEffect, useState } from 'react';
import { getMetricsHistory, startWorkload, stopWorkload } from '@/lib/api';
import { Dot, Pause, Play } from 'lucide-react';
import { LiquidButton } from './animate-ui/components/buttons/liquid';
import { UtilLineChart } from './UtilLineChart';
import { TempAreaChart } from './TempAreaChart';
import { MemoryDonutChart } from './MemoryDonutChart';
import { SparkAreaChart } from './SparkChart';

interface Props {
    metric: GPUMetric;
    initialWorkloadStatus: WorkloadStatus;
}

type TimeRange = '1h' | '24h' | '7d';

export default function Metrics({ metric, initialWorkloadStatus }: Props) {
    const [workloadStatus, setWorkloadStatus] = useState<WorkloadStatus>(initialWorkloadStatus);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRange, setSelectedRange] = useState<TimeRange>('1h');
    const [history, setHistory] = useState<GPUMetric[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    useEffect(() => {
        async function fetchHistory() {
            setIsLoadingHistory(true);

            try {
                const data = await getMetricsHistory(selectedRange);
                setHistory(data);
            } catch (error) {
                console.error('Failed to fetch history:', error);
            } finally {
                setIsLoadingHistory(false);
            }
        }
        fetchHistory();
    }, [selectedRange]);

    const handleWorkloadToggle = async () => {
        setIsLoading(true);
        try {
            console.log(workloadStatus.status);
            if (workloadStatus.status === 'running') {
                const result = await stopWorkload();
                setWorkloadStatus(result);
            } else {
                const result = await startWorkload();
                console.log(result);
                setWorkloadStatus(result);
            }
        } catch (error) {
            console.error('Failed to toggle workload:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className='mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 md:grid-rows-4 lg:grid-cols-[370px_1fr_1fr] lg:grid-rows-2'>
                <div className='row-span-2 grid'>
                    <div className='flex h-80 w-full flex-col justify-between rounded-md border bg-[#1A1A1A] p-6'>
                        <div>
                            <div className='flex justify-between gap-4'>
                                <div className='text-2xl text-cyan-400'>Status:</div>
                                <Badge
                                    variant={
                                        workloadStatus.status === 'running' ? 'success' : 'default'
                                    }
                                >
                                    {workloadStatus.status === 'running' ? (
                                        <div className='flex items-center justify-center pl-2'>
                                            Running <Dot className='m-0' />
                                        </div>
                                    ) : (
                                        <div className='flex items-center gap-1'>
                                            Paused <Pause size={11} />
                                        </div>
                                    )}
                                </Badge>
                            </div>
                            <div className='mt-16 text-gray-400'>
                                GPU Type: <span className='text-cyan-400'>{metric.gpu_type}</span>
                            </div>
                            <div className='mt-2 text-gray-400'>
                                Model: <span className='text-cyan-400'>{metric.model}</span>
                            </div>
                        </div>
                        <div className='flex justify-end'>
                            <LiquidButton
                                variant={workloadStatus.status === 'running' ? 'pause' : 'default'}
                                onClick={handleWorkloadToggle}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    'Loading...'
                                ) : workloadStatus.status === 'running' ? (
                                    <div className='flex items-center gap-2'>
                                        Pause Workload <Pause />
                                    </div>
                                ) : (
                                    <div className='flex items-center gap-2'>
                                        Start Workload <Play />
                                    </div>
                                )}
                            </LiquidButton>
                        </div>
                    </div>
                </div>
                <div className='row-span-1 grid'>
                    <div className='flex h-36 w-full justify-between rounded-md border bg-[#1A1A1A] px-6 pt-6 pb-8 md:min-w-[310px]'>
                        <div>
                            <div className='text-xl text-cyan-400'>Utilization:</div>
                            <div className='mt-3 flex items-baseline gap-2'>
                                <div className='text-5xl font-bold'>{metric.utilization}%</div>
                            </div>
                        </div>
                        <div className='mt-2 hidden h-20 w-30 rounded-md border bg-[#252525] shadow-2xl md:block'>
                            <SparkAreaChart
                                data={history}
                                categories={['utilization']}
                                index='timestamp'
                                colors={['blue']}
                                className='h-20 w-30'
                            />
                        </div>
                    </div>
                </div>
                <div className='row-span-1 grid md:col-span-2 md:col-start-1 md:row-start-3 lg:col-start-3 lg:row-start-1'>
                    <div className='flex h-36 w-full justify-between rounded-md border bg-[#1A1A1A] px-6 pt-6 pb-8 md:min-w-[420px]'>
                        <div>
                            <div className='text-xl text-cyan-400'>Memory Usage:</div>

                            <div className='mt-3 flex items-baseline gap-2'>
                                <div className='text-5xl font-bold'>
                                    {(metric.memory_used / 1024).toFixed(1)}
                                </div>
                                <div className='text-gray-400'>/ 24 GB</div>
                            </div>
                        </div>
                        <div className='mt-2 hidden h-20 w-30 rounded-md border bg-[#252525] shadow-2xl md:block'>
                            <SparkAreaChart
                                data={history.map(m => ({
                                    ...m,
                                    memory_percent: (m.memory_used / m.memory_total) * 100,
                                }))}
                                categories={['memory_percent']}
                                index='timestamp'
                                colors={['cyan']}
                                className='h-20 w-30'
                            />
                        </div>
                    </div>
                </div>
                <div className='grid md:col-start-2 md:row-start-2 lg:row-span-1'>
                    <div className='flex h-36 w-full justify-between rounded-md border bg-[#1A1A1A] px-6 pt-6 pb-8 md:min-w-[310px]'>
                        <div>
                            <div className='text-xl text-cyan-400'>Temperature:</div>
                            <div className='mt-3 flex items-baseline gap-2'>
                                <div className='text-5xl font-bold'>{metric.temperature}°C</div>
                            </div>
                        </div>
                        <div className='mt-2 hidden h-20 w-30 rounded-md border bg-[#252525] shadow-2xl md:block'>
                            <SparkAreaChart
                                data={history}
                                categories={['temperature']}
                                index='timestamp'
                                colors={['pink']}
                                className='h-20 w-30'
                            />
                        </div>
                    </div>
                </div>
                <div className='row-span-1 grid md:col-span-2 md:col-start-1 md:row-start-4 lg:col-start-3 lg:row-start-2'>
                    <div className='flex h-36 w-full justify-between rounded-md border bg-[#1A1A1A] px-6 pt-6 pb-8 md:min-w-[420px]'>
                        <div>
                            <div className='text-xl text-cyan-400'>Power Draw:</div>
                            <div className='mt-3 flex items-baseline gap-2'>
                                <div className='text-3xl font-bold md:text-5xl'>
                                    {metric.power_draw}
                                </div>
                                <div className='text-gray-400'>/ 450 W</div>
                            </div>
                        </div>
                        <div className='mt-2 hidden h-20 w-30 rounded-md border bg-[#252525] shadow-2xl md:block'>
                            <SparkAreaChart
                                data={history}
                                categories={['power_draw']}
                                index='timestamp'
                                colors={['violet']}
                                className='h-20 w-30'
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className='mt-8 grid gap-8 md:grid-cols-1 lg:grid-cols-[1fr_400px]'>
                <div className='flex w-full flex-col gap-2 rounded-md border bg-[#1A1A1A] p-6'>
                    <div className='text-xl text-cyan-400'>GPU Utilization Trend:</div>
                    <div className='text-sm text-gray-400'>
                        Last hour data with real-time updates
                    </div>
                    <div className='mt-4 flex gap-4'>
                        <button
                            className='p-0 text-xs hover:text-white'
                            onClick={() => setSelectedRange('1h')}
                        >
                            <Badge
                                className='h-8'
                                variant={selectedRange === '1h' ? 'success' : 'default'}
                            >
                                1 H
                            </Badge>
                        </button>
                        <button
                            className='p-0 text-xs hover:text-white'
                            onClick={() => setSelectedRange('24h')}
                        >
                            <Badge
                                className='h-8'
                                variant={selectedRange === '24h' ? 'success' : 'default'}
                            >
                                1 D
                            </Badge>
                        </button>
                        <button
                            className='p-0 text-xs hover:text-white'
                            onClick={() => setSelectedRange('7d')}
                        >
                            <Badge
                                className='h-8'
                                variant={selectedRange === '7d' ? 'success' : 'default'}
                            >
                                1 W
                            </Badge>
                        </button>
                    </div>
                    <div className='mt-2 h-100 w-full rounded-md border bg-black'>
                        <div className='h-full w-full p-4'>
                            {isLoadingHistory ? (
                                <div className='flex h-full items-center justify-center text-gray-400'>
                                    Loading...
                                </div>
                            ) : (
                                <UtilLineChart data={history} timeRange={selectedRange} />
                            )}
                        </div>
                    </div>
                </div>
                <div className='flex w-full flex-col justify-between gap-8 rounded-md border bg-[#1A1A1A] p-6'>
                    <div>
                        <div className='text-xl text-cyan-400'>Memory Breakdown:</div>
                        <div className='mt-2 text-sm text-gray-400'>VRAM Memory Usage graphed</div>
                    </div>
                    <div className='flex h-80 w-full items-center justify-center rounded-lg border bg-[#252525]/5 shadow-lg backdrop-blur-md transition-opacity hover:border-gray-400/20 hover:bg-[#252525]/10 hover:shadow-2xl'>
                        <MemoryDonutChart metric={metric} />
                    </div>
                    <div />
                </div>
            </div>
            <div className='mt-8 flex w-full flex-col gap-2 rounded-md border bg-[#1A1A1A] p-6'>
                <div className='text-xl text-cyan-400'>GPU Temperature Trend:</div>
                <div className='text-sm text-gray-400'>Last hour data with real-time updates</div>
                <div className='mt-4 flex gap-4'>
                    <button
                        className='p-0 text-xs hover:text-white'
                        onClick={() => setSelectedRange('1h')}
                    >
                        <Badge
                            className='h-8'
                            variant={selectedRange === '1h' ? 'success' : 'default'}
                        >
                            1 H
                        </Badge>
                    </button>
                    <button
                        className='p-0 text-xs hover:text-white'
                        onClick={() => setSelectedRange('24h')}
                    >
                        <Badge
                            className='h-8'
                            variant={selectedRange === '24h' ? 'success' : 'default'}
                        >
                            1 D
                        </Badge>
                    </button>
                    <button
                        className='p-0 text-xs hover:text-white'
                        onClick={() => setSelectedRange('7d')}
                    >
                        <Badge
                            className='h-8'
                            variant={selectedRange === '7d' ? 'success' : 'default'}
                        >
                            1 W
                        </Badge>
                    </button>
                </div>
                <div className='mt-2 w-full rounded-md border bg-black'>
                    <div className='h-full w-full p-4'>
                        {isLoadingHistory ? (
                            <div className='flex h-full items-center justify-center text-gray-400'>
                                Loading...
                            </div>
                        ) : (
                            <TempAreaChart data={history} timeRange={selectedRange} />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
