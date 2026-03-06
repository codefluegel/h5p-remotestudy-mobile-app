import { Tabs } from 'expo-router';
import React from 'react';
import { OpaqueColorValue, StyleSheet } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Theme from '../../constants/Theme';

export default function TabLayout() {
  const { t } = useTranslation();

  const renderLeftTabBarIcon = (color: string | OpaqueColorValue) => {
    return <Ionicons size={24} name="document-text-outline" color={color} />;
  };

  const renderRightCenterTabBarIcon = (color: string | OpaqueColorValue) => {
    return <Ionicons name="checkmark-done" size={24} color={color} />;
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
          fontWeight: '500',
        },
        tabBarIconStyle: {},
        tabBarActiveTintColor: Theme.PRIMARY_COLOR,
        tabBarInactiveTintColor: '#888888',
      }}
    >
      <Tabs.Screen
        name="course"
        options={{
          title: t('student.tab.courses'),
          headerTitle: t('student.header.courses'),
          headerShown: false,
          tabBarIcon: ({ color }) => renderLeftTabBarIcon(color),
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: t('student.tab.results'),
          headerTitle: t('student.header.results'),
          headerShown: false,
          tabBarIcon: ({ color }) => renderRightCenterTabBarIcon(color),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('student.tab.profile'),
          headerTitle: t('student.header.profile'),
          headerShown: false,
          tabBarIcon: ({ color }) => renderRightTabBarIcon(color),
        }}
      />
    </Tabs>
  );
}
