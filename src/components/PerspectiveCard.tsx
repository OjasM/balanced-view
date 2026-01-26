import { ExternalLink } from 'lucide-react';

interface NewsItem {
  outlet: string;
  title: string;
  url: string;
}

interface PerspectiveCardProps {
  perspective: 'left' | 'right' | 'center';
  summary: string;
  articles: NewsItem[];
  isLoading?: boolean;
}

const perspectiveConfig = {
  left: {
    label: 'Left Wing',
    outlets: 'The Hindu • Scroll',
    cardClass: 'perspective-card-left',
    badgeClass: 'perspective-badge-left',
  },
  right: {
    label: 'Right Wing',
    outlets: 'Swarajya • OpIndia',
    cardClass: 'perspective-card-right',
    badgeClass: 'perspective-badge-right',
  },
  center: {
    label: 'Center',
    outlets: 'Times of India • India Today',
    cardClass: 'perspective-card-center',
    badgeClass: 'perspective-badge-center',
  },
};

const PerspectiveCard = ({ perspective, summary, articles, isLoading }: PerspectiveCardProps) => {
  const config = perspectiveConfig[perspective];

  if (isLoading) {
    return (
      <div className={`perspective-card ${config.cardClass}`}>
        <div className="relative z-10">
          <div className="loading-shimmer h-6 w-24 mb-4" />
          <div className="loading-shimmer h-4 w-32 mb-6" />
          <div className="space-y-3">
            <div className="loading-shimmer h-4 w-full" />
            <div className="loading-shimmer h-4 w-5/6" />
            <div className="loading-shimmer h-4 w-4/6" />
          </div>
          <div className="mt-6 pt-4 border-t border-border space-y-3">
            <div className="loading-shimmer h-4 w-3/4" />
            <div className="loading-shimmer h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`perspective-card ${config.cardClass}`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className={`perspective-badge ${config.badgeClass}`}>
            {config.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          {config.outlets}
        </p>

        {summary ? (
          <>
            <p className="text-sm text-foreground leading-relaxed mb-6">
              {summary}
            </p>

            {articles.length > 0 && (
              <div className="border-t border-border pt-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Sources
                </h4>
                <ul className="space-y-2">
                  {articles.map((article, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ExternalLink className="w-3 h-3 mt-1 text-muted-foreground flex-shrink-0" />
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="news-link text-sm line-clamp-2"
                      >
                        <span className="font-medium">{article.outlet}:</span> {article.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No coverage found from these outlets.
          </p>
        )}
      </div>
    </div>
  );
};

export default PerspectiveCard;
