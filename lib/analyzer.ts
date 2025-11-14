import {
  SparkProfilerData,
  AnalysisResult,
  Issue,
  Recommendation,
  AnalyzedMetrics,
  Chunk,
} from '@/types/spark';

export class SparkAnalyzer {
  private data: SparkProfilerData;

  constructor(data: SparkProfilerData) {
    this.data = data;
  }

  analyze(): AnalysisResult {
    const issues: Issue[] = [];
    const recommendations: Recommendation[] = [];
    const metrics = this.analyzeMetrics();

    // Analyze TPS
    if (metrics.performance.tps.status === 'critical') {
      issues.push({
        severity: 'critical',
        category: 'Performance',
        title: 'Critically Low TPS',
        description: `Server TPS is ${metrics.performance.tps.value.toFixed(2)}, significantly below the optimal 20.0`,
        impact: 'Players experience severe lag and delayed block updates',
      });
      recommendations.push({
        priority: 'high',
        category: 'Performance',
        title: 'Immediate TPS Optimization Required',
        description: 'Your server is running critically slow. Focus on these high-impact fixes first.',
        expectedImprovement: 'Could improve TPS by 5-10 points',
        steps: [
          'Reduce entity count (see entity recommendations)',
          'Optimize redstone contraptions',
          'Limit hopper chains',
          'Consider upgrading server hardware',
        ],
      });
    }

    // Analyze MSPT
    if (metrics.performance.mspt.status !== 'good') {
      const msptValue = metrics.performance.mspt.value;
      if (msptValue > 100) {
        issues.push({
          severity: 'critical',
          category: 'Performance',
          title: 'Extremely High Tick Time',
          description: `Server is taking ${msptValue.toFixed(1)}ms per tick (should be under 50ms)`,
          impact: 'Server cannot maintain 20 TPS, causing severe lag',
        });
      } else if (msptValue > 50) {
        issues.push({
          severity: 'warning',
          category: 'Performance',
          title: 'High Tick Time',
          description: `Server is taking ${msptValue.toFixed(1)}ms per tick (ideal: under 40ms)`,
          impact: 'Server may struggle under load',
        });
      }
    }

    // Analyze Memory
    const heap = this.data.metadata.systemStatistics?.memory?.heap;
    const memoryUsagePercent = heap?.used && heap?.max
      ? (heap.used / heap.max) * 100
      : 0;

    if (memoryUsagePercent > 90 && heap) {
      issues.push({
        severity: 'critical',
        category: 'Memory',
        title: 'Critical Memory Usage',
        description: `Memory usage at ${memoryUsagePercent.toFixed(1)}% - dangerously close to maximum`,
        impact: 'Server may crash or experience severe GC pauses',
      });
      recommendations.push({
        priority: 'high',
        category: 'Memory',
        title: 'Increase Memory Allocation',
        description: 'Allocate more RAM to prevent crashes',
        expectedImprovement: 'Prevent crashes and reduce GC pauses by 50%+',
        steps: [
          `Increase -Xmx from ${((heap?.max || 0) / 1024 / 1024 / 1024).toFixed(1)}GB to at least ${Math.ceil(((heap?.max || 0) / 1024 / 1024 / 1024) * 1.5)}GB`,
          'Use Aikar\'s flags for optimal GC',
          'Monitor memory usage after changes',
        ],
      });
    } else if (memoryUsagePercent > 80 && heap) {
      issues.push({
        severity: 'warning',
        category: 'Memory',
        title: 'High Memory Usage',
        description: `Memory usage at ${memoryUsagePercent.toFixed(1)}%`,
        impact: 'May cause frequent garbage collection pauses',
      });
    }

    // Analyze GC
    const gcStats = this.data.metadata.systemStatistics.gc;
    if (gcStats) {
      for (const [gcName, stats] of Object.entries(gcStats)) {
        if (stats.avgTime > 100) {
          issues.push({
            severity: 'warning',
            category: 'Memory',
            title: 'Long GC Pauses',
            description: `${gcName} taking ${stats.avgTime.toFixed(1)}ms on average`,
            impact: 'Causes periodic lag spikes',
          });
          recommendations.push({
            priority: 'medium',
            category: 'Memory',
            title: 'Optimize Garbage Collection',
            description: 'Tune JVM flags to reduce GC pause times',
            expectedImprovement: 'Reduce lag spikes by 30-50%',
            steps: [
              'Use G1GC with optimal flags',
              'Consider using Aikar\'s flags',
              'Increase heap size if needed',
            ],
          });
        }
      }
    }

    // Analyze Entities
    if (this.data.platformStatistics?.world) {
      const entityAnalysis = this.analyzeEntities();
      issues.push(...entityAnalysis.issues);
      recommendations.push(...entityAnalysis.recommendations);
    }

    // Analyze CPU
    const cpuUsage = this.data.metadata.systemStatistics?.cpu?.processUsage?.last1m || 0;
    if (cpuUsage > 90) {
      issues.push({
        severity: 'critical',
        category: 'CPU',
        title: 'Critical CPU Usage',
        description: `CPU usage at ${cpuUsage.toFixed(1)}%`,
        impact: 'Server is CPU-bottlenecked, limiting performance',
      });
      recommendations.push({
        priority: 'high',
        category: 'CPU',
        title: 'Reduce CPU Load',
        description: 'Optimize server operations to reduce CPU usage',
        expectedImprovement: 'Improve overall server responsiveness',
        steps: [
          'Reduce entity count',
          'Optimize redstone circuits',
          'Limit chunk loading',
          'Consider better CPU or multi-threading plugins',
        ],
      });
    }

    // Calculate overall score
    const overallScore = this.calculateOverallScore(metrics, issues);

    return {
      overallScore,
      issues,
      recommendations,
      metrics,
    };
  }

