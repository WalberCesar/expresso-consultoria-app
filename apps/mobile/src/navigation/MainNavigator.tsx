import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import LaunchListScreen from '../screens/main/LaunchListScreen';
import CreateLaunchScreen from '../screens/main/CreateLaunchScreen';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'LaunchList') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'CreateLaunch') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else {
            iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen
        name="LaunchList"
        component={LaunchListScreen}
        options={{
          tabBarLabel: 'Lançamentos',
          headerTitle: 'Meus Lançamentos',
        }}
      />
      <Tab.Screen
        name="CreateLaunch"
        component={CreateLaunchScreen}
        options={{
          tabBarLabel: 'Novo',
          headerTitle: 'Novo Lançamento',
        }}
      />
    </Tab.Navigator>
  );
}
