import { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import Icon from '../components/ui/Icon';
import Avatar, { PEOPLE } from '../components/ui/Avatar';
import { useTaskContext } from '../context/TaskContext';

const ROLES = ['Owner', 'Admin', 'Editor', 'Viewer'];
const ROLE_MAP = { me: 'Owner', maya: 'Admin', omar: 'Editor', iris: 'Editor', leo: 'Viewer', noor: 'Viewer' };

const ACTIVITY = [
  { who: 'omar', verb: 'moved', target: '"Fix data-pipeline bug"', extra: 'Schedule → Do First', time: '12m ago' },
  { who: 'maya', verb: 'completed', target: '"Submit problem set 6"', time: '34m ago' },
  { who: 'iris', verb: 'commented on', target: '"Study group for Friday\'s exam"', time: '52m ago' },
  { who: 'leo',  verb: 'accepted AI suggestion on', target: '"Print poster for symposium"', time: '1h ago' },
];

export default function TeamPage() {
  const { tasks } = useTaskContext();
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState([
    { who: 'maya', time: '10:24am', body: 'Confirmed the bug — parser breaks on tab-separated input.' },
    { who: 'omar', time: '11:02am', body: 'Found it. The filter was applied twice. PR up — will merge after lunch.' },
  ]);

  function postComment() {
    if (!commentInput.trim()) return;
    setComments([...comments, { who: 'me', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), body: commentInput.trim() }]);
    setCommentInput('');
  }

  const workload = PEOPLE.filter((p) => p.id !== 'me').map((p) => ({
    ...p,
    count: tasks.filter((t) => t.assignee === p.id && !t.completed).length,
  }));

  return (
    <div className="tm-app">
      <Sidebar />
      <div className="tm-board-content">
        <Topbar
          title="Team workspace"
          actions={
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ display: 'flex' }}>
                {PEOPLE.slice(0, 5).map((p) => (
                  <div key={p.id} style={{ marginLeft: -6 }}>
                    <Avatar person={p} size={28} />
                  </div>
                ))}
              </div>
              <button className="tm-btn tm-btn-sm"><Icon name="plus" size={13} />Invite</button>
            </div>
          }
        />

        <div className="tm-board-scroll" style={{ background: 'var(--bg-2)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: 18 }}>
            {/* Left — task detail + comments */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--line)', padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--q1)', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Do First · #cs410 #demo
                  </span>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontSize: 12, color: 'var(--q1)', fontWeight: 600 }}>Due today · 3:00pm</span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, letterSpacing: '-0.025em', lineHeight: 1.25 }}>
                  Fix data-pipeline bug before Tuesday&apos;s defense demo
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, color: 'var(--ink-3)', fontSize: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Avatar person="omar" size={20} /> Omar · assigned
                  </div>
                  <span>· #cs410 #demo ·</span>
                  <span style={{ color: 'var(--q1)', fontWeight: 600 }}>High priority</span>
                </div>

                {/* Comments */}
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {comments.map((c, i) => {
                    const p = PEOPLE.find((x) => x.id === c.who) || PEOPLE[0];
                    return (
                      <div key={i} style={{ display: 'flex', gap: 10 }}>
                        <Avatar person={p} size={26} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                            <strong style={{ fontSize: 13 }}>{p.name.split(' ')[0]}</strong>
                            <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{c.time}</span>
                          </div>
                          <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5, marginTop: 3 }}>{c.body}</div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Comment input */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 4 }}>
                    <Avatar person="me" size={26} />
                    <div style={{ flex: 1, border: '1px dashed var(--line-2)', borderRadius: 10, padding: '10px 12px' }}>
                      <input
                        style={{ border: 'none', outline: 'none', width: '100%', font: 'inherit', fontSize: 13, color: 'var(--ink)', background: 'transparent' }}
                        placeholder="Add a comment — use @ to mention someone"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && postComment()}
                      />
                      {commentInput && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                          <button className="tm-btn tm-btn-primary tm-btn-sm" onClick={postComment}>Post</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity */}
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--line)', padding: 18 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--ink-3)' }}>Activity</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 4, marginBottom: 14 }}>Last hour</div>
                {ACTIVITY.map((a, i) => {
                  const p = PEOPLE.find((x) => x.id === a.who) || PEOPLE[0];
                  return (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '7px 0', borderTop: i > 0 ? '1px solid var(--line)' : 'none' }}>
                      <Avatar person={p} size={22} />
                      <div style={{ flex: 1, fontSize: 13, color: 'var(--ink-2)' }}>
                        <strong>{p.name.split(' ')[0]}</strong> {a.verb} <span style={{ color: 'var(--ink-3)' }}>{a.target}</span>
                        {a.extra && <> — <span style={{ color: 'var(--ink-3)' }}>{a.extra}</span></>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink-4)', flexShrink: 0 }}>{a.time}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right — team + workload */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Team members */}
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--line)', padding: 18 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--ink-3)' }}>Team</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 4, marginBottom: 12 }}>
                  {PEOPLE.length} members
                </div>
                {PEOPLE.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderTop: '1px solid var(--line)' }}>
                    <Avatar person={p} size={28} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{ROLE_MAP[p.id]}</div>
                    </div>
                    {p.id !== 'me' && (
                      <button className="tm-btn-icon"><Icon name="dots" size={14} /></button>
                    )}
                  </div>
                ))}
              </div>

              {/* Workload */}
              <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--line)', padding: 18 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--ink-3)' }}>Workload</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 4, marginBottom: 12 }}>Active tasks</div>
                {workload.map((w) => (
                  <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                    <Avatar person={w} size={22} />
                    <div style={{ flex: 1, fontSize: 13 }}>{w.name.split(' ')[0]}</div>
                    <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg-2)', overflow: 'hidden', maxWidth: 90 }}>
                      <div style={{ width: `${Math.min((w.count / 8) * 100, 100)}%`, height: '100%', background: w.count > 5 ? 'var(--q1)' : 'var(--ink)' }} />
                    </div>
                    <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', width: 20, textAlign: 'right' }}>{w.count}</div>
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
