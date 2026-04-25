/**
 * Utility helpers for skill parsing and assessment scoring.
 */

export const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
export const PROFICIENCY_SCORES = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };

export function proficiencyToScore(level) {
  return PROFICIENCY_SCORES[level] ?? 0;
}

export function computeGapScore(required, assessed) {
  return Math.max(0, proficiencyToScore(required) - proficiencyToScore(assessed));
}

export function gapSeverity(score) {
  if (score >= 3) return 'Critical';
  if (score === 2) return 'High';
  if (score === 1) return 'Medium';
  return 'None';
}

export function gapColor(severity) {
  const map = { Critical: '#ff6b6b', High: '#ffb347', Medium: '#6c63ff', None: '#00d4aa' };
  return map[severity] ?? '#8b8fa8';
}

export function computeReadiness(assessedSkills, requiredSkills) {
  if (!requiredSkills.length) return 0;
  let totalScore = 0;
  let maxScore = 0;
  requiredSkills.forEach(req => {
    const assessed = assessedSkills.find(a => a.name.toLowerCase() === req.name.toLowerCase());
    const weight = req.importance === 'Critical' ? 3 : req.importance === 'Important' ? 2 : 1;
    maxScore += proficiencyToScore(req.requiredLevel) * weight;
    if (assessed) {
      totalScore += Math.min(proficiencyToScore(assessed.level), proficiencyToScore(req.requiredLevel)) * weight;
    }
  });
  return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
}

export function parseSkillAssessed(message) {
  // matches: SKILL_ASSESSED: JavaScript | LEVEL: Advanced
  const match = message.match(/SKILL_ASSESSED:\s*(.+?)\s*\|\s*LEVEL:\s*(Beginner|Intermediate|Advanced|Expert)/i);
  if (match) return { skill: match[1].trim(), level: match[2].trim() };
  return null;
}

export function isAssessmentComplete(message) {
  return message.includes('ASSESSMENT_COMPLETE');
}
