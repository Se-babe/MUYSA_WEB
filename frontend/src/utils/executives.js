export const parseAcademicYearStart = (year) => {
  if (!year) return 0;
  const match = String(year).match(/(\d{4})/);
  return match ? parseInt(match[1], 10) : 0;
};

export const getSortedAcademicYears = (executives) => {
  const years = [...new Set(executives.map((e) => e.academic_year).filter(Boolean))];
  return years.sort((a, b) => parseAcademicYearStart(b) - parseAcademicYearStart(a));
};

export const getCurrentAcademicYear = (executives) => {
  const active = executives.filter((e) => e.is_active !== false && e.academic_year);
  const pool = active.length ? active : executives.filter((e) => e.academic_year);
  return getSortedAcademicYears(pool)[0] || '';
};

export const groupExecutivesByYear = (executives) => {
  return getSortedAcademicYears(executives).map((year) => ({
    year,
    isCurrent: year === getCurrentAcademicYear(executives),
    executives: executives
      .filter((e) => e.academic_year === year)
      .sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99)),
  }));
};
