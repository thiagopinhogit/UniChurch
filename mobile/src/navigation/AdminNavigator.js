import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { colors } from '../styles/theme';

import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminMembersScreen from '../screens/AdminMembersScreen';
import AdminGroupsScreen from '../screens/AdminGroupsScreen';
import AdminSettingsScreen from '../screens/AdminSettingsScreen';

const Tab = createBottomTabNavigator();

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Membros') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Grupos') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Configurações') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingTop: 5,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={AdminDashboardScreen}
      />
      <Tab.Screen 
        name="Membros" 
        component={AdminMembersScreen}
      />
      <Tab.Screen 
        name="Grupos" 
        component={AdminGroupsScreen}
      />
      <Tab.Screen 
        name="Configurações" 
        component={AdminSettingsScreen}
      />
    </Tab.Navigator>
  );
}

