//import { MOCK_ARTICLES } from "@app/lib/data";
import { Article } from "@app/types/index";
import { NewsCard } from "@app/components/NewsCard";
import { fetchNews } from "./lib/fetchNews";
import { fetchMarketIndices } from "./lib/fetchIndices";
import IndicesTicker from "@app/components/IndicesTicker";

export default async function HomePage() {

  










  const [indicesResult, articles] = await Promise.all([
    fetchMarketIndices(),
    fetchNews()
  ]);
  //await Promise.reject(new Error("Simulated data fetch failure"));

  //log partial failures server side
  if(indicesResult.errors.length >0){
    console.warn("Indices partial failure:", indicesResult.errors);
  }

  //if the api response is empty
  if(articles.length === 0) return null;

  const topArticle = articles.reduce((latest, current) =>{
    return new Date(current.publishedAt) > new Date(latest.publishedAt) ? current : latest;
  }, articles[0]);

  const remainingArticles = articles.filter((a)=> a.id!==topArticle.id);

  const headlineTime = new Date(topArticle.publishedAt).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="min-h-screen bg-yellow-50 py-8 px-4 sm:px-6 lg:px-8">
      <p className="text-2xl font-bold text-orange-600">Mangoboard</p>
      
      <div className="mx-auto max-w-7xl mb-6">
        <IndicesTicker 
        indices={indicesResult.indices}
        fetchedAt={indicesResult.fetchedAt}
        />
        </div>
        <div className="mx-auto max-w-7xl">
        {/* Centered Heading */}
        <section className="mb-10 text-center">
          <div className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Top Story
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            <a 
              href={topArticle.url} 
              className="hover:text-blue-700 transition-colors underline decoration-blue-300 decoration-2 hover:decoration-blue-600 underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              {topArticle.title}
            </a>
          </h1>
          <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
            
            
          </div>
        </section>
        

        {/* Responsive Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {remainingArticles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>

      </div>
    </main>
  );
}