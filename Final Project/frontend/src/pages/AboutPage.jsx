import { Helmet } from "react-helmet-async";

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About | StreamHub</title>
        <meta
          name="description"
          content="A cinematic Mahabharata-inspired About page for StreamHub."
        />
        <meta property="og:title" content="About StreamHub" />
        <meta
          property="og:description"
          content="Dhhusta Logo ki madat karte rehta hu kahi me Suryaputra Karna to nhi"
        />
        <meta property="og:image" content="/images/karna.jpg" />
      </Helmet>

      <section className="about-hero" aria-label="About StreamHub">
        <div className="about-hero__overlay" />
        <div className="about-hero__glow" />
        <div className="about-hero__content">
          <span className="about-hero__eyebrow">Suryaputra Karna</span>
          <h1>Dhhusta Logo ki madat karte rehta hu kahi me Suryaputra Karna to nhi</h1>
          <div className="about-hero__rule" aria-hidden="true" />
        </div>
      </section>
    </>
  );
}
