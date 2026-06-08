//import { MOCK_ARTICLES } from "@app/lib/data";
import { Article } from "@app/types/index";
import { NewsCard } from "@app/components/NewsCard";
import { fetchNews } from "./lib/fetchNews";
import { fetchMarketIndices } from "./lib/fetchIndices";
import IndicesTicker from "@app/components/IndicesTicker";
import { classifyBusiness } from '@app/lib/classifiers/business-classifier';
import { keywordClassifier } from '@app/lib/classifiers/keyword-classifier';
import DashboardMenu from "@app/components/DashboardMenu";
import { mistralClassifier, batchClassify } from "@app/lib/classifiers/AI-classifier";
import { preFilter } from "@app/lib/classifiers/Prefilter";

const DISPLAY_LIMIT = 15;

export default async function HomePage() {

  










  const [indicesResult, articles] = await Promise.all([
    fetchMarketIndices(),
    fetchNews()
  ]);
  
  //await Promise.reject(new Error("Simulated data fetch failure"));

  const preFiltered = preFilter(articles);
  console.log(`Pre-filtered: ${articles.length} -> ${preFiltered.length} articles`);

  const classifications = await batchClassify(preFiltered, mistralClassifier, 5, 1000);

  const businessArticles: Article[] = preFiltered.filter((article, i) => {
    const classification = classifications[i];
    if(!classification.isBusiness){
      console.log(`🚫 Filtered: "${article.title}" → ${classification.vetoReason || 'low confidence'}`)
    }
    return classification.isBusiness && classification.confidence >=60;
  });

  /*//async added just for the current moment
  const businessArticles = articles.filter(async article => {
    //replacing the keyword classifier with the AI classifier
    //const classification = keywordClassifier.classify(article);
    const classification = await mistralClassifier.classify(article);

    if(!classification.isBusiness){
      console.log(`Filtered: "${article.title}" -> ${classification.vetoReason || 'low confidence'}`);
    }
    return classification.isBusiness;
  });*/

  //log filter stats
  console.log(`Filter stats: ${articles.length} raw -> ${preFiltered.length} pre-filtered -> ${businessArticles.length} business`);
  //log partial failures server side
  if(indicesResult.errors.length >0){
    console.warn("Indices partial failure:", indicesResult.errors);
  }

  //if the api response is empty
  if(businessArticles.length === 0) {
    return(
      <main className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 px-4">
        <p className="text-lg font-medium text-slate-700">No business articles matched our filter.</p>
        <p className="text-sm text-slate-500 mt-2">Refreshing feeds shortly...</p>
      </main>
    );
  }
  const rankedArticles = businessArticles
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, DISPLAY_LIMIT);

  const topArticle = rankedArticles[0];
  const remainingArticles = rankedArticles.slice(1);

  const headlineTime = new Date(topArticle.publishedAt).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="min-h-screen bg-yellow-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl flex items-center justify-between mb-6">
        <p className="text-2xl font-bold text-orange-600">Mangoboard</p>
        <DashboardMenu />
      </div>
      
      
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