import { Stack } from 'expo-router';
import { observer } from 'mobx-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

const CourseLayout = observer(() => {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: t('layout.teacher.course.header_all'),
          title: t('layout.teacher.course.header_all'),
          headerBackTitle: t('header.back'),
        }}
      />
      <Stack.Screen
        name="CourseUnitsScreen"
        options={{
          headerShown: true,
          headerBackTitle: t('header.back'),
        }}
      />
      <Stack.Screen
        name="CourseUnitWebViewScreen"
        options={{
          headerShown: true,
          headerBackTitle: t('header.back'),
        }}
      />
      <Stack.Screen
        name="CourseStatisticsScreen"
        options={{
          headerShown: true,
          headerBackTitle: t('header.back'),
        }}
      />
      <Stack.Screen
        name="GroupSelectionModal"
        options={{
          headerShown: true,
        }}
      />
    </Stack>
  );
});

export default CourseLayout;
