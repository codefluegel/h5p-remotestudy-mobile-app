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
          headerTitle: t('layout.student.results.header'),
          title: t('layout.student.results.header'),
        }}
      />
      <Stack.Screen
        name="CourseUnitsScreen"
        options={{
          headerShown: true,
          headerTitle: 'Course',
          title: 'Course',
        }}
      />
      <Stack.Screen
        name="CourseUnitWebViewScreen"
        options={{ headerShown: true, headerTitle: 'Unit', title: 'Unit' }}
      />
    </Stack>
  );
});

export default CourseLayout;
