import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#15803d',
        tabBarInactiveTintColor: '#64748b',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#0f172a',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore Jobs',
          tabBarLabel: 'Jobs',
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'My Applications',
          tabBarLabel: 'Applied',
        }}
      />
      <Tabs.Screen
        name="ats"
        options={{
          title: 'ATS Resume Review',
          tabBarLabel: 'ATS Check',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Teacher Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </Tabs>
  );
}
