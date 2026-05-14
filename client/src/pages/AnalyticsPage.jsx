import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import { useTaskContext } from '../context/TaskContext';
import { QUADRANTS } from '../components/board/Quadrant';

function StatCard({ value, label, color }) {
  return (
    <div className="tm-stat-card">
      <div className="tm-stat-value" style={{ color: color || 'var(--ink)' }}>{value}</div>
      <div className="tm-stat-label">{label}</div>
    </div>
  );
}

function QuadrantBar({ q, count, total }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
      <div style={{ width: 90, fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', flexShrink: 0 }}>
        {q.label}
      </div>
      <div style={{ flex: 1 }}>
        <div className="tm-chart-bar-bg">
          <div
            className="tm-chart-bar-fill"
            style={{ width: `${pct}%`, background: q.color }}
          />
        </div>
      </div>
      <div style={{ width: 36, fontSize: 13, fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {count}
      </div>
      <div style={{ width: 34, fontSize: 12, color: 'var(--ink-4)', textAlign: 'right' }}>
        {pct}%
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { tasks } = useTaskContext();

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed).length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;

  const byQ = QUADRANTS.reduce((acc, q) => {
    acc[q.id] = tasks.filter((t) => t.quadrant === q.id).length;
    return acc;
  }, {});

  const priorityCounts = {
    High:   tasks.filter((t) => t.priority === 'High').length,
    Medium: tasks.filter((t) => t.priority === 'Medium').length,
    Low:    tasks.filter((t) => t.priority === 'Low').length,
  };

  return (
    <div className="tm-app">
      <Sidebar />

      <div className="tm-board-content">
        <Topbar title="Analytics" />

        <div className="tm-board-scroll">
          {/* Hero */}
          <div style={{ marginBottom: 24 }}>
            <div className="tm-hero-date">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <h2 className="tm-hero-heading">Your productivity snapshot</h2>
          </div>

          {/* Stat cards */}
          <div className="tm-analytics-grid">
            <StatCard value={total}            label="Total tasks"      />
            <StatCard value={completed}        label="Completed"        color="var(--q4)" />
            <StatCard value={`${completionRate}%`} label="Completion rate" color="var(--q2)" />
            <StatCard value={overdue}          label="Overdue"          color={overdue > 0 ? 'var(--q1)' : 'var(--ink)'} />
          </div>

          {/* Distribution */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* By quadrant */}
            <div className="tm-stat-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 18 }}>Tasks by quadrant</h3>
              {QUADRANTS.map((q) => (
                <QuadrantBar key={q.id} q={q} count={byQ[q.id]} total={total} />
              ))}
            </div>

            {/* By priority */}
            <div className="tm-stat-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 18 }}>Tasks by priority</h3>
              {[
                { label: 'High',   color: 'var(--q1)', count: priorityCounts.High   },
                { label: 'Medium', color: 'var(--q3)', count: priorityCounts.Medium },
                { label: 'Low',    color: 'var(--q4)', count: priorityCounts.Low    },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 60, fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', flexShrink: 0 }}>
                    {row.label}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="tm-chart-bar-bg">
                      <div
                        className="tm-chart-bar-fill"
                        style={{ width: total ? `${Math.round((row.count / total) * 100)}%` : '0%', background: row.color }}
                      />
                    </div>
                  </div>
                  <div style={{ width: 36, fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{row.count}</div>
                </div>
              ))}

              {/* Quadrant health */}
              <div style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Eisenhower health</h3>
                {(() => {
                  const q1Count = byQ['q1'];
                  const q4Count = byQ['q4'];
                  const totalActive = tasks.filter((t) => !t.completed).length;
                  if (totalActive === 0) return <p style={{ color: 'var(--ink-4)', fontSize: 13 }}>No active tasks — great work!</p>;
                  const tips = [];
                  if (q1Count > 4) tips.push('You have many urgent tasks. Try to schedule preventively.');
                  if (q4Count > 2) tips.push('Consider eliminating low-value tasks to reclaim focus time.');
                  if (tips.length === 0) tips.push('Good balance! Keep scheduling Q2 tasks to stay ahead.');
                  return tips.map((tip, i) => (
                    <p key={i} style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 6 }}>
                      💡 {tip}
                    </p>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
