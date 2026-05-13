import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../hooks/useAuth';

export default function RootLayout() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="event/new"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'New Entry',
            headerStyle: { backgroundColor: '#1B4332' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="event/[id]"
          options={{
            headerShown: true,
            title: '',
            headerStyle: { backgroundColor: '#1B4332' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="event/edit/[id]"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Edit Entry',
            headerStyle: { backgroundColor: '#1B4332' },
            headerTintColor: '#fff',
          }}
        />
      </Stack>
    </>
  );
}
