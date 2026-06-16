import PlatformCard from "./PlatformCard";

export default function PlatformRow({ title, eyebrow, platforms, ranked = false }) {
  if (!platforms?.length) return null;
  return (
    <section className="content-section">
      <div className="section-heading">
        <div><span>{eyebrow}</span><h2>{title}</h2></div>
      </div>
      <div className="horizontal-row">
        {platforms.map((platform, index) => (
          <PlatformCard key={platform.id} platform={platform} rank={ranked ? index + 1 : null} />
        ))}
      </div>
    </section>
  );
}
