import { Stack } from 'expo-router';
import { observer } from 'mobx-react';
import React from 'react';

const SetupLayout = observer(() => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
});

export default SetupLayout;
