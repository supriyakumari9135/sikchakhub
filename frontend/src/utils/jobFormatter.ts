/**
 * Helper to clean, parse, and format job descriptions across SikchaKhub.
 * Prevents line breaks, tabs (\t), or divider lines (----) from deforming layout.
 */

export const formatDescriptionSnippet = (description?: string): string => {
  if (!description || !description.trim()) {
    return 'Teaching opening with structured academic curriculum and student mentoring requirements.';
  }

  // 1. Clean tabs and horizontal divider rules
  const clean = description
    .replace(/\t/g, ' ')
    .replace(/[-=_]{4,}/g, ' ')
    .trim();

  // 2. Check if this is the standard coaching / school notice format
  const isStructured = 
    clean.includes('SUBJECT -') || 
    clean.includes('CLASS/LEVEL -') || 
    clean.includes('SELECTION PROCESS -') ||
    clean.includes('EXPERIENCE -') ||
    clean.includes('SALARY -');

  if (isStructured) {
    const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);
    const summaryPills: string[] = [];

    for (const line of lines) {
      const match = line.match(/^([A-Z0-9/\s&]+?)\s*[-:]\s*(.+)$/i);
      if (match) {
        const key = match[1].trim().toUpperCase();
        const val = match[2].trim().replace(/[-–,]$/, '').trim();

        if (key.includes('SUBJECT')) {
          summaryPills.push(`Subject: ${val}`);
        } else if (key.includes('CLASS') || key.includes('LEVEL')) {
          summaryPills.push(`Level: ${val}`);
        } else if (key.includes('PROCESS') || key.includes('SELECTION')) {
          summaryPills.push(`Selection: ${val}`);
        } else if (key.includes('EXP')) {
          summaryPills.push(val);
        } else if (key.includes('SALARY') || key.includes('CTC')) {
          summaryPills.push(val);
        } else if (key.includes('NOTE') || key.includes('TERMS') || key.includes('TA/DA')) {
          summaryPills.push(`Note: ${val}`);
        }
      }
    }

    if (summaryPills.length > 0) {
      return summaryPills.join(' • ');
    }
  }

  // Fallback: single line clean prose without multi-line breaks
  return clean.replace(/\s+/g, ' ');
};
