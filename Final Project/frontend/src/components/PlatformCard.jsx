import { Link } from "react-router-dom";

export default function PlatformCard({ platform, rank }) {
  return (
    <Link className="platform-card" to={`/platform/${platform.slug}`}>
      <div className="card-visual">
        {rank ? <span className="rank">{rank}</span> : null}
        {platform.logo_url ? (
          <img src={platform.logo_url} alt="" loading="lazy" />
        ) : (
          <div className="logo-fallback" aria-hidden="true">{platform.name.charAt(0)}</div>
        )}
        <span className="card-action">View</span>
      </div>
      <div className="card-copy">
        <h3>{platform.name}</h3>
        <span>{platform.category.name}</span>
      </div>
    </Link>
  );
}
