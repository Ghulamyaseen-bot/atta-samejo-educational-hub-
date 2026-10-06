/**
 * School Grading System (Class 1 to 12)
 * Strictly: Marks -> Percentage -> Grade
 * NO GPA / CGPA / Semester Points.
 */

export function calculatePercentage(obtained: number, total: number): number {
  if (total <= 0) return 0;
  const pct = (obtained / total) * 100;
  return Math.round(pct * 10) / 10;
}

export function calculateSchoolGrade(percentage: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
  if (percentage >= 80) return 'A+';
  if (percentage >= 70) return 'A';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}

export function getGradeLabel(grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'): string {
  switch (grade) {
    case 'A+': return 'Outstanding (Grade A+)';
    case 'A': return 'Excellent (Grade A)';
    case 'B': return 'Good (Grade B)';
    case 'C': return 'Fair (Grade C)';
    case 'D': return 'Pass (Grade D)';
    case 'F': return 'Needs Improvement (Fail)';
  }
}

export function getGradeBadgeColor(grade: string): { bg: string; text: string; border: string } {
  switch (grade) {
    case 'A+':
    case 'A':
      return { bg: 'bg-emerald-50 text-emerald-700', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'B':
      return { bg: 'bg-blue-50 text-blue-700', text: 'text-blue-700', border: 'border-blue-200' };
    case 'C':
      return { bg: 'bg-amber-50 text-amber-700', text: 'text-amber-700', border: 'border-amber-200' };
    case 'D':
      return { bg: 'bg-orange-50 text-orange-700', text: 'text-orange-700', border: 'border-orange-200' };
    default:
      return { bg: 'bg-rose-50 text-rose-700', text: 'text-rose-700', border: 'border-rose-200' };
  }
}
