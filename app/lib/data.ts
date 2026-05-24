import { Article } from "@app/types/index";
// TEMPORARY: Simulate slow network to test loading state
//await new Promise((res) => setTimeout(res, 1500));


export const MOCK_ARTICLES: Article[] = [
  { id: "1", title: "RBI holds repo rate steady at 6.5% amid inflation concerns", url: "#", source: "Economic Times", publishedAt: "2026-05-22T06:00:00Z", category: "Markets" },
  { id: "2", title: "India's Q1 GDP growth projected at 7.2% by IMF", url: "#", source: "Mint", publishedAt: "2026-05-22T07:15:00Z", category: "Economy" },
  { id: "3", title: "Tata Motors unveils ₹8L electric hatchback for domestic market", url: "#", source: "CarDekho", publishedAt: "2026-05-21T14:30:00Z", category: "Auto" },
  { id: "4", title: "Monsoon onset delayed by 5 days, IMD issues coastal alerts", url: "#", source: "India Today", publishedAt: "2026-05-21T09:00:00Z", category: "Weather" },
  { id: "5", title: "SEBI tightens F&O trading rules for retail investors", url: "#", source: "Moneycontrol", publishedAt: "2026-05-21T11:45:00Z", category: "Markets" },
  { id: "6", title: "Bengaluru startup raises $45M for AI-driven logistics platform", url: "#", source: "YourStory", publishedAt: "2026-05-20T16:20:00Z", category: "Startups" },
  { id: "7", title: "New Delhi air quality improves to 'moderate' after rains", url: "#", source: "NDTV", publishedAt: "2026-05-20T08:00:00Z", category: "Environment" },
  { id: "8", title: "ISRO successfully tests reusable launch vehicle technology", url: "#", source: "The Hindu", publishedAt: "2026-05-19T10:30:00Z", category: "Science" },
  { id: "9", title: "Sensex crosses 85,000 mark on strong banking earnings", url: "#", source: "Business Standard", publishedAt: "2026-05-19T15:00:00Z", category: "Markets" },
  { id: "10", title: "Government announces ₹50,000 Cr infrastructure push for tier-2 cities", url: "#", source: "Livemint", publishedAt: "2026-05-19T07:30:00Z", category: "Policy" },
  { id: "11", title: "Indian cricket team announces squad for upcoming World Cup qualifiers", url: "#", source: "Cricbuzz", publishedAt: "2026-05-18T12:00:00Z", category: "Sports" },
  { id: "12", title: "UPI transactions cross 15 billion in April, sets new record", url: "#", source: "NPCI", publishedAt: "2026-05-18T09:45:00Z", category: "Fintech" },
  { id: "13", title: "Kerala announces free public transport for college students", url: "#", source: "Manorama Online", publishedAt: "2026-05-17T11:15:00Z", category: "Policy" },
  { id: "14", title: "Reliance Jio launches ₹99 4G prepaid plan for rural users", url: "#", source: "Gadgets 360", publishedAt: "2026-05-17T14:00:00Z", category: "Tech" },
  { id: "15", title: "India's renewable energy capacity surpasses 200 GW milestone", url: "#", source: "Down To Earth", publishedAt: "2026-05-16T10:00:00Z", category: "Energy" },
];