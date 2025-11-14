import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatBytes(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

export function getStatusColor(status: 'good' | 'warning' | 'critical'): string {
  switch (status) {
    case 'good':
      return 'text-green-400 bg-green-400/10';
    case 'warning':
      return 'text-yellow-400 bg-yellow-400/10';
    case 'critical':
      return 'text-red-400 bg-red-400/10';
  }
}

export function getSeverityColor(severity: 'info' | 'warning' | 'critical'): string {
  switch (severity) {
    case 'info':
      return 'text-blue-400 bg-blue-400/10';
    case 'warning':
      return 'text-yellow-400 bg-yellow-400/10';
    case 'critical':
      return 'text-red-400 bg-red-400/10';
  }
}

export function getPriorityColor(priority: 'low' | 'medium' | 'high'): string {
  switch (priority) {
    case 'low':
      return 'text-blue-400 bg-blue-400/10';
    case 'medium':
      return 'text-yellow-400 bg-yellow-400/10';
    case 'high':
      return 'text-red-400 bg-red-400/10';
  }
}
