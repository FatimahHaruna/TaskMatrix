import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Brand from '../components/ui/Brand';

const STEPS = [
  {
    num: '01', title: 'Welcome to TaskMatrix.', sub: "You've got a lot going on. Let's sort it out.",
    body: "TaskMatrix uses the Eisenhower method — a simple 2×2 grid that separates urgent from important. AI suggestions help you slot every task into the right quadrant automatically.",
    action: 'Get started',
  },
  {
    num: '02', title: 'Type a task.\nWe\'ll put it in the right quadrant.', sub: 'Don\'t overthink it.',
    body: "Write the messiest version. AI will detect urgency, importance, and deadlines — and suggest where it belongs. You can always override.",
    example: 'Email TA about a 24hr extension on the data structures assignment before midnight',
    suggestion: { q: 'Do First', color: 'var(--q1)', confidence: 'High', reason: "Time-bound deadline tonight and impacts your grade. I'd treat this as Q1." },
    action: 'Sounds good',
  },
  {
    num: '03', title: 'Drag, assign, and collaborate.', sub: 'Your board, your team.',
    body: "Drag tasks between quadrants as priorities shift. Assign teammates, add due dates and labels, and comment directly on tasks.",
    action: 'Got it',
  },
  {
    num: '04', title: "You're all set.", sub: 'Let\'s build your matrix.',
    body: "Your board is ready. Start by adding your most urgent task — AI will suggest where it goes.",
    action: 'Go to my board',
  },
];

export default function WelcomePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-2)', padding: 32 }}>
      <div style={{ width: '100%', maxWidth: 680 }}>
        <div style={{ marginBottom: 20 }}>
          <Brand />
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? 'var(--ink)' : 'var(--line)', transition: 'background 0.2s' }} />
          ))}
        </div>

        <div style={{ fontSize: 12, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
          Step {step + 1} of {STEPS.length}
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 42, letterSpacing: '-0.035em', lineHeight: 1.05, margin: '8px 0 12px', whiteSpace: 'pre-line' }}>
          {s.title}
        </h2>
        <p style={{ color: 'var(--ink-3)', fontSize: 15, maxWidth: 520, lineHeight: 1.6, margin: 0 }}>{s.body}</p>

        {/* Step 2 demo */}
        {s.example && (
          <div style={{ marginTop: 28, background: 'var(--bg)', borderRadius: 16, border: '1px solid var(--line)', boxShadow: 'var(--shadow-2)', padding: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 10px' }}>
              <Icon name="sparkles" size={16} style={{ color: 'var(--accent)' }} />
              <div style={{ flex: 1, fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>{s.example}</div>
            </div>
            <div style={{ margin: '0 12px 12px', padding: 14, background: 'var(--bg-2)', borderRadius: 10, display: 'flex', gap: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--ink)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="sparkles" size={14} />
              </div>
              <div style={{ flex: 1, fontSize: 13.5, lineHeight: 1.5 }}>
                <div style={{ fontWeight: 600 }}>Suggested: <span style={{ color: s.suggestion.color }}>{s.suggestion.q}</span></div>
                <div style={{ color: 'var(--ink-3)', marginTop: 3 }}>{s.suggestion.reason}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: 'var(--bg)', border: '1px solid var(--line)', fontSize: 11, fontWeight: 500 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />{s.suggestion.confidence} confidence
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
          <button className="tm-btn tm-btn-ghost" onClick={() => step > 0 ? setStep(step - 1) : navigate('/login')}>
            ← Back
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="tm-btn" onClick={() => navigate('/board')}>Skip tour</button>
            <button className="tm-btn tm-btn-primary" onClick={() => isLast ? navigate('/board') : setStep(step + 1)}>
              {s.action} <Icon name="arrow" size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
