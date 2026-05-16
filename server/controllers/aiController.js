// Mock AI engine — swap suggestQuadrant / suggestTitleImprovement / suggestSubtasks
// with real Claude/OpenAI API calls by updating only these functions.

const URGENCY_KW = ['tonight','today','now','asap','urgent','immediately','deadline','overdue','midnight','before class','by tomorrow','eod','critical','emergency','right away','quickly','fast','due soon','expires'];
const IMPORTANCE_KW = ['exam','midterm','final','grade','thesis','project','assignment','report','presentation','internship','career','interview','proposal','research','study','important','critical','priority','goal','revenue','client','meeting','milestone','professor','prof'];
const DELEGATE_KW = ['pick up','errand','buy','collect','drop off','run to','coordinate','schedule','book','reserve','arrange','remind','notify'];
const ELIMINATE_KW = ['optional','maybe','someday','eventually','low priority','nice to have','bonus','extra','leisure','fun','hobby','reorganize','clean','sort','tidy','watch','browse','explore','scroll'];

const Q_LABELS = { q1: 'Do First', q2: 'Schedule', q3: 'Delegate', q4: 'Eliminate' };

function detectQuadrant(title, notes = '') {
  const text = `${title} ${notes}`.toLowerCase();
  const isUrgent = URGENCY_KW.some((k) => text.includes(k));
  const isImportant = IMPORTANCE_KW.some((k) => text.includes(k));
  const isDelegateable = DELEGATE_KW.some((k) => text.includes(k));
  const isEliminate = ELIMINATE_KW.some((k) => text.includes(k));

  if (isEliminate && !isUrgent && !isImportant) return { quadrant: 'q4', confidence: 'High', reason: 'Keywords suggest low urgency and low importance. Consider dropping or deferring.' };
  if (isDelegateable && isUrgent && !isImportant) return { quadrant: 'q3', confidence: 'Medium', reason: 'Time-sensitive but could be handled by someone else. Great candidate to delegate.' };
  if (isUrgent && isImportant) return { quadrant: 'q1', confidence: 'High', reason: 'Detected urgency signals and importance markers. Handle this first today.' };
  if (!isUrgent && isImportant) return { quadrant: 'q2', confidence: 'High', reason: 'Important for your goals but no hard deadline. Block dedicated time to work on it.' };
  if (isUrgent && !isImportant) return { quadrant: 'q3', confidence: 'Medium', reason: 'Feels time-pressured but does not directly advance your key goals. Try to delegate.' };
  return { quadrant: 'q4', confidence: 'Low', reason: 'No strong urgency or importance signals detected. Consider whether this is truly necessary.' };
}

function suggestTitleImprovement(title) {
  const t = title.trim();
  const suggestions = [];
  if (t.length < 15) suggestions.push(`Be more specific: "${t} — add context about why this matters or when it is due."`);
  if (!t.match(/\b(by|before|until|on|today|tomorrow|this week|monday|tuesday|wednesday|thursday|friday)\b/i)) suggestions.push('Add a time reference (e.g. "by Friday" or "before class").');
  if (t.split(' ').length > 15) suggestions.push('Consider splitting into two tasks — this title is quite long.');
  return suggestions.slice(0, 2);
}

function suggestSubtasks(title, notes = '') {
  const text = `${title} ${notes}`.toLowerCase();
  const subtasks = [];
  if (text.includes('presentation') || text.includes('slides')) {
    subtasks.push('Draft outline and key points', 'Build slide deck', 'Rehearse with teammate', 'Upload final version');
  } else if (text.includes('report') || text.includes('paper') || text.includes('essay')) {
    subtasks.push('Research and gather sources', 'Write first draft', 'Revise and proofread', 'Submit final version');
  } else if (text.includes('study') || text.includes('exam') || text.includes('midterm') || text.includes('final')) {
    subtasks.push('Review notes and highlights', 'Work through practice problems', 'Identify weak areas', 'Final review session');
  } else if (text.includes('interview') || text.includes('application') || text.includes('internship')) {
    subtasks.push('Research the company', 'Tailor resume and cover letter', 'Prepare answers to common questions', 'Send follow-up email');
  } else {
    subtasks.push('Break task into steps', 'Set a time block to work on it', 'Review when done');
  }
  return subtasks;
}

const suggest = async (req, res) => {
  try {
    const { title, notes } = req.body;
    if (!title) return res.status(400).json({ message: 'title is required' });
    await new Promise((r) => setTimeout(r, 350));
    const { quadrant, confidence, reason } = detectQuadrant(title, notes);
    const titleHints = suggestTitleImprovement(title);
    res.json({ quadrant, quadrantLabel: Q_LABELS[quadrant], confidence, reason, titleHints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const subtasks = async (req, res) => {
  try {
    const { title, notes } = req.body;
    if (!title) return res.status(400).json({ message: 'title is required' });
    await new Promise((r) => setTimeout(r, 300));
    res.json({ subtasks: suggestSubtasks(title, notes) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { suggest, subtasks };
