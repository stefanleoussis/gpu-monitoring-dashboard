import { GPUMetric, WorkloadStatus } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getCurrentMetric(): Promise<GPUMetric> {
  const response = await fetch(`${API_URL}/api/metrics/current`);

  if (!response.ok) {
    throw new Error('Failed to fetch metrics');
  }

  return response.json();
}

export async function getMetricsHistory(timeRange: '1h' | '24h' | '7d'): Promise<GPUMetric[]> {
  const response = await fetch(`${API_URL}/api/metrics/history?range=${timeRange}`);

  if (!response.ok) {
    throw new Error('Failed to fetch history');
  }

  return response.json();
}

export async function getWorkloadStatus(): Promise<WorkloadStatus> {
  const response = await fetch(`${API_URL}/api/workload/status`);

  if (!response.ok) {
    throw new Error('Failed to fetch workload status');
  }

  return response.json();
}

export async function startWorkload(): Promise<WorkloadStatus> {
  const response = await fetch(`${API_URL}/api/workload/start`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to start workload');
  }

  return response.json();
}

export async function stopWorkload(): Promise<WorkloadStatus> {
  const response = await fetch(`${API_URL}/api/workload/stop`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to stop workload');
  }

  return response.json();
}
