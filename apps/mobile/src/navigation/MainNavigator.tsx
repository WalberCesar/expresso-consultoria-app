import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import LaunchListScreen from '../screens/main/LaunchListScreen';
import CreateLaunchScreen from '../screens/main/CreateLaunchScreen';
import EditLaunchScreen from '../screens/main/EditLaunchScreen';
import { MainTabParamList, MainStackParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

function MainTabs() {
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

export default function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditLaunch"
        component={EditLaunchScreen}
        options={{
          headerTitle: 'Editar Lançamento',
          headerBackTitle: 'Voltar',
        }}
      />
    </Stack.Navigator>
  );
}
