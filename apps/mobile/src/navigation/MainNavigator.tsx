import React, { useState } from 'react';
import { TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import LaunchListScreen from '../screens/main/LaunchListScreen';
import CreateLaunchScreen from '../screens/main/CreateLaunchScreen';
import EditLaunchScreen from '../screens/main/EditLaunchScreen';
import { MainTabParamList, MainStackParamList } from './types';
import { syncDatabase } from '../services/sync.service';
import { database } from '../db';
import { useAuth } from '../contexts/AuthContext';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const { user } = useAuth();

  const handleSync = async () => {
    const netState = await NetInfo.fetch();
    
    if (!netState.isConnected) {
      Alert.alert('Sem conexão', 'Verifique sua conexão com a internet');
      return;
    }

    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    setIsSyncing(true);

    try {
      await syncDatabase({
        database,
        token: user.token,
      });
      Alert.alert('Sucesso', 'Dados sincronizados com sucesso!');
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      Alert.alert('Erro', 'Não foi possível sincronizar os dados');
    } finally {
      setIsSyncing(false);
    }
  };

  if (isSyncing) {
    return (
      <ActivityIndicator 
        size="small" 
        color="#007AFF" 
        style={{ marginRight: 12 }} 
      />
    );
  }

  return (
    <TouchableOpacity 
      onPress={handleSync}
      style={{ marginRight: 12 }}
    >
      <Ionicons name="sync-outline" size={24} color="#007AFF" />
    </TouchableOpacity>
  );
}

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
          headerRight: () => <SyncButton />,
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
