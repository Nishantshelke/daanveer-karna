import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";

import { apiFetch, redirectUrl } from "../api";
import PlatformRow from "../components/PlatformRow";

export default function PlatformPage() {
  const { slug } = useParams();
  const [platform, setPlatform] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setPlatform(null);
    setError(false);
    apiFetch(`/platforms/${slug}/`).then(setPlatform).catch(() => setError(true));
    window.scrollTo(0, 0);
  }, [slug]);

  if (error) return <div className="state-page"><h1>Destination unavailable</h1><p>It may have moved or is no longer active.</p><Link className="button primary" to="/">Browse StreamHub</Link></div>;
  if (!platform) return <div className="state-page"><div className="loading">Loading destination...</div></div>;

  const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
  const pageUrl = `${siteUrl}/platform/${platform.slug}`;

  return (
    <>
      <Helmet>
        <title>{platform.name} | StreamHub</title>
        <meta name="description" content={platform.description.slice(0, 155)} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={`${platform.name} | StreamHub`} />
        <meta property="og:description" content={platform.description.slice(0, 200)} />
        <meta property="og:url" content={pageUrl} />
        {platform.logo_url ? <meta property="og:image" content={platform.logo_url} /> : null}
      </Helmet>
      <section className="detail-hero">
        <div className="detail-backdrop">{platform.logo_url ? <img src={platform.logo_url} alt="" /> : null}</div>
        <div className="detail-content">
          <Link className="back-link" to="/">← Back to discover</Link>
          <div className="detail-layout">
            <div className="detail-logo">
              {platform.logo_url ? <img src={platform.logo_url} alt={`${platform.name} logo`} /> : <div className="logo-fallback">{platform.name.charAt(0)}</div>}
            </div>
            <div className="detail-copy">
              <span className="eyebrow">{platform.category.icon} {platform.category.name}</span>
              <h1>{platform.name}</h1>
              <p>{platform.description}</p>
              <div className="detail-tags">{platform.tags.map(tag => <span key={tag.id}>#{tag.name}</span>)}</div>
              <div className="detail-actions">
                <a className="button primary watch-button" href={redirectUrl(platform.slug)} rel="nofollow">Watch now <span>↗</span></a>
                <span className="click-note">You will be redirected to the destination site.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="page-content related-content">
        <PlatformRow eyebrow="Keep exploring" title={`More in ${platform.category.name}`} platforms={platform.related} />
      </div>
    </>
  );
}
