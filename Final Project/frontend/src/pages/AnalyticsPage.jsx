import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { apiFetch } from "../api";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    apiFetch("/analytics/dashboard/?days=30")
      .then(result => { setData(result); setStatus("ready"); })
      .catch(error => setStatus(error.status === 401 || error.status === 403 ? "unauthorized" : "error"));
  }, []);

  if (status === "unauthorized") return (
    <div className="state-page">
      <h1>Staff analytics</h1>
      <p>Sign in through Django Admin, then return here to view protected analytics.</p>
      <a className="button primary" href="/admin/login/?next=/admin/">Sign in to admin</a>
    </div>
  );
  if (status !== "ready") return <div className="state-page"><div className="loading">{status === "error" ? "Analytics are unavailable." : "Loading analytics..."}</div></div>;

  return (
    <div className="analytics-page page-content">
      <Helmet><title>Analytics | StreamHub</title><meta name="robots" content="noindex" /></Helmet>
      <div className="analytics-heading"><span className="eyebrow">Last 30 days</span><h1>Audience pulse</h1><p>A clear view of where visitors are heading.</p></div>
      <div className="metric-grid">
        <article><span>All-time clicks</span><strong>{data.total_clicks.toLocaleString()}</strong></article>
        <article><span>Last 30 days</span><strong>{data.period_clicks.toLocaleString()}</strong></article>
        <article><span>Top destination</span><strong className="metric-name">{data.most_visited[0]?.platform__name || "No data"}</strong></article>
        <article><span>Top category</span><strong className="metric-name">{data.category_popularity[0]?.platform__category__name || "No data"}</strong></article>
      </div>
      <div className="analytics-grid">
        <section className="chart-panel">
          <div className="panel-heading"><h2>Daily clicks</h2><span>30-day trend</span></div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.daily_trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252830" vertical={false} />
              <XAxis dataKey="date" stroke="#777b87" tickLine={false} axisLine={false} />
              <YAxis stroke="#777b87" tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#13151b", border: "1px solid #2a2d36", borderRadius: 12 }} />
              <Bar dataKey="clicks" fill="#df4255" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
        <section className="ranking-panel">
          <div className="panel-heading"><h2>Most visited</h2><span>Top 10</span></div>
          <ol>{data.most_visited.map((item, index) => <li key={item.platform__slug}><b>{index + 1}</b><span>{item.platform__name}</span><strong>{item.clicks}</strong></li>)}</ol>
        </section>
      </div>
      <section className="logs-panel">
        <div className="panel-heading"><h2>Recent activity</h2><span>Latest 20 clicks</span></div>
        <div className="table-wrap"><table><thead><tr><th>Platform</th><th>Time</th><th>IP address</th><th>Referrer</th></tr></thead><tbody>
          {data.recent_clicks.map(log => <tr key={log.id}><td>{log.platform}</td><td>{new Date(log.timestamp).toLocaleString()}</td><td>{log.ip_address || "Unknown"}</td><td>{log.referrer || "Direct"}</td></tr>)}
        </tbody></table></div>
      </section>
    </div>
  );
}
