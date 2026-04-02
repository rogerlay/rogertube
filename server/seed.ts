import type { Channel, Feed } from "../shared/schema";
import { addChannel, addFeed } from "./storage";

let seeded = false;

const SEED_CHANNELS: Omit<Channel, "createdAt" | "updatedAt">[] = [
  { id: "UCwAnu01qlnVg1Ai2AbtTMaA", name: "Jeff Su" },
  { id: "UCBJycsmduvYEL83R_U4JriQ", name: "Marques Brownlee" },
  { id: "UC0yHbz4OxdQFwmVX2BBQqLg", name: "AI Master" },
  { id: "UCWZwfV3ICOt3uEPpW6hYK4g", name: "AI Foundations" },
  { id: "UCO66zvpQorlNfs_7hFCfmaw", name: "Teachers Tech" },
  { id: "UC-h5sZ-O_4KbdzPy6hxYd9g", name: "Ziet Invests" },
  { id: "UCmeU2DYiVy80wMBGZzEWnbw", name: "Paul J Lipsky" },
  { id: "UCrB7UFnkosBjAhOg3a9NdWw", name: "Grace Leung" },
  { id: "UChpleBmo18P08aKCIgti38g", name: "Matt Wolfe" },
  { id: "UCwSozl89jl2zUDzQ4jGJD3g", name: "Skill Leap AI" },
  { id: "UC-42e9KDEWXNYJAT7qPWbeA", name: "Stephen Robles" },
  { id: "UCNQbF87QPV685oFnHxb0zPg", name: "Tasia Custode" },
  { id: "UCPGrgwfbkjTIgPoOh2q1BAg", name: "David Ondrej" },
  { id: "UCxVxcTULO9cFU6SB9qVaisQ", name: "Itssssss Jack" },
  { id: "UC4ZVkG3RQPzvZk7alIVjcCg", name: "theMITMonk" },
  { id: "UC2ojq-nuP8ceeHqiroeKhBA", name: "Nate Herk | AI Automation" },
  { id: "UCZv_19T3Yuk8k0RZRGNqgow", name: "Alek Sheffy" },
  { id: "UCf6AGqO98eGk11nfazociVQ", name: "ByteGrad" },
  { id: "UCo92D-IJgfR-ZUe1_zeDFDg", name: "Charlie Chang" },
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
