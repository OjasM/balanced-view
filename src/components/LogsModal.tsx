import { X, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FeedLog {
  perspective: string;
  outlet: string;
  articles: string[];
  fetchedAt: string;
}

interface LogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: FeedLog[];
}

const LogsModal = ({ isOpen, onClose, logs }: LogsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl max-h-[80vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-display font-bold text-foreground">RSS Feed Logs</h2>
          </div>
          <button onClick={onClose} className="btn-ghost">
            <X className="w-5 h-5" />
          </button>
        </div>

        <ScrollArea className="flex-1 p-6">
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No logs yet. Search for a topic to see RSS feed data.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {logs.map((log, index) => (
                <div key={index} className="border border-border rounded-xl overflow-hidden">
                  <div className="bg-muted/50 px-4 py-3 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                          log.perspective === 'left' 
                            ? 'bg-[hsl(var(--perspective-left))]/20 text-[hsl(var(--perspective-left))]'
                            : log.perspective === 'right'
                            ? 'bg-[hsl(var(--perspective-right))]/20 text-[hsl(var(--perspective-right))]'
                            : 'bg-[hsl(var(--perspective-center))]/20 text-[hsl(var(--perspective-center))]'
                        }`}>
                          {log.perspective.toUpperCase()}
                        </span>
                        <span className="font-medium text-foreground">{log.outlet}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{log.fetchedAt}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {log.articles.length} articles fetched
                    </p>
                  </div>
                  <div className="p-4 bg-background/50 max-h-60 overflow-y-auto">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                      {log.articles.length > 0 
                        ? log.articles.join('\n\n')
                        : 'No articles found in this feed.'}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default LogsModal;
