import Feather from '@expo/vector-icons/Feather';
import { ListItem } from '@rneui/themed';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { observer } from 'mobx-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import style from '../../constants/Style';
import Theme from '../../constants/Theme';
import { ContentMetadata } from '../../localH5pServer';
import { useLocalH5pServer } from '../../localH5pServer/context';
import { useStore } from '../../store/context';
import { showAlert } from '../../utils/alert';
import { Unit } from '../../utils/types';
import UnitEditingRow from '../Cards/UnitEditingRow';
import SelectionHeader from '../Header/SelectionHeader';

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
  },
  webSectionsScroll: {
    flex: 1,
    minHeight: 0,
  },
  webSectionsContent: {
    paddingBottom: 80,
  },
  accordionHeader: {
    backgroundColor: 'white',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  numberCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderColor: '#ccc',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  numberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },

  titleTextGroup: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#F7F7F7',
  },
  sortText: {
    fontSize: 11,
    color: '#333',
    fontWeight: '600',
  },

  titleStyle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    flexShrink: 1,
    marginRight: 5,
  },

  subtitleStyle: {
    fontSize: 12,
    color: 'gray',
    marginTop: 2,
  },
  downloadCard: {
    marginHorizontal: 10,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...style.shadowProp,
  },
  downloadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.PRIMARY_TEXT_COLOR,
    marginBottom: 6,
  },
  downloadText: {
    fontSize: 13,
    color: Theme.SECONDARY_TEXT_COLOR,
    marginBottom: 12,
  },
  downloadButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Theme.PRIMARY_COLOR,
  },
  downloadButtonDisabled: {
    backgroundColor: '#9AA3AF',
  },
  downloadButtonText: {
    color: Theme.ON_PRIMARY_COLOR,
    fontSize: 14,
    fontWeight: '600',
  },
});

interface Section {
  title: string;
  data: Unit[];
}

type SortMode = 'manual' | 'name_asc' | 'name_desc';

const sortModes: SortMode[] = ['manual', 'name_asc', 'name_desc'];

