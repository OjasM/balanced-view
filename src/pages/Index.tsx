import { useState } from 'react';
import { Settings, RefreshCw, Search, Newspaper } from 'lucide-react';
import SettingsModal from '@/components/SettingsModal';
import LogsModal from '@/components/LogsModal';
import PerspectiveCard from '@/components/PerspectiveCard';
import { useAzureOpenAI } from '@/hooks/useAzureOpenAI';

const Index = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const { analyzeNews, isLoading, error, result, feedLogs } = useAzureOpenAI();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      analyzeNews(topic.trim());
    }
  };

  const handleRefresh = () => {
    if (topic.trim()) {
      analyzeNews(topic.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--perspective-left))] via-[hsl(var(--perspective-center))] to-[hsl(var(--perspective-right))] flex items-center justify-center">
                <Newspaper className="w-5 h-5 text-background" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-foreground">Balanced News</h1>
                <p className="text-xs text-muted-foreground">See all perspectives</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={!topic.trim() || isLoading}
                className="btn-ghost disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="btn-ghost"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-6">
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What news topic do you want to get a balanced perspective on?"
              className="input-search pr-14"
            />
            <button
              type="submit"
              disabled={!topic.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2 px-4 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Results */}
        {(isLoading || result) && (
          <div className="grid gap-4 md:grid-cols-3">
            <PerspectiveCard
              perspective="left"
              summary={result?.left.summary || ''}
              articles={result?.left.articles || []}
              isLoading={isLoading}
            />
            <PerspectiveCard
              perspective="center"
              summary={result?.center.summary || ''}
              articles={result?.center.articles || []}
              isLoading={isLoading}
            />
            <PerspectiveCard
              perspective="right"
              summary={result?.right.summary || ''}
              articles={result?.right.articles || []}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !result && !error && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
              <Newspaper className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Get the Full Picture
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Enter a news topic above to see how it's covered across the political spectrum by major Indian news outlets.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Budget 2024', 'Elections', 'Cricket', 'Technology', 'Climate'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setTopic(suggestion)}
                  className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-accent transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onOpenLogs={() => setIsLogsOpen(true)}
      />
      
      {/* Logs Modal */}
      <LogsModal 
        isOpen={isLogsOpen} 
        onClose={() => setIsLogsOpen(false)} 
        logs={feedLogs}
      />
    </div>
  );
};

export default Index;
