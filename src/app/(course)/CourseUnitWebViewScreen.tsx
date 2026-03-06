import { Feather } from '@expo/vector-icons';
import * as Network from 'expo-network';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { observer } from 'mobx-react';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppState,
  AppStateStatus,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import H5PContentWebview, {
  H5PContentWebviewForwardRef,
} from '../../components/H5PContentWebview';
import { useLocalH5pServer } from '../../localH5pServer/context';
import { saveUnitResult } from '../../services/service';
import { useStore } from '../../store/context';
import { Unit, XAPIStatement } from '../../utils/types';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 5,
  },
  webView: {
    flex: 1,
    padding: 5,
  },
});

type CourseUnitWebViewScreenParams = {
  contentId: string;
  courseId: string;
};

const CourseUnitWebViewScreen = observer(() => {
  const { t } = useTranslation();
  const { contentId, courseId } =
    useLocalSearchParams<CourseUnitWebViewScreenParams>();
  const localServer = useLocalH5pServer();
  const [contentUrl, setContentUrl] = useState<string | null>(null);
  const navigation = useNavigation();
  const h5pWebviewRef = useRef<H5PContentWebviewForwardRef>(null);
  const resultsRef = useRef<Record<string, { raw: number; max: number }>[]>([]);
  const [currentUnit, setCurrentUnit] = useState<Unit | null>();

  const { courseStore, appStateStore } = useStore();
  const course = courseStore.getCourse(courseId);
  const appState = useRef(AppState.currentState);
  const [webViewError, setWebViewError] = useState<string | null>(null);
  const [networkState, setNetworkState] = useState<Network.NetworkState | null>(
    null,
  );

  const isTeacher = appStateStore.isTeacher();

  useEffect(() => {
    async function loadContentUrl() {
      if (contentId && localServer) {
        const url = await localServer.getH5pViewUrl(Number(contentId));
        setContentUrl(url);
      }
    }

    const foundUnit = course?.units.find(
      unit => Number(unit.contentId) === Number(contentId),
    );
    setCurrentUnit(foundUnit);

    loadContentUrl();
  }, [contentId, course?.downloadLink, course?.units, localServer]);

  useEffect(() => {
    let subscription: { remove?: () => void } | undefined;
    (async () => {
      try {
        const initial = await Network.getNetworkStateAsync();
        setNetworkState(initial);
        subscription = Network.addNetworkStateListener(state => {
          setNetworkState(state);
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Network listener error', err);
      }
    })();

    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, []);

  const storeApiData = useCallback(
    (xApiData: XAPIStatement) => {
      const getScoresForFirstLevelActivities = (xapiData: XAPIStatement) => {
        const scores: Record<string, { raw: number; max: number }> = {};

        if (xapiData && xapiData.children && Array.isArray(xapiData.children)) {
          xapiData.children.forEach(childActivity => {
            if (
              childActivity.statement &&
              childActivity.statement.object &&
              childActivity.statement.object.definition &&
              childActivity.statement.result &&
              childActivity.statement.result.score &&
              typeof childActivity.statement.result.score.max === 'number' &&
              typeof childActivity.statement.result.score.raw === 'number'
            ) {
              const activityName = childActivity.statement.object.definition
                ?.name?.['en-US']
                ? childActivity.statement.object.definition?.name?.['en-US']
                : childActivity.statement.object.definition?.description?.[
                    'en-US'
                  ];
              const maxScore = childActivity.statement.result.score.max;
              const rawScore = childActivity.statement.result.score.raw;

              scores[activityName] = {
                raw: rawScore,
                max: maxScore,
              };
            }
          });
        } else if (xapiData.statement) {
          const activityName =
            xapiData?.statement?.object?.definition?.name?.['en-US'] ??
            'Undefined';
          const maxScore = xapiData?.statement?.result?.score?.max ?? 0;
          const rawScore = xapiData?.statement?.result?.score?.raw ?? 0;

          scores[activityName] = {
            raw: rawScore,
            max: maxScore,
          };
        }
        return scores;
      };
      const firstLevelScores = getScoresForFirstLevelActivities(xApiData);

      if (
        !isTeacher &&
        firstLevelScores &&
        Object.keys(firstLevelScores).length > 0
      ) {
        resultsRef.current.push(firstLevelScores);
      }
    },
    [isTeacher],
  );

  const saveUnit = useCallback(async () => {
    h5pWebviewRef.current?.triggerXapiDataFetch();

    await new Promise(resolve => {
      setTimeout(resolve, 300);
    });

    try {
      if (course && currentUnit && resultsRef.current.length > 0) {
        const filteredResults = resultsRef.current.filter(
          obj => Object.keys(obj).length > 0,
        );

        if (!networkState?.isConnected) {
          courseStore.unsyncedResults.push({
            courseId,
            userId: appStateStore.user?.userId ?? '',
            contentHash: currentUnit.contentHash,
            results: filteredResults,
          });
          Toast.show({
            type: 'info',
            text1: 'Offline',
            text2: 'Results saved locally and will be uploaded later.',
          });
        } else {
          await saveUnitResult(
            courseId,
            appStateStore.user?.userId ?? '',
            currentUnit.contentHash,
            filteredResults,
          );
          Toast.show({
            type: 'success',
            text1: 'Results Uploaded',
            text2: 'Your points have been saved successfully.',
          });
        }
        resultsRef.current = [];
        courseStore.updateCourseById(courseId, course);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }, [
    appStateStore.user?.userId,
    course,
    courseId,
    courseStore,
    currentUnit,
    networkState?.isConnected,
  ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: currentUnit?.name ?? '',
      headerRight: () => (
        <TouchableOpacity onPress={saveUnit}>
          <Feather
            name="upload"
            size={24}
            color="black"
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, currentUnit, saveUnit]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      e.preventDefault();
      (async () => {
        if (currentUnit?.results) await saveUnit();
        navigation.dispatch(e.data.action);
      })();
    });

    return unsubscribe;
  }, [currentUnit?.results, navigation, saveUnit]);

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        saveUnit();
      }
      appState.current = nextAppState;
    },
    [saveUnit],
  );

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [handleAppStateChange]);

  if (!contentId) {
    return (
      <View style={styles.container}>
        <Text>{t('course_unit.error.no_id')}</Text>
      </View>
    );
  }

  if (!contentUrl) {
    return (
      <View style={styles.container}>
        <Text>{t('course_unit.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {webViewError ? (
        <Text>{webViewError}</Text>
      ) : (
        <H5PContentWebview
          ref={h5pWebviewRef}
          style={styles.webView}
          xapiDataCallback={storeApiData}
          contentId={contentId}
          contentUrl={contentUrl}
          key={contentUrl}
          onError={() => {
            setWebViewError('This file cannot be displayed.');
          }}
        />
      )}
    </View>
  );
});

export default CourseUnitWebViewScreen;
