export interface GPUMetric {
  _id?: string;
  timestamp: string;
  gpu_id: string;
  gpu_type: string;
  model: string;
  utilization: number;
  memory_used: number;
  memory_total: number;
  temperature: number;
  power_draw: number;
}

export interface WorkloadStatus {
  status: 'never_started' | 'running' | 'stopped';
  pid?: number;
  started_at?: string;
}
