// Spark Profiler Type Definitions

export interface SparkProfilerData {
  type: string;
  metadata: Metadata;
  threads: Thread[];
  platformStatistics?: PlatformStatistics;
}

export interface Metadata {
  user: {
    name: string;
    uniqueId: string;
  };
  startTime: number;
  interval: number;
  threadDumper: {
    type: string;
    ids?: number[];
  };
  dataAggregator: {
    type: string;
    threadGrouper: string;
    tickLengthThreshold: number;
  };
  platform: {
    type: string;
    name: string;
    version: string;
    minecraftVersion?: string;
  };
  systemStatistics: SystemStatistics;
  sources?: string[];
  serverConfigurations?: any;
}

export interface SystemStatistics {
  cpu: {
    threads: number;
    systemUsage: {
      last1m: number;
      last15m: number;
    };
    processUsage: {
      last1m: number;
      last15m: number;
    };
  };
  memory: {
    heap: MemoryPool;
    nonHeap?: MemoryPool;
    pools: {
      [key: string]: MemoryPool;
    };
  };
  gc?: {
    [key: string]: GCStatistics;
  };
  disk?: {
    total: number;
    used: number;
  };
  os?: {
    arch: string;
    name: string;
    version: string;
  };
  java?: {
    vendor: string;
    version: string;
    vendorVersion: string;
  };
  tps?: {
    last1m: number;
    last5m: number;
    last15m: number;
  };
  mspt?: {
    last1m: MSPTStatistics;
    last5m: MSPTStatistics;
  };
  ping?: {
    last15m: {
      avg: number;
      median: number;
      percentile95: number;
    };
  };
  playerCount?: number;
}

export interface MemoryPool {
  used: number;
  committed: number;
  max: number;
}

export interface GCStatistics {
  total: number;
  avgTime: number;
  avgFrequency: number;
}

export interface MSPTStatistics {
  mean: number;
  max: number;
  min: number;
  median: number;
  percentile95: number;
}

export interface Thread {
  name: string;
  totalTime: number;
  children?: Thread[];
}

export interface PlatformStatistics {
  world?: WorldStatistics;
}

export interface WorldStatistics {
  totalEntities: number;
  totalChunks?: number;
  entities: {
    [key: string]: number;
  };
  worlds: World[];
}

export interface World {
  name: string;
  totalEntities: number;
  regions?: Region[];
}

export interface Region {
  x: number;
  z: number;
  chunks: Chunk[];
}

export interface Chunk {
  x: number;
  z: number;
  entityCount: number;
  entities?: {
    [key: string]: number;
  };
}

// Analysis Results
export interface AnalysisResult {
  overallScore: number;
  issues: Issue[];
  recommendations: Recommendation[];
  metrics: AnalyzedMetrics;
}

export interface Issue {
  severity: 'critical' | 'warning' | 'info';
  category: string;
  title: string;
  description: string;
  impact: string;
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  expectedImprovement: string;
  steps?: string[];
}

export interface AnalyzedMetrics {
  performance: {
    tps: { value: number; status: 'good' | 'warning' | 'critical' };
    mspt: { value: number; status: 'good' | 'warning' | 'critical' };
    cpu: { value: number; status: 'good' | 'warning' | 'critical' };
  };
  memory: {
    usage: number;
    status: 'good' | 'warning' | 'critical';
  };
  entities: {
    total: number;
    problematicChunks: number;
    status: 'good' | 'warning' | 'critical';
  };
}
