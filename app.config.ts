import 'dotenv/config';

const version = process.env.APP_VERSION || '1.0.0';

const [major, minor, patch] = version.split('.');
const FACTOR = 100;
const versionCode =
  Number(major) * FACTOR * FACTOR + Number(minor) * FACTOR + Number(patch);

const { ANDROID_PACKAGE, IOS_BUNDLE_ID, SLUG_SUFFIX, EXPO_OWNER } = process.env;

const iosBundleId = IOS_BUNDLE_ID || 'com.codefluegel.h5p-remote-study';
const androidPackage = ANDROID_PACKAGE || 'com.codefluegel.h5p.remote_study';
const owner = EXPO_OWNER || 'codefluegelgmbh';

export default {
  name: 'RemoteStudy',
  slug: `remote-study${SLUG_SUFFIX || ''}`,
  owner,
  version,
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'remote-study',
  plugins: process.env.DISABLE_EXPO_PLUGINS
    ? []
    : [
        [
          'expo-build-properties',
          {
            android: {
              usesCleartextTraffic: true,
              buildArchs: ['armeabi-v7a', 'arm64-v8a', 'x86_64'],
            },
          },
        ],
        'expo-router',
        [
          'expo-splash-screen',
          {
            image: './assets/images/icon.png',
            resizeMode: 'cover',
            backgroundColor: '#ffffff',
          },
        ],
        ['./project.plugin.js', {}],
        [
          'expo-font',
          {
            fonts: [
              './assets/fonts/Roboto-Regular.ttf',
              './assets/fonts/Roboto-Bold.ttf',
              './assets/fonts/Roboto-Medium.ttf',
            ],
          },
        ],
      ],
  ios: {
    supportsTablet: true,
    buildNumber: `${versionCode}`,
    bundleIdentifier: iosBundleId,
  },
  android: {
    package: androidPackage,
    versionCode,
    icon: './assets/images/icon.png',
    adaptiveIcon: {
      foregroundImage: './assets/images/icon.png',
      backgroundColor: '#ffffff',
    },
    splash: {
      image: './assets/images/icon.png',
      resizeMode: 'cover',
      backgroundColor: '#ffffff',
    },
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  experiments: {
    typedRoutes: true,
  },
  linking: {
    enabled: 'auto',
    prefixes: [
      'remote-study://',
      'https://remote-study.app',
      'https://*.remote-study.app',
    ],
    config: {
      screens: {
        index: '',
        ChooseRoleScreen: 'role',
        LoginScreen: 'login',
        ResetPasswordScreen: 'reset-password',
        '(students)': {
          screens: {
            course: 'students/course',
            'course/[id]': 'students/course/:id',
            profile: 'students/profile',
            results: 'students/results',
            'results/[id]': 'students/results/:id',
          },
        },
        '(teacher)': {
          screens: {
            course: 'teacher/course',
            'course/[id]': 'teacher/course/:id',
            profile: 'teacher/profile',
            setup: 'teacher/setup',
          },
        },
        '(modals)': {
          screens: {
            SubmenuOverlay: 'modals/submenu',
          },
        },
        '(statisticsModals)': {
          screens: {
            CourseStatisticsScreen: 'stats/course/:courseId',
          },
        },
      },
    },
  },
};
