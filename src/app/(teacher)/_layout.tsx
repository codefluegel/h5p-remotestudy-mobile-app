import { Tabs } from 'expo-router';
import React from 'react';
import { OpaqueColorValue, StyleSheet } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import Theme from '../../constants/Theme';
import { useStore } from '../../store/context';

export default function TabLayout() {
  const { appStateStore } = useStore();
  const { t } = useTranslation();

  const renderLeftTabBarIcon = (color: string | OpaqueColorValue) => {
    return <Ionicons size={24} name="document-text-outline" color={color} />;
  };

  const renderRightCenterTabBarIcon = (color: string | OpaqueColorValue) => {
    return <Ionicons name="add-circle-outline" size={24} color={color} />;
  };

  const renderRightTabBarIcon = (color: string | OpaqueColorValue) => {
    return <Ionicons name="person-outline" size={24} color={color} />;
  };

  return (
    <Tabs
      screenOptions={{
        headerTitleStyle: { fontSize: 24 },
        tabBarStyle: {
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: '#ccc',
          backgroundColor: '#fff',
          elevation: 5,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarIconStyle: {},
        tabBarActiveTintColor: Theme.PRIMARY_COLOR,
        tabBarInactiveTintColor: '#888888',
      }}
    >
      <Tabs.Screen
        name="course"
        options={{
          headerShown: false,
          title: t('teacher.tab.courses'),
          headerTitle: t('teacher.header.all_courses'),
          tabBarIcon: ({ color }) => renderLeftTabBarIcon(color),
        }}
      />
      <Tabs.Screen
        name="setup"
        options={{
          title:
            appStateStore.role === 'Teacher'
              ? t('teacher.tab.add_course')
              : t('student.tab.results'),
          headerTitle:
            appStateStore.role === 'Teacher'
              ? t('teacher.header.add_course')
              : t('teacher.header.join_course'),
          tabBarIcon: ({ color }) => renderRightCenterTabBarIcon(color),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          title: t('teacher.tab.profile'),
          tabBarIcon: ({ color }) => renderRightTabBarIcon(color),
        }}
      />
    </Tabs>
  );
}
