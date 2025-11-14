'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap, TrendingUp, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { SparkAnalyzer, fetchSparkProfile } from '@/lib/analyzer';
import { AnalysisResult, SparkProfilerData } from '@/types/spark';
import AnalysisResults from '@/components/AnalysisResults';
import { cn } from '@/lib/utils';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [profileData, setProfileData] = useState<SparkProfilerData | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('Hey, you need to paste a URL first!');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Fetch and analyze the profile
      const data = await fetchSparkProfile(url);
      const analyzer = new SparkAnalyzer(data);
      const analysis = analyzer.analyze();

      setProfileData(data);
      setResult(analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-12 h-12 text-primary" />
            <h1 className="text-6xl font-bold gradient-text">
              Spark Analyzer
            </h1>
            <Sparkles className="w-12 h-12 text-accent" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Figure out what's killing your server's performance and how to fix it
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="glass-strong rounded-2xl p-8 shine">
            <label htmlFor="url-input" className="block text-lg font-semibold mb-4 text-foreground">
              Drop your Spark URL here
            </label>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  id="url-input"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="https://spark.lucko.me/..."
                  className="w-full px-6 py-4 bg-background/50 border-2 border-primary/30 rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground"
                  disabled={loading}
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAnalyze}
                disabled={loading}
                className={cn(
                  'px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-xl font-semibold text-white shadow-lg transition-all',
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-primary/50'
                )}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </div>
                ) : (
                  'Analyze'
                )}
              </motion.button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive"
              >
                <AlertTriangle className="w-5 h-5" />
                {error}
              </motion.div>
            )}
          </div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
          >
            {[
              { icon: TrendingUp, text: 'Instant results' },
              { icon: CheckCircle, text: 'Clear fixes' },
              { icon: Sparkles, text: 'Smart tips' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="glass p-4 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-colors"
              >
                <feature.icon className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && profileData && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
            >
              <AnalysisResults result={result} profileData={profileData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
