import { useState } from 'react';

interface AzureSettings {
  apiKey: string;
  endpoint: string;
  deploymentName: string;
  apiVersion: string;
}

interface NewsItem {
  outlet: string;
  title: string;
  url: string;
}

interface AnalysisResult {
  left: {
    summary: string;
    articles: NewsItem[];
  };
  right: {
    summary: string;
    articles: NewsItem[];
  };
  center: {
    summary: string;
    articles: NewsItem[];
  };
}

const RSS_FEEDS = {
  right: [
    { name: 'Swarajya', url: 'https://prod-qt-images.s3.amazonaws.com/production/swarajya/feed.xml' },
    { name: 'OpIndia', url: 'https://www.opindia.com/feed/' },
  ],
  left: [
    { name: 'The Hindu', url: 'https://www.thehindu.com/feeder/default.rss' },
    { name: 'Scroll', url: 'http://feeds.feedburner.com/ScrollinArticles.rss' },
  ],
  center: [
    { name: 'Times of India', url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms' },
    { name: 'India Today', url: 'https://www.indiatoday.in/rss/home' },
  ],
};

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

async function fetchRSSFeed(url: string): Promise<string[]> {
  try {
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error('Failed to fetch RSS');
    
    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    
    const items = xml.querySelectorAll('item');
    const articles: string[] = [];
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    items.forEach((item) => {
      const title = item.querySelector('title')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent;
      
      if (pubDate) {
        const articleDate = new Date(pubDate);
        if (articleDate >= oneWeekAgo) {
          articles.push(`Title: ${title} | URL: ${link}`);
        }
      } else {
        articles.push(`Title: ${title} | URL: ${link}`);
      }
    });
    
    return articles.slice(0, 10);
  } catch (error) {
    console.error('Error fetching RSS:', error);
    return [];
  }
}

async function fetchAllFeeds(): Promise<{ perspective: string; outlet: string; articles: string[] }[]> {
  const allFeeds: { perspective: string; outlet: string; articles: string[] }[] = [];
  
  for (const [perspective, feeds] of Object.entries(RSS_FEEDS)) {
    for (const feed of feeds) {
      const articles = await fetchRSSFeed(feed.url);
      allFeeds.push({ perspective, outlet: feed.name, articles });
    }
  }
  
  return allFeeds;
}

export function useAzureOpenAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeNews = async (topic: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const savedSettings = localStorage.getItem('azureSettings');
      if (!savedSettings) {
        throw new Error('Please configure Azure OpenAI settings first.');
      }

      const settings: AzureSettings = JSON.parse(savedSettings);
      if (!settings.apiKey || !settings.endpoint || !settings.deploymentName) {
        throw new Error('Please complete all Azure OpenAI settings.');
      }

      // Fetch RSS feeds
      const feeds = await fetchAllFeeds();
      
      // Construct the feed summary for the AI
      let feedContent = '';
      feeds.forEach(({ perspective, outlet, articles }) => {
        feedContent += `\n\n${perspective.toUpperCase()} - ${outlet}:\n`;
        feedContent += articles.join('\n') || 'No recent articles found.';
      });

      // Construct Azure OpenAI URL
      const endpoint = settings.endpoint.replace(/\/$/, '');
      const url = `${endpoint}/openai/deployments/${settings.deploymentName}/chat/completions?api-version=${settings.apiVersion}`;

      const systemPrompt = `You are a news analysis assistant. Analyze news coverage from different political perspectives.

For the specified topic, analyze the news coverage by the following outlets:
- RIGHT WING: Swarajya, OpIndia
- LEFT WING: The Hindu, Scroll  
- CENTER: Times of India, India Today

Respond in this exact JSON format:
{
  "left": {
    "summary": "Brief summary of how left-wing outlets covered this topic (2-3 sentences)",
    "articles": [{"outlet": "Outlet Name", "title": "Article Title", "url": "Article URL"}]
  },
  "right": {
    "summary": "Brief summary of how right-wing outlets covered this topic (2-3 sentences)",
    "articles": [{"outlet": "Outlet Name", "title": "Article Title", "url": "Article URL"}]
  },
  "center": {
    "summary": "Brief summary of how center outlets covered this topic (2-3 sentences)",
    "articles": [{"outlet": "Outlet Name", "title": "Article Title", "url": "Article URL"}]
  }
}

If an outlet has no coverage on the topic, set summary to empty string and articles to empty array.
Only include articles that are directly related to the specified topic.`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': settings.apiKey,
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Topic: "${topic}"\n\nHere are the recent news articles from various outlets:\n${feedContent}\n\nPlease analyze the coverage of "${topic}" and respond with the JSON format specified.` },
          ],
          max_tokens: 2000,
          temperature: 0.3,
          store: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Check for CORS-related errors
        if (response.status === 0 || errorText.includes('CORS')) {
          throw new Error('CORS_ERROR');
        }
        
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No response from Azure OpenAI');
      }

      // Parse the JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse AI response');
      }

      const analysisResult: AnalysisResult = JSON.parse(jsonMatch[0]);
      setResult(analysisResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      if (errorMessage === 'CORS_ERROR' || errorMessage.includes('Failed to fetch')) {
        setError('Please enable CORS for this domain in your Azure Portal.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { analyzeNews, isLoading, error, result };
}
