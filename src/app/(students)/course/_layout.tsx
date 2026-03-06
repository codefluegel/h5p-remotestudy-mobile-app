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
          headerTitle: t('layout.student.course.header_all'),
          title: t('layout.student.course.header_all'),
        }}
      />
      <Stack.Screen
        name="CourseUnitsScreen"
        options={{
          headerShown: true,
          headerTitle: t('layout.student.course.header_course'),
          title: t('layout.student.course.header_course'),
        }}
      />
      <Stack.Screen
        name="CourseUnitWebViewScreen"
        options={{
          headerShown: true,
          headerTitle: t('layout.student.course.header_unit'),
        }}
      />
    </Stack>
  );
});

export default CourseLayout;
