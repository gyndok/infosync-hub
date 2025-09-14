import { NewsWidget } from "@/components/widgets/NewsWidget";

const NewsDemo = () => {
  return (
    <div className="min-h-screen bg-dashboard-bg p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            News Widget Demo
          </h1>
          <p className="text-muted-foreground">
            Test the NewsAPI integration with all features
          </p>
        </div>

        <div className="h-[600px]">
          <NewsWidget />
        </div>

        <div className="mt-6 p-4 bg-card rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Features Implemented:</h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✅ NewsAPI integration via secure API proxy</li>
            <li>✅ Source selection (BBC, CNN, TechCrunch, Reuters, etc.)</li>
            <li>✅ Keyword filtering and search</li>
            <li>✅ Category-based filtering (tech, business, sports, etc.)</li>
            <li>✅ Real-time updates with 15-minute auto-refresh</li>
            <li>
              ✅ Rate limiting and caching (100 requests/minute, 15-minute
              cache)
            </li>
            <li>✅ Error handling and fallback mechanisms</li>
            <li>✅ Responsive design with article images</li>
            <li>✅ Time ago formatting and external links</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NewsDemo;
