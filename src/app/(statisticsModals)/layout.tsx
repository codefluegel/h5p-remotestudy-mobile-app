import { Stack } from 'expo-router';
import { observer } from 'mobx-react';
import React from 'react';

const StatisticsModalLayout = observer(() => {
  return (
    <Stack>
      <Stack.Screen
        name="CourseStatisticsScreen"
        options={{
          headerBackTitle: 'Back',
          headerShown: true,
          headerTitle: 'Unit',
          title: 'Unit',
        }}
      />
    </Stack>
  );
});

export default StatisticsModalLayout;
