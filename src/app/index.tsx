/* eslint-disable no-nested-ternary */
import { Href, Redirect, router } from 'expo-router';
import { observer } from 'mobx-react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, {
  ICarouselInstance,
  Pagination,
} from 'react-native-reanimated-carousel';

import slider1 from '../../assets/images/Slider_1.png';
import slider2 from '../../assets/images/Slider_2.png';
import slider3 from '../../assets/images/Slider_3.png';
import Theme from '../constants/Theme';
import { useStore } from '../store/context';

const SPACING = 24;
const BUTTON_HEIGHT = 50;
const DOT_SIZE = 6;
const MAX_CONTENT_WIDTH = 900;

const staticStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

const webContainerStyle: ViewStyle =
  Platform.OS === 'web'
    ? ({
        minHeight: '100vh',
        minWidth: '100vw',
      } as unknown as ViewStyle)
    : {};

const roleScreenRoute = '/ChooseRoleScreen' as Href;

const IntroScreen = observer(() => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [currentPage, setCurrentPage] = useState(0);
  const { appStateStore } = useStore();
  const { t } = useTranslation();

  // Create data array dynamically based on translations
  const data = [
    {
      image: slider1,
      bigText: t('intro.slider.heading'),
      smallText: t('intro.slider.subheading'),
    },
    {
      image: slider2,
      bigText: t('intro.slider.heading2'),
      smallText: t('intro.slider.subheading2'),
    },
    {
      image: slider3,
      bigText: t('intro.slider.heading3'),
      smallText: t('intro.slider.subheading3'),
    },
  ];

  const totalPages = data.length;

  const ref = useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);

  const screenWidth =
    windowWidth > 0
      ? windowWidth
      : Platform.OS === 'web' && typeof window !== 'undefined'
        ? window.innerWidth
        : 375;
  const screenHeight =
    windowHeight > 0
      ? windowHeight
      : Platform.OS === 'web' && typeof window !== 'undefined'
        ? window.innerHeight
        : 667;

  const imageResizeMode = screenWidth > screenHeight ? 'contain' : 'cover';

  const goToNextPage = async () => {
    if (currentPage < totalPages - 1) {
      ref.current?.scrollTo({
        count: 1,
        animated: true,
      });
    } else {
      appStateStore.setIntroSeen(true);
      router.navigate(roleScreenRoute);
    }
  };

  if (appStateStore.user && appStateStore.role === 'Teacher')
    return <Redirect href="/(teacher)/setup" />;

  if (appStateStore.user && appStateStore.role === 'Student')
    return <Redirect href="/(students)/course" />;

  const shouldConstrain = screenWidth > MAX_CONTENT_WIDTH;
  const isSmallScreen = screenHeight < 600 && Platform.OS === 'web';

  const dynamicStyles = StyleSheet.create({
    page: {
      flex: 1,
      width: '100%',
    },
    imageContainer: {
      flex: isSmallScreen ? 0.45 : 0.65,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      minHeight: isSmallScreen ? 150 : undefined,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    contentAndControlsContainer: {
      flex: isSmallScreen ? 0.55 : 0.35,
      backgroundColor: 'white',
      borderTopLeftRadius: SPACING,
      borderTopRightRadius: SPACING,
      paddingHorizontal: SPACING,
      paddingBottom: SPACING * 2,
      paddingTop: isSmallScreen ? SPACING / 2 : SPACING,
      justifyContent: 'flex-start',
      alignSelf: shouldConstrain ? 'center' : 'auto',
    },
    textSection: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: isSmallScreen ? SPACING / 2 : 0,
    },
    buttonAndDotsContainer: {
      alignItems: 'center',
      marginTop: isSmallScreen ? SPACING / 4 : SPACING / 2,
    },
    buttonStyle: {
      alignItems: 'center',
      justifyContent: 'center',
      height: BUTTON_HEIGHT,
      borderRadius: 10,
      elevation: 3,
      backgroundColor: Theme.PRIMARY_COLOR,
      width: '100%',
      maxWidth: 400,
    },
    bigText: {
      fontSize: Math.min(screenWidth * 0.07, isSmallScreen ? 24 : 42),
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: isSmallScreen ? SPACING / 4 : SPACING / 2,
      paddingHorizontal: isSmallScreen ? SPACING / 2 : SPACING,
    },
    smallText: {
      textAlign: 'center',
      fontSize: Math.min(screenWidth * 0.04, isSmallScreen ? 12 : 18),
      lineHeight: Math.min(screenWidth * 0.06, isSmallScreen ? 18 : 28),
      paddingHorizontal: isSmallScreen ? SPACING / 2 : SPACING,
    },
    dotContainer: {
      marginBottom: isSmallScreen ? SPACING / 2 : SPACING,
      marginTop: isSmallScreen ? SPACING / 4 : SPACING,
    },
  });

  return (
    <View style={[staticStyles.container, webContainerStyle]}>
      <Carousel
        ref={ref}
        width={screenWidth}
        height={screenHeight}
        data={data}
        onProgressChange={(_, absoluteProgress) => {
          progress.value = absoluteProgress;
          setCurrentPage(Math.round(absoluteProgress));
        }}
        renderItem={({ item, index }) => (
          <View style={dynamicStyles.page} key={index.toString()}>
            <View style={dynamicStyles.imageContainer}>
              <Image
                style={dynamicStyles.image}
                source={item.image}
                resizeMode={imageResizeMode}
              />
            </View>

            <View style={dynamicStyles.contentAndControlsContainer}>
              {isSmallScreen ? (
                <ScrollView
                  contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'space-between',
                  }}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={dynamicStyles.textSection}>
                    <Text style={dynamicStyles.bigText}>{item.bigText}</Text>
                    <Text style={dynamicStyles.smallText}>
                      {item.smallText}
                    </Text>
                  </View>

                  <View style={dynamicStyles.buttonAndDotsContainer}>
                    <View style={dynamicStyles.dotContainer}>
                      <Pagination.Basic
                        progress={progress}
                        data={data}
                        dotStyle={{
                          backgroundColor: Theme.PRIMARY_COLOR,
                          borderRadius: 50,
                          width: SPACING + DOT_SIZE * 2,
                          height: DOT_SIZE,
                        }}
                        containerStyle={{ gap: SPACING / 2 }}
                        onPress={i =>
                          ref.current?.scrollTo({
                            count: i - progress.value,
                            animated: true,
                          })
                        }
                      />
                    </View>
                    <Pressable
                      style={dynamicStyles.buttonStyle}
                      onPress={goToNextPage}
                    >
                      <Text
                        style={{
                          color: 'white',
                          fontSize: 16,
                          fontWeight: '600',
                        }}
                      >
                        {currentPage === totalPages - 1
                          ? t('intro.button.start')
                          : t('intro.button.next')}
                      </Text>
                    </Pressable>
                  </View>
                </ScrollView>
              ) : (
                <>
                  <View style={dynamicStyles.textSection}>
                    <Text style={dynamicStyles.bigText}>{item.bigText}</Text>
                    <Text style={dynamicStyles.smallText}>
                      {item.smallText}
                    </Text>
                  </View>

                  <View style={dynamicStyles.buttonAndDotsContainer}>
                    <View style={dynamicStyles.dotContainer}>
                      <Pagination.Basic
                        progress={progress}
                        data={data}
                        dotStyle={{
                          backgroundColor: Theme.PRIMARY_COLOR,
                          borderRadius: 50,
                          width: SPACING + DOT_SIZE * 2,
                          height: DOT_SIZE,
                        }}
                        containerStyle={{ gap: SPACING / 2 }}
                        onPress={i =>
                          ref.current?.scrollTo({
                            count: i - progress.value,
                            animated: true,
                          })
                        }
                      />
                    </View>
                    <Pressable
                      style={dynamicStyles.buttonStyle}
                      onPress={goToNextPage}
                    >
                      <Text
                        style={{
                          color: 'white',
                          fontSize: 16,
                          fontWeight: '600',
                        }}
                      >
                        {currentPage === totalPages - 1
                          ? t('intro.button.start')
                          : t('intro.button.next')}
                      </Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
});

export default IntroScreen;
