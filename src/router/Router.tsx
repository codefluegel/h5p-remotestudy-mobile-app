import React from 'react';

import { Stack } from 'expo-router';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';

const Router = observer(() => {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ChooseRoleScreen"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="LoginScreen" options={{ headerShown: false }} />
      <Stack.Screen
        name="ResetPasswordScreen"
        options={{
          headerBackButtonDisplayMode: 'minimal',
          headerTitle: t('reset_password.title.main'),
        }}
      />
      <Stack.Screen name="(students)" options={{ headerShown: false }} />
      <Stack.Screen name="(teacher)" options={{ headerShown: false }} />
      <Stack.Screen
        name="(statisticsModals)"
        options={{ headerShown: false, presentation: 'modal' }}
      />
    </Stack>
  );
});

export default Router;
