import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import Icon from '../components/ui/Icon';
import { useTaskContext } from '../context/TaskContext';
import { QUADRANTS } from '../components/board/Quadrant';

function exportCSV(tasks) {
  const headers = ['Title', 'Quadrant', 'Priority', 'Completed', 'Due Date', 'Labels', 'Assignee'];
  const rows = tasks.map((t) => [
    `"${t.title.replace(/"/g, '""')}"`,
    QUADRANTS.find((q) => q.id === t.quadrant)?.label || t.quadrant,
    t.priority,
    t.completed ? 'Yes' : 'No',
    t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
    (t.labels || []).join(';'),
    t.assignee,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'taskmatrix-export.csv'; a.click();
  URL.revokeObjectURL(url);
}

function StatCard({ value, label, delta, color }) {
  return (
    <div className="tm-stat-card">
      <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--ink-3)' }}>{label}</div>
      <div className="tm-stat-value" style={{ color: color || 'var(--ink)', marginTop: 10 }}>{value}</div>
      {delta != null && (
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--q4)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: '5px solid var(--q4)' }} />
          {delta}
        </div>
      )}
    </div>
  );
}

function BarChart({ data, max }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 180 }}>
      {data.map(([created, done], i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div style={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: 2, width: '100%', justifyContent: 'center' }}>
            <div style={{ background: 'var(--ink-4)', opacity: 0.35, width: '45%', height: `${(created / max) * 100}%`, borderRadius: '3px 3px 0 0' }} />
            <div style={{ background: 'var(--q4)', width: '45%', height: `${(done / max) * 100}%`, borderRadius: '3px 3px 0 0' }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>{i + 1}</div>
        </div>
      ))}
    </div>
  );
}

function Heatmap() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = ['9', '10', '11', '12', '1', '2', '3', '4', '5'];
  const seed = (d, h) => ((d * 7 + h * 13 + 11) % 9) / 8;
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(9, 1fr)', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-4)', minWidth: 320 }}>
        <div />
        {hours.map((h) => <div key={h} style={{ textAlign: 'center' }}>{h}</div>)}
        {days.map((d, di) => (
          <><div key={d} style={{ paddingRight: 6, alignSelf: 'center' }}>{d}</div>
            {hours.map((_, hi) => {
              const v = seed(di, hi);
              return <div key={hi} style={{ aspectRatio: '1', borderRadius: 4, background: v < 0.1 ? 'var(--bg-2)' : `hsl(${160 - v * 40} ${40 + v * 30}% ${85 - v * 40}%)` }} />;
            })}</>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { tasks } = useTaskContext();
  const allTasks = [...tasks];

  const total     = allTasks.length;
  const completed = allTasks.filter((t) => t.completed).length;
  const overdue   = allTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed).length;
  const rate      = total ? Math.round((completed / total) * 100) : 0;
  const byQ       = Object.fromEntries(QUADRANTS.map((q) => [q.id, allTasks.filter((t) => t.quadrant === q.id).length]));

  // Real 14-day chart from task timestamps
  const chartData = Array.from({ length: 14 }, (_, i) => {
    const day = new Date(); day.setDate(day.getDate() - (13 - i)); day.setHours(0, 0, 0, 0);
    const nextDay = new Date(day); nextDay.setDate(nextDay.getDate() + 1);
    const created = allTasks.filter((t) => { const c = new Date(t.createdAt); return c >= day && c < nextDay; }).length;
    const done = allTasks.filter((t) => { if (!t.completedAt) return false; const c = new Date(t.completedAt); return c >= day && c < nextDay; }).length;
    return [created, done];
  });
  const chartMax = Math.max(5, ...chartData.map(([c]) => c));

  const tips = [];
  if (byQ['q1'] > 4) tips.push({ icon: 'clock', title: `${byQ['q1']} tasks stuck in Do First`, body: 'Consider breaking them into smaller chunks or scheduling focus blocks.' });
  if (byQ['q4'] > 2) tips.push({ icon: 'trash', title: `${byQ['q4']} tasks in Eliminate`, body: 'These may be safe to drop — freeing up mental bandwidth.' });
  if (tips.length === 0) tips.push({ icon: 'star', title: 'Good balance!', body: 'Keep scheduling Q2 tasks to stay ahead of the fire.' });

  return (
    <div className="tm-app">
      <Sidebar />
      <div className="tm-board-content">
        <Topbar
          title="Analytics"
          actions={
            <div style={{ display: 'flex', gap: 8 }} className="no-print">
              <button className="tm-btn tm-btn-sm" onClick={() => exportCSV(allTasks)}>
                <Icon name="download" size={13} />Export CSV
              </button>
              <button className="tm-btn tm-btn-sm" onClick={() => window.print()}>
                <Icon name="download" size={13} />Export PDF
              </button>
            </div>
          }
        />

        <div className="tm-board-scroll" style={{ background: 'var(--bg)' }}>
          <div style={{ marginBottom: 24 }}>
            <div className="tm-hero-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
            <h2 className="tm-hero-heading">Your productivity snapshot</h2>
          </div>

          {/* KPI row */}
          <div className="tm-analytics-grid" style={{ marginBottom: 16 }}>
            <StatCard value={`${rate}%`} label="Completion rate" color="var(--q2)" />
            <StatCard value={completed} label="Tasks completed" color="var(--q4)" />
            <StatCard value={total - completed} label="Active tasks" />
            <StatCard value={overdue} label="Overdue" color={overdue > 0 ? 'var(--q1)' : 'var(--ink)'} delta={undefined} />
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14, marginBottom: 14 }}>
            {/* Created vs completed */}
            <div className="tm-stat-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--ink-3)' }}>Created vs completed</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 2 }}>Last 14 days</div>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--ink-3)' }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--ink-4)', opacity: 0.5 }} />Created</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--ink-3)' }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--q4)' }} />Completed</span>
                </div>
              </div>
              <BarChart data={chartData} max={chartMax} />
            </div>

            {/* Quadrant distribution */}
            <div className="tm-stat-card" style={{ padding: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--ink-3)' }}>Quadrant distribution</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 2, marginBottom: 14 }}>Where time goes</div>

              {/* Stacked bar */}
              <div style={{ display: 'flex', height: 14, borderRadius: 4, overflow: 'hidden', marginBottom: 14 }}>
                {QUADRANTS.map((q) => (
                  <div key={q.id} style={{ width: total ? `${(byQ[q.id] / total) * 100}%` : '25%', background: q.color }} title={`${q.label}: ${byQ[q.id]}`} />
                ))}
              </div>

              {QUADRANTS.map((q) => (
                <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: q.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{q.label}</div>
                  <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'var(--bg-2)', overflow: 'hidden' }}>
                    <div style={{ width: total ? `${(byQ[q.id] / total) * 100}%` : '0%', height: '100%', background: q.color }} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', width: 24, textAlign: 'right' }}>{byQ[q.id]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Heatmap */}
            <div className="tm-stat-card" style={{ padding: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--ink-3)' }}>Productivity heatmap</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 2, marginBottom: 16 }}>When you ship</div>
              <Heatmap />
            </div>

            {/* AI patterns */}
            <div style={{ background: 'var(--ink)', color: 'var(--bg)', borderRadius: 'var(--radius)', padding: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Patterns from AI</div>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {tips.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name={p.icon} size={14} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.title}</div>
                      <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, marginTop: 3 }}>{p.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
