import type { Channel, Feed } from "../shared/schema";
import { addChannel, addFeed } from "./storage";

let seeded = false;

const SEED_CHANNELS: Omit<Channel, "createdAt" | "updatedAt">[] = [
  { id: "UCwAnu01qlnVg1Ai2AbtTMaA", name: "Jeff Su" },
  { id: "UCBJycsmduvYEL83R_U4JriQ", name: "Marques Brownlee" },
  { id: "UC0yHBbz4Oxq9FwmVX2BBOqLg", name: "AI Master" },
  { id: "UCWzW3FIOCt3UEpW6hYK4q", name: "AI Foundations" },
  { id: "UCQ66zvpQ0rlNFs_7hFCfmaw", name: "Teachers Tech" },
  { id: "UC-h5Sz7-O_4kbdzPy6hxYd9g", name: "Ziet Invests" },
  { id: "UCmeU2DYVfyw8OwMBGzZEwNbw", name: "Paul J Lipsky" },
  { id: "UCrB7UfnkosBjAh9Og3a9NdWw", name: "Grace Leung" },
  { id: "UCphIe8mo18P08aKClgt3i89", name: "Matt Wolfe" },
  { id: "UCwSozl89Ij2zUDzQ4jGJD3g", name: "Skill Leap AI" },
  { id: "UCpCrcUPtVlvXLdNhnexu-WQ", name: "Stephen Robles" },
  { id: "UCpko_-a4wgz2u_DgDgd9fqA", name: "Tasia Custode" },
  { id: "UCxMGJegjDSdGm3MA2VtiIOQ", name: "David Ondrej" },
  { id: "UCddiUEpeqJcYeBxX1IVBKvQ", name: "Itssssss Jack" },
  { id: "UCsXVk37bltHxD1rDPwtNM8Q", name: "theMITMonk" },
];

const SEED_FEEDS: Feed[] = [
  {
    id: "malaysiakini",
    title: "Malaysiakini",
    url: "https://www.malaysiakini.com/rss/en/news.rss",
    folderId: "news",
  },
  {
    id: "thestar-news",
    title: "The Star: News Feed",
    url: "https://www.thestar.com.my/rss/News",
    folderId: "news",
  },
  {
    id: "thestar-business",
    title: "The Star: Business Feed",
    url: "https://www.thestar.com.my/rss/Business",
    folderId: "news",
  },
  {
    id: "thestar-smebiz",
    title: "The Star: SMEBiz Feed",
    url: "https://www.thestar.com.my/rss/SMEBiz",
    folderId: "news",
  },
  {
    id: "thestar-world",
    title: "The Star: World News Feed",
    url: "https://www.thestar.com.my/rss/World",
    folderId: "news",
  },
  {
    id: "thestar-education",
    title: "The Star: Education Feed",
    url: "https://www.thestar.com.my/rss/Education",
    folderId: "news",
  },
  {
    id: "cna-latest",
    title: "CNA Latest News",
    url: "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml",
    folderId: "news",
  },
];

export function runSeed(): void {
  if (seeded) return;
  seeded = true;

  const now = new Date().toISOString();
  for (const ch of SEED_CHANNELS) {
    addChannel({ ...ch, createdAt: now, updatedAt: now });
  }

  for (const feed of SEED_FEEDS) {
    addFeed(feed);
  }

  console.log(`[seed] Seeded ${SEED_CHANNELS.length} channels, ${SEED_FEEDS.length} feeds`);
}
