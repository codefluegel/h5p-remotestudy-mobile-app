import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import i18next from 'i18next';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';

import { UnitResult, UnitResultData } from '../app/(students)/results';
import * as courseApi from '../services/service';
import { showError } from '../utils/alert';
import { convertUnitResultsToCsv } from '../utils/utils';

const useExportCourse = (courseId: string, courseName: string) => {
  const { t } = i18next;
  const handleExport = async () => {
    if (!courseId) {
      showError(t('export.error_title'), t('export.missing_id'));
      return;
    }

    try {
      const [resultsRes, courseContentRes] = await Promise.all([
        courseApi.getCourseResults(courseId),
        courseApi.getCourseContent(courseId),
      ]);

      if (!resultsRes.data) {
        showError(t('export.error_title'), t('export.no_results'));
        return;
      }

      // Create a map of unitId (contentHash) to unit name
      const unitNameMap: Record<string, string> = {};
      if (courseContentRes.data?.units) {
        courseContentRes.data.units.forEach(unit => {
          unitNameMap[unit.contentHash] = unit.name;
        });
      }

      const successfulResults: UnitResult[] = [];

      Object.entries(resultsRes.data).forEach(([userId, userData]) => {
        Object.entries(userData.unit).forEach(([unitId, unitResultData]) => {
          const unitName = unitNameMap[unitId] || unitId;

          successfulResults.push({
            courseId,
            courseName,
            unitId,
            unitName,
            userId: userData.email || userId,
            result: unitResultData as UnitResultData,
          });
        });
      });

      if (successfulResults.length === 0) {
        showError(t('export.error_title'), t('export.no_data'));
        return;
      }
      const csvString: string = convertUnitResultsToCsv(successfulResults);
      if (!csvString) {
        showError(t('export.error_title'), t('export.conversion_failed'));
        return;
      }

      const safeCourseName = courseName
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();
      const filename = `${safeCourseName}_results.csv`;

      if (Platform.OS === 'web') {
        // Web: Use download link (no filesystem needed)
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        Toast.show({
          type: 'success',
          text1: `${courseName} has been exported successfully`,
        });
      } else {
        // Native: write using the modern File API and share
        const file = new File(Paths.document, filename);
        // Write may throw; let the outer try/catch handle it
        file.write(csvString);

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(file.uri, {
            mimeType: 'text/csv',
            dialogTitle: `Export ${courseName} Results`,
            UTI: 'public.comma-separated-values',
          });

          Toast.show({
            type: 'success',
            text1: `${courseName} has been exported successfully`,
          });
        } else {
          showError(t('export.error_title'), t('export.sharing_unavailable'));
        }
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showError(t('export.error_title'), t('export.export_failed'));
    }
  };

  return { handleExport };
};

export default useExportCourse;
