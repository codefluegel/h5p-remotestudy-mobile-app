import { SectionScoreBreakdown, UnitResult } from '../app/(students)/results';

type FlattenedUnitResult = {
  courseId: string;
  courseName: string;
  unitId: string;
  unitName: string;
  userId: string;
  totalScore: number | string;
  totalMaxScore: number | string;
  [key: string]: string | number; // This index signature is necessary for dynamic properties
};

export const sanitizeCsvValue = (
  value: string | number | null | undefined,
): string => {
  if (value === null || value === undefined) {
    return '';
  }
  const stringValue = String(value);
  if (
    stringValue.includes(',') ||
    stringValue.includes('\n') ||
    stringValue.includes('"')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

export const convertUnitResultsToCsv = (unitResults: UnitResult[]): string => {
  if (!unitResults || unitResults.length === 0) {
    return '';
  }

  const commonHeaders = [
    'courseId',
    'courseName',
    'unitId',
    'unitName',
    'userId',
    'totalScore',
    'totalMaxScore',
  ];
  const dynamicHeaders = new Set<string>(); // First Pass: Flatten the data and collect all possible dynamic headers

  const flattenedData: FlattenedUnitResult[] = unitResults.map(unit => {
    const row: FlattenedUnitResult = {
      courseId: unit.courseId,
      courseName: unit.courseName || '',
      unitId: unit.unitId,
      unitName: unit.unitName || '',
      userId: unit.userId || '',
      totalScore: '',
      totalMaxScore: '',
    };

    if (Array.isArray(unit.result)) {
      // Handle SectionScoreBreakdown[] type
      let totalRaw = 0;
      let totalMax = 0;
      (unit.result as SectionScoreBreakdown[]).forEach(sectionBreakdown => {
        // Iterate over all key-value pairs in the section breakdown object
        Object.entries(sectionBreakdown).forEach(
          ([sectionName, scoreDetails]) => {
            const rawHeader = `${sectionName}_raw`;
            const maxHeader = `${sectionName}_max`;

            dynamicHeaders.add(rawHeader);
            dynamicHeaders.add(maxHeader);

            row[rawHeader] = scoreDetails.raw;
            row[maxHeader] = scoreDetails.max;

            totalRaw += scoreDetails.raw;
            totalMax += scoreDetails.max;
          },
        );
      });
      row.totalScore = totalRaw;
      row.totalMaxScore = totalMax;
    } else if (
      unit.result &&
      typeof unit.result === 'object' &&
      'score' in unit.result &&
      'maxScore' in unit.result
    ) {
      // Handle { score, maxScore } type
      row.totalScore = unit.result.score;
      row.totalMaxScore = unit.result.maxScore;
    }

    return row;
  });

  const allHeaders = [...commonHeaders, ...Array.from(dynamicHeaders).sort()];

  const headerRow = `${allHeaders.map(sanitizeCsvValue).join(',')}\n`;

  const dataRows = flattenedData
    .map(item => {
      return allHeaders
        .map(header => {
          // Access the item property, defaulting to an empty string if it doesn't exist
          const value = item[header as keyof FlattenedUnitResult];
          return sanitizeCsvValue(value);
        })
        .join(',');
    })
    .join('\n');

  return headerRow + dataRows;
};