  private analyzeMetrics(): AnalyzedMetrics {
    const stats = this.data.metadata.systemStatistics;

    // TPS Analysis
    const tps = stats.tps?.last1m ?? 20;
    const tpsStatus = tps >= 19.5 ? 'good' : tps >= 18 ? 'warning' : 'critical';

    // MSPT Analysis
    const mspt = stats.mspt?.last1m?.mean ?? 0;
    const msptStatus = mspt <= 40 ? 'good' : mspt <= 50 ? 'warning' : 'critical';

    // CPU Analysis
    const cpu = stats.cpu?.processUsage?.last1m ?? 0;
    const cpuStatus = cpu <= 70 ? 'good' : cpu <= 85 ? 'warning' : 'critical';

    // Memory Analysis
    const heap = stats.memory?.heap;
    const memoryUsagePercent = heap?.used && heap?.max ? (heap.used / heap.max) * 100 : 0;
    const memoryStatus = memoryUsagePercent <= 70 ? 'good' : memoryUsagePercent <= 85 ? 'warning' : 'critical';

    // Entity Analysis
    const totalEntities = this.data.platformStatistics?.world?.totalEntities ?? 0;
    const problematicChunks = this.findProblematicChunks().length;
    const entityStatus = totalEntities <= 5000 ? 'good' : totalEntities <= 10000 ? 'warning' : 'critical';

    return {
      performance: {
        tps: { value: tps, status: tpsStatus },
        mspt: { value: mspt, status: msptStatus },
        cpu: { value: cpu, status: cpuStatus },
      },
      memory: {
        usage: memoryUsagePercent,
        status: memoryStatus,
      },
      entities: {
        total: totalEntities,
        problematicChunks,
        status: entityStatus,
      },
    };
  }

  private analyzeEntities(): { issues: Issue[]; recommendations: Recommendation[] } {
    const issues: Issue[] = [];
    const recommendations: Recommendation[] = [];
    const worldStats = this.data.platformStatistics?.world;

    if (!worldStats) return { issues, recommendations };

    const totalEntities = worldStats.totalEntities;
    const problematicChunks = this.findProblematicChunks();

    // Check total entity count
    if (totalEntities > 15000) {
      issues.push({
        severity: 'critical',
        category: 'Entities',
        title: 'Excessive Entity Count',
        description: `${totalEntities.toLocaleString()} entities detected (recommended: under 5,000)`,
        impact: 'Massive performance degradation, severe lag',
      });
    } else if (totalEntities > 10000) {
      issues.push({
        severity: 'warning',
        category: 'Entities',
        title: 'High Entity Count',
        description: `${totalEntities.toLocaleString()} entities detected (recommended: under 5,000)`,
        impact: 'Noticeable performance impact',
      });
    }

    // Check entity distribution
    const entityTypes = worldStats.entities;
    const problematicTypes = this.findProblematicEntityTypes(entityTypes);

    if (problematicTypes.length > 0) {
      const typesList = problematicTypes.map(([type, count]) => `${type}: ${count}`).join(', ');
      issues.push({
        severity: 'warning',
        category: 'Entities',
        title: 'Problematic Entity Types',
        description: `High counts of performance-impacting entities: ${typesList}`,
        impact: 'Specific entity types causing disproportionate lag',
      });
    }

    // Chunk analysis
    if (problematicChunks.length > 0) {
      const topChunk = problematicChunks[0];
      issues.push({
        severity: 'critical',
        category: 'Entities',
        title: 'Entity Chunk Overload',
        description: `${problematicChunks.length} chunks with excessive entities. Worst: ${topChunk.count} entities at [${topChunk.x}, ${topChunk.z}]`,
        impact: 'Localized severe lag in specific areas',
      });

      recommendations.push({
        priority: 'high',
        category: 'Entities',
        title: 'Clear Problematic Chunks',
        description: 'Remove excessive entities from overloaded chunks',
        expectedImprovement: 'Could improve TPS by 3-8 points',
        steps: [
          `Clear entities at chunk [${topChunk.x}, ${topChunk.z}] (${topChunk.count} entities)`,
          ...problematicChunks.slice(1, 3).map(c =>
            `Clear entities at chunk [${c.x}, ${c.z}] (${c.count} entities)`
          ),
          'Use command: /minecraft:kill @e[type=!player,distance=..100]',
          'Install entity limiting plugin',
        ],
      });
    }

    // General entity reduction recommendation
    if (totalEntities > 5000) {
      recommendations.push({
        priority: totalEntities > 10000 ? 'high' : 'medium',
        category: 'Entities',
        title: 'Reduce Overall Entity Count',
        description: 'Lower total server entity count for better performance',
        expectedImprovement: `Could improve TPS by ${totalEntities > 10000 ? '5-10' : '2-5'} points`,
        steps: [
          'Clear unnecessary entities with /kill commands',
          'Limit mob spawners and farms',
          'Install entity management plugins (ClearLag, FarmLimiter)',
          'Set lower entity limits in spigot.yml',
          'Reduce mob-spawn-range in spigot.yml',
        ],
      });
    }

    return { issues, recommendations };
  }