const UnitsTabs = observer(() => {
  const { t } = useTranslation();
  const { courseId } = useLocalSearchParams();
  const { courseStore, appStateStore } = useStore();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const localServer = useLocalH5pServer();
  const course = courseStore.getCourse(String(courseId) ?? '');
  const [metadata, setMetadata] = useState<ContentMetadata[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [groupEnabled, setGroupEnabled] = useState(false);
  const [unitSortModes, setUnitSortModes] = useState<Record<string, SortMode>>(
    {},
  );
  const [groupSortMode, setGroupSortMode] = useState<SortMode>('manual');
  const [selectedUnitIds, setSelectedUnitIds] = useState<Set<string>>(
    new Set(),
  );
  const selectionMode: boolean = selectedUnitIds.size > 0;
  const isTeacher = appStateStore.isTeacher();
  const navigation = useNavigation();

  const getUnitSortMode = useCallback(
    (sectionTitle: string): SortMode => unitSortModes[sectionTitle] ?? 'manual',
    [unitSortModes],
  );

  const toggleUnitSortMode = useCallback((sectionTitle: string) => {
    setUnitSortModes(prev => {
      const current = prev[sectionTitle] ?? 'manual';
      const currentIndex = sortModes.indexOf(current);
      const nextIndex = (currentIndex + 1) % sortModes.length;
      return {
        ...prev,
        [sectionTitle]: sortModes[nextIndex],
      };
    });
  }, []);

  const toggleGroupSortMode = useCallback(() => {
    setGroupSortMode(prev => {
      const currentIndex = sortModes.indexOf(prev);
      const nextIndex = (currentIndex + 1) % sortModes.length;
      return sortModes[nextIndex];
    });
  }, []);

  useEffect(() => {
    if (groupEnabled) {
      setGroupEnabled(false);
      setSelectedUnitIds(new Set());
    }
  }, [groupEnabled]);

  useEffect(() => {
    if (!course || !course.isDownloaded || metadata.length > 0) {
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const allMetadata = await Promise.all(
          course.units.map(u => localServer.getH5pMetadata(u.contentId!)),
        );
        setMetadata(allMetadata);
      } catch (e) {
        console.error('load metadata error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [course, localServer, metadata.length]);

  const metadataByContentId = useMemo(() => {
    const map = new Map<number, ContentMetadata>();
    if (!course?.units) {
      return map;
    }

    course.units.forEach((unit, idx) => {
      const meta = metadata[idx];
      if (meta && typeof unit.contentId === 'number') {
        map.set(unit.contentId, meta);
      }
    });

    return map;
  }, [course?.units, metadata]);

  const handleDownloadCourse = useCallback(async () => {
    if (!course) return;
    if (course.isDownloaded) return;

    if (!course.downloadLink || course.downloadLink.trim() === '') {
      showAlert(
        t('course_units.alert.download_missing_title'),
        t('course_units.alert.download_missing_msg'),
      );
      return;
    }

    try {
      setLoading(true);
      const addedCourses = await localServer.addH5pBundle(course.downloadLink);

      const updatedUnits = course.units.map(unit => {
        const match = addedCourses.find(
          ({ hash }) => hash === unit.contentHash,
        );
        return match ? { ...unit, contentId: match.id } : unit;
      });

      courseStore.updateCourseById(String(courseId) ?? '', {
        units: updatedUnits,
        isDownloaded: true,
      });

      const allMetadata = await Promise.all(
        updatedUnits.map(u => localServer.getH5pMetadata(u.contentId!)),
      );
      setMetadata(allMetadata);
    } catch (e) {
      console.error('download error', e);
      showAlert(
        t('course_units.alert.download_failed_title'),
        t('course_units.alert.download_failed_msg'),
      );
    } finally {
      setLoading(false);
    }
  }, [course, courseId, courseStore, localServer, t]);

  const toggleSelection = useCallback((unitId: string): void => {
    setSelectedUnitIds(prevIds => {
      const newIds = new Set(prevIds);
      if (newIds.has(unitId)) {
        newIds.delete(unitId);
      } else {
        newIds.add(unitId);
      }
      return newIds;
    });
  }, []);

  const moveToGroupPage = useCallback(() => {
    router.push({
      pathname: '/(teacher)/course/GroupSelectionModal',
      params: {
        courseId: String(courseId),
        unitIds: Array.from(selectedUnitIds),
      },
    });
    setGroupEnabled(true);
  }, [courseId, selectedUnitIds]);

  const exitSelectionMode = useCallback((): void => {
    setSelectedUnitIds(new Set());
  }, []);

  useEffect(() => {
    if (selectionMode) {
      navigation.setOptions({
        headerStyle: {
          backgroundColor: 'white',
          shadowColor: 'black',
          shadowOpacity: 0.1,
          elevation: 2,
        },
        headerTitle: () => (
          <SelectionHeader
            selectedCount={selectedUnitIds.size}
            onExit={exitSelectionMode}
            onMoveToGroup={moveToGroupPage}
          />
        ),
        headerBackVisible: false,
        headerLeft: () => null,
        headerRight: () => null,
        headerTintColor: 'black',
        headerTitleAlign: 'center',
        headerTitleContainerStyle: {
          left: 0,
          right: 0,
        },
      });
    } else {
      navigation.setOptions({
        headerStyle: { backgroundColor: 'white' },
        headerLeft: undefined,
        headerTintColor: 'black',
        headerTitle: course?.name,
        headerBackVisible: true,
      });
    }
  }, [
    selectionMode,
    selectedUnitIds.size,
    navigation,
    exitSelectionMode,
    course?.name,
    moveToGroupPage,
  ]);

  const sortUnits = useCallback((units: Unit[], mode: SortMode): Unit[] => {
    const sorted = [...units];
    if (mode === 'name_asc') {
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (mode === 'name_desc') {
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    }
    return sorted.sort((a, b) => a.sortingIndex - b.sortingIndex);
  }, []);

  const groupUnitsByLabel = (units: Unit[]): Section[] => {
    const grouped = units.reduce(
      (acc, unit) => {
        const label = unit.label?.name ?? 'No Label';
        if (!acc[label]) acc[label] = [];
        acc[label].push(unit);
        return acc;
      },
      {} as Record<string, Unit[]>,
    );

    const entries = Object.entries(grouped);
    if (groupSortMode === 'name_asc') {
      entries.sort(([a], [b]) => a.localeCompare(b));
    } else if (groupSortMode === 'name_desc') {
      entries.sort(([a], [b]) => b.localeCompare(a));
    }

    return entries.map(([title, data]) => ({
      title,
      data: sortUnits(data, getUnitSortMode(title)),
    }));
  };

  const onPressUnit = (unit: Unit) => {
    if (!course?.isDownloaded) {
      showAlert(
        t('course_units.alert.download_required_title'),
        t('course_units.alert.download_required_msg'),
      );
      return;
    }

    router.navigate({
      pathname: `/(${
        isTeacher ? 'teacher' : 'students'
      })/course/CourseUnitWebViewScreen`,
      params: {
        contentId: String(unit.contentId),
        courseId: String(courseId),
      },
    });
  };

  const renderItemForSection = (sectionTitle: string) =>
    function ({ item, drag }: RenderItemParams<Unit>) {
      const matchingMeta =
        typeof item.contentId === 'number'
          ? metadataByContentId.get(item.contentId)
          : undefined;
      const unitKey = String(item.contentId ?? item.contentHash);
      const isManualSort = getUnitSortMode(sectionTitle) === 'manual';

      return (
        <UnitEditingRow
          metaData={matchingMeta}
          title={item.name}
          onPressUnit={() => onPressUnit(item)}
          onPressOptions={() => toggleSelection(unitKey)}
          onDrag={isTeacher && isManualSort ? drag : undefined}
          disabled={loading}
          isSelected={selectedUnitIds.has(unitKey)}
          isTeacher={isTeacher}
          disableReorder={!isManualSort}
        />
      );
    };

  const sections = groupUnitsByLabel(course?.units || []);

  const handleDragEnd = (
    reorderedData: Unit[],
    sectionTitle: string,
    mode: SortMode,
  ) => {
    if (mode !== 'manual') {
      return;
    }
    const newSections = sections.map(section =>
      section.title === sectionTitle
        ? { ...section, data: reorderedData }
        : section,
    );

    const allUnitsFlattened = newSections.flatMap(section => section.data);

    allUnitsFlattened.forEach((unit, ind) => {
      courseStore.updateUnit(String(courseId) ?? '', unit.contentId, {
        sortingIndex: ind,
      });
    });
  };

  const handleMoveUp = (
    sectionTitle: string,
    itemIndex: number,
    mode: SortMode,
  ) => {
    if (mode !== 'manual') {
      return;
    }
    const section = sections.find(s => s.title === sectionTitle);
    if (!section || itemIndex <= 0) return;

    const newData = [...section.data];
    const temp = newData[itemIndex];
    newData[itemIndex] = newData[itemIndex - 1];
    newData[itemIndex - 1] = temp;

    handleDragEnd(newData, sectionTitle, mode);
  };

  const handleMoveDown = (
    sectionTitle: string,
    itemIndex: number,
    mode: SortMode,
  ) => {
    if (mode !== 'manual') {
      return;
    }
    const section = sections.find(s => s.title === sectionTitle);
    if (!section || itemIndex >= section.data.length - 1) return;

    const newData = [...section.data];
    const temp = newData[itemIndex];
    newData[itemIndex] = newData[itemIndex + 1];
    newData[itemIndex + 1] = temp;

    handleDragEnd(newData, sectionTitle, mode);
  };

  const onRefresh = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      if (!course) return;
      if (!course.isDownloaded) {
        showAlert(
          t('course_units.alert.download_required_title'),
          t('course_units.alert.download_required_msg'),
        );
        return;
      }

      const allMetadata = await Promise.all(
        course.units.map(u => localServer.getH5pMetadata(u.contentId!)),
      );
      setMetadata(allMetadata);
    } catch (e) {
      console.error('Refresh error', e);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [course, localServer, t]);

  const renderWebItem = (
    item: Unit,
    index: number,
    sectionTitle: string,
    sectionLength: number,
    mode: SortMode,
  ) => {
    const matchingMeta =
      typeof item.contentId === 'number'
        ? metadataByContentId.get(item.contentId)
        : undefined;

    const unitKey = String(item.contentId ?? item.contentHash);

    return (
      <UnitEditingRow
        metaData={matchingMeta}
        title={item.name}
        onPressUnit={() => onPressUnit(item)}
        onPressOptions={() => toggleSelection(unitKey)}
        onDrag={undefined}
        disabled={loading}
        isSelected={selectedUnitIds.has(unitKey)}
        isTeacher={isTeacher}
        onMoveUp={
          mode === 'manual'
            ? () => handleMoveUp(sectionTitle, index, mode)
            : undefined
        }
        onMoveDown={
          mode === 'manual'
            ? () => handleMoveDown(sectionTitle, index, mode)
            : undefined
        }
        isFirst={index === 0}
        isLast={index === sectionLength - 1}
        disableReorder={mode !== 'manual'}
      />
    );
  };

  return (
    <View style={styles.container}>
      {!course?.isDownloaded && (
        <View style={styles.downloadCard}>
          <Text style={styles.downloadTitle}>
            {t('course_units.download.title')}
          </Text>
          <Text style={styles.downloadText}>
            {t('course_units.download.body')}
          </Text>
          <TouchableOpacity
            style={[
              styles.downloadButton,
              loading && styles.downloadButtonDisabled,
            ]}
            onPress={handleDownloadCourse}
            disabled={loading}
          >
            <Feather name="download" size={16} color={Theme.ON_PRIMARY_COLOR} />
            <Text style={styles.downloadButtonText}>
              {t('course_units.button.download')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {loading && (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={[styles.titleRow, { textAlign: 'center' }]}>
            {t('course_units.loading')}
          </Text>
          <ActivityIndicator
            size="large"
            color={Theme.PRIMARY_COLOR}
            style={{ marginTop: 8 }}
          />
        </View>
      )}
      {sections.length > 0 && (
        <View style={styles.toolbar}>
          <View style={styles.toolbarLeft}>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={toggleGroupSortMode}
            >
              <Text style={styles.sortText}>
                {t('course_units.sort_groups.label')}:{' '}
                {t(`course_units.sort_groups.${groupSortMode}`)}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.toolbarRight}>
            <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
              <Feather name="refresh-cw" size={14} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {isWeb ? (
        <ScrollView
          style={styles.webSectionsScroll}
          contentContainerStyle={styles.webSectionsContent}
          nestedScrollEnabled
        >
          {sections.map((section, index) => (
            <ListItem.Accordion
              key={section.title}
              content={
                <ListItem.Content style={styles.contentContainer}>
                  <View style={styles.numberCircle}>
                    <Text style={styles.numberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.titleTextGroup}>
                    <View style={styles.titleRow}>
                      <ListItem.Title style={styles.titleStyle}>
                        {section.title}
                      </ListItem.Title>
                      <View style={styles.headerActions}>
                        <TouchableOpacity
                          style={styles.sortButton}
                          onPress={() => toggleUnitSortMode(section.title)}
                        >
                          <Text style={styles.sortText}>
                            {t('course_units.sort.label')}:{' '}
                            {t(
                              `course_units.sort.${getUnitSortMode(section.title)}`,
                            )}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.subtitleStyle}>
                      {`${section.data.length} items`}
                    </Text>
                  </View>
                </ListItem.Content>
              }
              isExpanded={expandedId === section.title}
              onPress={() => {
                setExpandedId(
                  expandedId === section.title ? null : section.title,
                );
              }}
              containerStyle={styles.accordionHeader}
            >
              {expandedId === section.title &&
                section.data.map((item, idx) => (
                  <View key={String(item.contentId ?? item.contentHash)}>
                    {renderWebItem(
                      item,
                      idx,
                      section.title,
                      section.data.length,
                      getUnitSortMode(section.title),
                    )}
                  </View>
                ))}
            </ListItem.Accordion>
          ))}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, marginBottom: 150 }}>
          {sections.map((section, index) => (
            <ListItem.Accordion
              key={section.title}
              content={
                <ListItem.Content style={styles.contentContainer}>
                  <View style={styles.numberCircle}>
                    <Text style={styles.numberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.titleTextGroup}>
                    <View style={styles.titleRow}>
                      <ListItem.Title style={styles.titleStyle}>
                        {section.title}
                      </ListItem.Title>
                      <View style={styles.headerActions}>
                        <TouchableOpacity
                          style={styles.sortButton}
                          onPress={() => toggleUnitSortMode(section.title)}
                        >
                          <Text style={styles.sortText}>
                            {t('course_units.sort.label')}:{' '}
                            {t(
                              `course_units.sort.${getUnitSortMode(section.title)}`,
                            )}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.subtitleStyle}>
                      {`${section.data.length} items`}
                    </Text>
                  </View>
                </ListItem.Content>
              }
              isExpanded={expandedId === section.title}
              onPress={() => {
                setExpandedId(
                  expandedId === section.title ? null : section.title,
                );
              }}
              containerStyle={styles.accordionHeader}
            >
              {expandedId === section.title && (
                <DraggableFlatList
                  data={section.data}
                  renderItem={renderItemForSection(section.title)}
                  keyExtractor={item =>
                    String(item.contentId ?? item.contentHash)
                  }
                  onDragEnd={({ data }) =>
                    handleDragEnd(
                      data,
                      section.title,
                      getUnitSortMode(section.title),
                    )
                  }
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              )}
            </ListItem.Accordion>
          ))}
        </View>
      )}
    </View>
  );
});
export default UnitsTabs;
