// Mock AI suggestion engine. Replace suggestQuadrant with a real LLM call later.

const URGENCY_KEYWORDS = [
  'tonight', 'today', 'now', 'asap', 'urgent', 'immediately', 'deadline',
  'overdue', 'midnight', 'before class', 'by tomorrow', 'by end of day',
  'eod', 'critical', 'emergency', 'right away', 'quickly', 'fast',
];

const IMPORTANCE_KEYWORDS = [
  'exam', 'midterm', 'final', 'grade', 'thesis', 'project', 'assignment',
  'report', 'presentation', 'internship', 'career', 'interview', 'proposal',
  'research', 'study', 'important', 'critical', 'priority', 'goal',
  'revenue', 'client', 'meeting', 'deadline', 'milestone',
];

const DELEGATE_KEYWORDS = [
  'pick up', 'errand', 'buy', 'collect', 'drop off', 'run to',
  'coordinate', 'schedule', 'book', 'reserve', 'arrange',
];

const ELIMINATE_KEYWORDS = [
  'optional', 'maybe', 'someday', 'eventually', 'low priority', 'nice to have',
  'bonus', 'extra', 'leisure', 'fun', 'hobby', 'organize', 'reorganize',
  'clean', 'sort', 'tidy', 'watch', 'browse', 'explore',
];

function detectQuadrant(title, notes = '') {
  const text = `${title} ${notes}`.toLowerCase();

  const isUrgent = URGENCY_KEYWORDS.some((kw) => text.includes(kw));
  const isImportant = IMPORTANCE_KEYWORDS.some((kw) => text.includes(kw));
  const isDelegatable = DELEGATE_KEYWORDS.some((kw) => text.includes(kw));
  const isEliminate = ELIMINATE_KEYWORDS.some((kw) => text.includes(kw));

  let quadrant, reason, confidence;

  if (isEliminate && !isUrgent && !isImportant) {
    quadrant = 'q4';
    confidence = 'High';
    reason = "Keywords suggest this is low-urgency and low-importance. Consider dropping or deferring.";
  } else if (isDelegatable && isUrgent && !isImportant) {
    quadrant = 'q3';
    confidence = 'Medium';
    reason = "Seems time-sensitive but could be handled by someone else. Great candidate to delegate.";
  } else if (isUrgent && isImportant) {
    quadrant = 'q1';
    confidence = 'High';
    reason = "Detected urgency signals and importance markers. Handle this first today.";
  } else if (!isUrgent && isImportant) {
    quadrant = 'q2';
    confidence = 'High';
    reason = "Important for your goals but no hard deadline. Block dedicated time to work on it.";
  } else if (isUrgent && !isImportant) {
    quadrant = 'q3';
    confidence = 'Medium';
    reason = "Feels time-pressured but doesn't directly advance your key goals. Try to delegate.";
  } else {
    quadrant = 'q4';
    confidence = 'Low';
    reason = "No strong urgency or importance signals detected. Consider whether this is truly necessary.";
  }

  return { quadrant, confidence, reason };
}

const QUADRANT_LABELS = {
  q1: 'Do First',
  q2: 'Schedule',
  q3: 'Delegate',
  q4: 'Eliminate',
};

const suggest = async (req, res) => {
  try {
    const { title, notes } = req.body;
    if (!title) return res.status(400).json({ message: 'title is required' });

    // Simulate a short processing delay
    await new Promise((r) => setTimeout(r, 400));

    const { quadrant, confidence, reason } = detectQuadrant(title, notes);

    res.json({
      quadrant,
      quadrantLabel: QUADRANT_LABELS[quadrant],
      confidence,
      reason,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { suggest };
