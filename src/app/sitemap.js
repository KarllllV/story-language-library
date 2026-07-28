const BASE_URL = "https://story-language-library.vercel.app";
const LAST_UPDATED = new Date("2026-07-28");

const mainRoutes = [
  {
    path: "",
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    path: "/stories",
    changeFrequency: "weekly",
    priority: 0.95,
  },
  {
    path: "/konverzace",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/vyslovnost",
    changeFrequency: "monthly",
    priority: 0.8,
  },
];

const storyRoutes = [
  "/stories/rabbit",
  "/stories/rabbitde",
  "/stories/rabbitcz",
  "/stories/horse",
  "/stories/horsede",
  "/stories/horsecz",
  "/stories/fox",
  "/stories/foxde",
  "/stories/foxcz",
];

const informationRoutes = ["/kontakt", "/ochrana-soukromi", "/cookies"];

export default function sitemap() {
  const mainPages = mainRoutes.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: LAST_UPDATED,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const storyPages = storyRoutes.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: LAST_UPDATED,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  const informationPages = informationRoutes.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: LAST_UPDATED,
    changeFrequency: "yearly",
    priority: 0.4,
  }));

  return [...mainPages, ...storyPages, ...informationPages];
}