  private findProblematicChunks(): Array<{ x: number; z: number; count: number; world: string }> {
    const problematic: Array<{ x: number; z: number; count: number; world: string }> = [];
    const worldStats = this.data.platformStatistics?.world;

    if (!worldStats?.worlds) return problematic;

    for (const world of worldStats.worlds) {
      if (!world.regions) continue;

      for (const region of world.regions) {
        for (const chunk of region.chunks) {
          if (chunk.entityCount > 100) {
            problematic.push({
              x: chunk.x,
              z: chunk.z,
              count: chunk.entityCount,
              world: world.name,
            });
          }
        }
      }
    }

    return problematic.sort((a, b) => b.count - a.count);
  }

  private findProblematicEntityTypes(entities: { [key: string]: number }): Array<[string, number]> {
    const problematic: Array<[string, number]> = [];
    const laggyEntities = [
      'item', 'arrow', 'tnt', 'falling_block', 'boat', 'minecart',
      'armor_stand', 'item_frame', 'villager', 'zombie',
    ];

    for (const [type, count] of Object.entries(entities)) {
      if (laggyEntities.some(laggy => type.toLowerCase().includes(laggy)) && count > 500) {
        problematic.push([type, count]);
      }
    }

    return problematic.sort((a, b) => b[1] - a[1]);
  }

  private calculateOverallScore(metrics: AnalyzedMetrics, issues: Issue[]): number {
    let score = 100;

    // Deduct based on performance metrics
    if (metrics.performance.tps.status === 'critical') score -= 30;
    else if (metrics.performance.tps.status === 'warning') score -= 15;

    if (metrics.performance.mspt.status === 'critical') score -= 20;
    else if (metrics.performance.mspt.status === 'warning') score -= 10;

    if (metrics.performance.cpu.status === 'critical') score -= 15;
    else if (metrics.performance.cpu.status === 'warning') score -= 8;

    if (metrics.memory.status === 'critical') score -= 15;
    else if (metrics.memory.status === 'warning') score -= 8;

    if (metrics.entities.status === 'critical') score -= 10;
    else if (metrics.entities.status === 'warning') score -= 5;

    // Deduct based on issue count
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    score -= criticalCount * 5;
    score -= warningCount * 2;

    return Math.max(0, Math.min(100, score));
  }
}

export async function fetchSparkProfile(url: string): Promise<SparkProfilerData> {
  // Extract ID from URL
  const match = url.match(/spark\.lucko\.me\/([a-zA-Z0-9]+)/);
  if (!match) {
    throw new Error('Invalid Spark profiler URL. Format: https://spark.lucko.me/XXXXX');
  }

  const id = match[1];
  const rawUrl = `https://spark.lucko.me/${id}?raw=1`;

  // Use CORS proxy for production builds (static sites can't use server-side APIs)
  const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';

  if (isProduction) {
    // Use CORS proxy in production
    try {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(rawUrl)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(
        'Could not fetch Spark profiler data. The URL might be invalid or the service is down. ' +
        'Make sure the URL is correct: https://spark.lucko.me/XXXXX'
      );
    }
  } else {
    // Try direct fetch in development (usually works on localhost)
    try {
      const response = await fetch(rawUrl, {
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Fallback to proxy even in dev
      try {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(rawUrl)}`;
        const response = await fetch(proxyUrl);

        if (!response.ok) {
          throw new Error(`Proxy fetch failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
      } catch (proxyError) {
        throw new Error(
          'Cannot fetch Spark data. Check the URL and try again.'
        );
      }
    }
  }
}
