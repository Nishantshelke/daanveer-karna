import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import { apiFetch } from "../api";
import PlatformCard from "../components/PlatformCard";
import PlatformRow from "../components/PlatformRow";

const emptyPage = { results: [], next: null };

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recent, setRecent] = useState([]);
  const [platforms, setPlatforms] = useState(emptyPage);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiFetch("/categories/"),
      apiFetch("/tags/"),
      apiFetch("/platforms/?section=trending&page_size=10"),
      apiFetch("/platforms/?section=recent&page_size=10")
    ]).then(([categoryData, tagData, trendingData, recentData]) => {
      setCategories(categoryData);
      setTags(tagData);
      setTrending(trendingData.results);
      setRecent(recentData.results);
    }).catch(() => setError("StreamHub could not load the catalog.")).finally(() => setLoading(false));
  }, []);

  const filterString = useMemo(() => {
    const params = new URLSearchParams({ page: String(page) });
    if (query.trim()) params.set("search", query.trim());
    if (category) params.set("category__slug", category);
    if (tag) params.set("tags__slug", tag);
    return params.toString();
  }, [query, category, tag, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      apiFetch(`/platforms/?${filterString}`)
        .then(data => setPlatforms(current => page === 1 ? data : { ...data, results: [...current.results, ...data.results] }))
        .catch(() => setError("We could not refresh those results."))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [filterString, page]);

  function updateFilter(setter, value) {
    setPage(1);
    setter(value);
  }

  const hero = trending[0] || recent[0];

  return (
    <>
      <Helmet>
        <title>StreamHub | Discover your next destination</title>
        <meta name="description" content="Search and discover curated platforms, all in one place." />
        <meta property="og:title" content="StreamHub" />
        <meta property="og:description" content="One search. Every destination." />
      </Helmet>

      <section className="hero">
        <div className="hero-orb orb-one" />
        <div className="hero-orb orb-two" />
        <div className="hero-content">
          <span className="eyebrow">Your next stop starts here</span>
          <h1>One search.<br /><em>Every destination.</em></h1>
          <p>Explore platforms, collections, communities, and more. StreamHub points you in the right direction.</p>
          <div className="hero-actions">
            <a className="button primary" href="#discover">Explore all</a>
            {hero ? <Link className="button ghost" to={`/platform/${hero.slug}`}>See what is trending</Link> : null}
          </div>
        </div>
        {hero ? (
          <Link className="hero-feature" to={`/platform/${hero.slug}`}>
            {hero.logo_url ? <img src={hero.logo_url} alt="" /> : <div className="hero-fallback">{hero.name.charAt(0)}</div>}
            <div><span>Featured now</span><strong>{hero.name}</strong><small>{hero.category.name}</small></div>
          </Link>
        ) : null}
      </section>

      <div className="page-content">
        {error ? <div className="error-banner">{error}</div> : null}
        <PlatformRow eyebrow="Popular now" title="Trending destinations" platforms={trending} ranked />
        <PlatformRow eyebrow="Fresh picks" title="Recently added" platforms={recent} />

        <section className="discover-section" id="discover">
          <div className="section-heading discover-heading">
            <div><span>Browse everything</span><h2>Find your destination</h2></div>
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input value={query} onChange={event => updateFilter(setQuery, event.target.value)} placeholder="Search platforms, categories, tags..." />
            </label>
          </div>

          <div className="filter-row" aria-label="Category filters">
            <button className={!category ? "active" : ""} onClick={() => updateFilter(setCategory, "")}>All</button>
            {categories.map(item => <button className={category === item.slug ? "active" : ""} key={item.id} onClick={() => updateFilter(setCategory, item.slug)}>{item.icon} {item.name}</button>)}
          </div>
          {tags.length ? (
            <div className="tag-row" aria-label="Tag filters">
              <button className={!tag ? "active" : ""} onClick={() => updateFilter(setTag, "")}>Any tag</button>
              {tags.map(item => <button className={tag === item.slug ? "active" : ""} key={item.id} onClick={() => updateFilter(setTag, item.slug)}>#{item.name}</button>)}
            </div>
          ) : null}

          <div className="platform-grid">
            {platforms.results.map(platform => <PlatformCard key={platform.id} platform={platform} />)}
          </div>
          {!loading && !platforms.results.length ? <div className="empty-state"><h3>No destinations found</h3><p>Try a broader search or another filter.</p></div> : null}
          {loading ? <div className="loading">Loading destinations...</div> : null}
          {platforms.next && !loading ? <button className="button load-more" onClick={() => setPage(value => value + 1)}>Load more</button> : null}
        </section>
      </div>
    </>
  );
}
