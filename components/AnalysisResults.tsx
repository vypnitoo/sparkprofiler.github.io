'use client';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  Cpu,
  MemoryStick,
  Gauge,
  Users,
  CheckCircle2,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { AnalysisResult, SparkProfilerData } from '@/types/spark';
import {
  cn,
  formatNumber,
  formatBytes,
  formatPercentage,
  getScoreColor,
  getStatusColor,
  getSeverityColor,
  getPriorityColor,
} from '@/lib/utils';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface Props {
  result: AnalysisResult;
  profileData: SparkProfilerData;
}

export default function AnalysisResults({ result, profileData }: Props) {
  const stats = profileData.metadata.systemStatistics;
  const platformStats = profileData.platformStatistics;

  const severityIcons = {
    critical: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const priorityIcons = {
    high: Flame,
    medium: TrendingUp,
    low: CheckCircle2,
  };

  // Prepare entity chart data
  const entityData = profileData.platformStatistics?.world
    ? Object.entries(profileData.platformStatistics.world.entities)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({ name, count }))
    : [];

  const COLORS = ['#3b82f6', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#f97316'];

  return (
    <div className="space-y-8">
      {/* Overall Score */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-strong rounded-2xl p-8 text-center shine"
      >
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Your Server Score</h2>
        <div className="relative inline-block">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-muted"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="80"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 80}`}
              strokeDashoffset={`${2 * Math.PI * 80 * (1 - result.overallScore / 100)}`}
              className={cn('transition-all duration-1000', getScoreColor(result.overallScore))}
              initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - result.overallScore / 100) }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className={cn('text-5xl font-bold', getScoreColor(result.overallScore))}
            >
              {result.overallScore}
            </motion.span>
          </div>
        </div>
        <p className="mt-4 text-muted-foreground">
          {result.overallScore >= 80 && 'Looking good! Your server is running smooth.'}
          {result.overallScore >= 60 && result.overallScore < 80 && 'Not bad, but there\'s room to make it better.'}
          {result.overallScore >= 40 && result.overallScore < 60 && 'Some issues here. You should probably fix these.'}
          {result.overallScore < 40 && 'Yikes. Your server needs help ASAP.'}
        </p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Gauge,
            label: 'TPS',
            value: result.metrics.performance.tps.value.toFixed(2),
            status: result.metrics.performance.tps.status,
            detail: '/20.0',
          },
          {
            icon: Cpu,
            label: 'MSPT',
            value: result.metrics.performance.mspt.value.toFixed(1),
            status: result.metrics.performance.mspt.status,
            detail: 'ms',
          },
          {
            icon: MemoryStick,
            label: 'Memory',
            value: formatPercentage(result.metrics.memory.usage),
            status: result.metrics.memory.status,
            detail: formatBytes(platformStats?.memory?.heap?.used || 0),
          },
          {
            icon: Users,
            label: 'Entities',
            value: formatNumber(result.metrics.entities.total),
            status: result.metrics.entities.status,
            detail: 'total',
          },
        ].map((metric, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className={cn('glass-strong rounded-xl p-6 hover:scale-105 transition-transform')}
          >
            <div className="flex items-start justify-between mb-3">
              <metric.icon className="w-6 h-6 text-primary" />
              <span className={cn('text-xs px-2 py-1 rounded-full font-semibold', getStatusColor(metric.status))}>
                {metric.status.toUpperCase()}
              </span>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">{metric.value}</div>
            <div className="text-sm text-muted-foreground">{metric.label} {metric.detail}</div>
          </motion.div>
        ))}
      </div>

      {/* Issues */}
      {result.issues.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-strong rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            Problems Found ({result.issues.length})
          </h3>
          <div className="space-y-4">
            {result.issues.map((issue, i) => {
              const Icon = severityIcons[issue.severity];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="glass p-6 rounded-xl border-l-4"
                  style={{
                    borderLeftColor:
                      issue.severity === 'critical'
                        ? 'rgb(248 113 113)'
                        : issue.severity === 'warning'
                        ? 'rgb(251 191 36)'
                        : 'rgb(96 165 250)',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn('p-3 rounded-lg', getSeverityColor(issue.severity))}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-lg text-foreground">{issue.title}</h4>
                        <span className={cn('text-xs px-3 py-1 rounded-full font-semibold', getSeverityColor(issue.severity))}>
                          {issue.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-2">{issue.description}</p>
                      <div className="text-sm text-muted-foreground/80 flex items-center gap-2">
                        <span className="font-semibold">Impact:</span>
                        {issue.impact}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-strong rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
            <TrendingUp className="w-6 h-6 text-green-400" />
            How to Fix ({result.recommendations.length})
          </h3>
          <div className="space-y-4">
            {result.recommendations.map((rec, i) => {
              const Icon = priorityIcons[rec.priority];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="glass p-6 rounded-xl hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={cn('p-3 rounded-lg', getPriorityColor(rec.priority))}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-lg text-foreground">{rec.title}</h4>
                        <span className={cn('text-xs px-3 py-1 rounded-full font-semibold', getPriorityColor(rec.priority))}>
                          {rec.priority.toUpperCase()} PRIORITY
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-3">{rec.description}</p>
                      <div className="mb-3 px-4 py-2 bg-green-400/10 border border-green-400/20 rounded-lg">
                        <span className="text-sm text-green-400 font-semibold">
                          ⚡ Expected: {rec.expectedImprovement}
                        </span>
                      </div>
                      {rec.steps && rec.steps.length > 0 && (
                        <div className="space-y-2 mt-4">
                          <span className="text-sm font-semibold text-foreground">Steps to fix:</span>
                          <ul className="space-y-2">
                            {rec.steps.map((step, j) => (
                              <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <ArrowRight className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Entity Chart */}
      {entityData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-strong rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold mb-6 text-foreground">Entity Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={entityData}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '0.5rem',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                  {entityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Server Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass-strong rounded-2xl p-8"
      >
        <h3 className="text-2xl font-bold mb-6 text-foreground">Server Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Platform', value: `${profileData.metadata.platform.name} ${profileData.metadata.platform.version}` },
            { label: 'Minecraft', value: profileData.metadata.platform.minecraftVersion || 'N/A' },
            { label: 'Java', value: stats.java ? `${stats.java.vendor} ${stats.java.version}` : 'N/A' },
            { label: 'CPU Threads', value: stats.cpu?.threads || 'N/A' },
            { label: 'Total Memory', value: formatBytes(platformStats?.memory?.heap?.max || 0) },
            { label: 'Player Count', value: platformStats?.playerCount || 'N/A' },
          ].map((info, i) => (
            <div key={i} className="glass p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">{info.label}</div>
              <div className="font-semibold text-foreground">{info.value}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
