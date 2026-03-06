import { Stack } from 'expo-router';
import { observer } from 'mobx-react';
import React from 'react';

const ProfileLayout = observer(() => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: true, headerTitle: 'Profile' }}
      />
    </Stack>
  );
});

export default ProfileLayout;
