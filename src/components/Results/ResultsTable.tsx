import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
  individualResultContainer: {
    marginBottom: 15,
    backgroundColor: '#FBFCFC',
    borderRadius: 8,
    borderColor: '#EBF5FB',
  },
  subSectionTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 8,
    color: '#4A6572',
    textAlign: 'center',
    backgroundColor: '#D6EAF8',
    paddingVertical: 5,
    borderRadius: 5,
  },
  tableHeader: {
    backgroundColor: '#D6EAF8',
    borderBottomColor: '#A9CCE3',
  },
  tableRow: {
    flexDirection: 'row',
    marginVertical: 1,
  },
  sectionCell: {
    flex: 3,
    paddingVertical: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  scoreCell: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#2C3E50',
    fontSize: 14,
  },
  sectionText: {
    fontSize: 13,
    color: '#34495E',
  },
  cellValue: {
    fontSize: 13,
    color: '#2C3E50',
  },
  noResultText: {
    color: '#95A5A6',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
});

type ScoreDetails = {
  raw: number;
  max: number;
};

type SectionScoreBreakdown = {
  [sectionName: string]: ScoreDetails;
};

export type UnitResultData =
  | SectionScoreBreakdown[]
  | { score: number; maxScore: number }
  | null;

type ResultsTableProps = {
  unitResultData: UnitResultData;
};

/**
 * Displays a formatted table of unit results
 * Handles three formats:
 * 1. Simple score/maxScore object
 * 2. Array of section breakdowns
 * 3. Null/no data
 */
export function ResultsTable({ unitResultData }: ResultsTableProps) {
  const { t } = useTranslation();
  if (!unitResultData) {
    return <Text style={styles.noResultText}>{t('results_table.empty')}</Text>;
  }

  // Simple score format
  if (
    !Array.isArray(unitResultData) &&
    'score' in unitResultData &&
    'maxScore' in unitResultData
  ) {
    return (
      <View style={styles.individualResultContainer}>
        <Text style={styles.subSectionTitle}>
          {t('results_table.header.main')}
        </Text>
        <View style={styles.tableHeader}>
          <View style={styles.sectionCell}>
            <Text style={styles.headerText}>
              {t('results_table.header.type')}
            </Text>
          </View>
          <View style={styles.scoreCell}>
            <Text style={styles.headerText}>
              {t('results_table.header.raw')}
            </Text>
          </View>
          <View style={styles.scoreCell}>
            <Text style={styles.headerText}>
              {t('results_table.header.max')}
            </Text>
          </View>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.sectionCell}>
            <Text style={styles.sectionText}>
              {t('results_table.cell_total')}
            </Text>
          </View>
          <View style={styles.scoreCell}>
            <Text style={styles.cellValue}>{unitResultData.score}</Text>
          </View>
          <View style={styles.scoreCell}>
            <Text style={styles.cellValue}>{unitResultData.maxScore}</Text>
          </View>
        </View>
      </View>
    );
  }

  // Section breakdown format
  if (Array.isArray(unitResultData)) {
    if (unitResultData.length === 0) {
      return (
        <Text style={styles.noResultText}>
          {t('results_table.empty_scores')}
        </Text>
      );
    }

    const lastSectionBreakdown = unitResultData[unitResultData.length - 1];
    const entries = Object.entries(lastSectionBreakdown);

    if (entries.length === 0) {
      return (
        <Text style={styles.noResultText}>
          {t('results_table.empty_sections')}
        </Text>
      );
    }

    return (
      <View style={styles.individualResultContainer}>
        <View style={[styles.tableHeader, styles.tableRow]}>
          <View style={styles.sectionCell}>
            <Text style={styles.headerText}>
              {t('results_table.header.section')}
            </Text>
          </View>
          <View style={styles.scoreCell}>
            <Text style={styles.headerText}>
              {t('results_table.header.points')}
            </Text>
          </View>
          <View style={styles.scoreCell}>
            <Text style={styles.headerText}>
              {t('results_table.header.max')}
            </Text>
          </View>
        </View>

        {entries.map(([sectionName, scoreDetails]) => {
          if (
            typeof scoreDetails === 'object' &&
            scoreDetails !== null &&
            'raw' in scoreDetails &&
            'max' in scoreDetails
          ) {
            const typedScoreDetails = scoreDetails as ScoreDetails;
            return (
              <View key={sectionName} style={styles.tableRow}>
                <View style={styles.sectionCell}>
                  <Text style={styles.sectionText}>{sectionName}</Text>
                </View>
                <View style={styles.scoreCell}>
                  <Text style={styles.cellValue}>{typedScoreDetails.raw}</Text>
                </View>
                <View style={styles.scoreCell}>
                  <Text style={styles.cellValue}>{typedScoreDetails.max}</Text>
                </View>
              </View>
            );
          }
          return null;
        })}
      </View>
    );
  }

  return (
    <Text style={styles.noResultText}>{t('results_table.error_format')}</Text>
  );
}

export default ResultsTable;
