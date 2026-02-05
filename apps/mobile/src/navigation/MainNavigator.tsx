import React, { useState, useEffect } from 'react';
import { TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import LaunchListScreen from '../screens/main/LaunchListScreen';
import CreateLaunchScreen from '../screens/main/CreateLaunchScreen';
import EditLaunchScreen from '../screens/main/EditLaunchScreen';
import UserProfileScreen from '../screens/main/UserProfileScreen';
import Modal from '../components/Modal';
import { MainTabParamList, MainStackParamList } from './types';
import { syncDatabase } from '../services/sync.service';
import { database } from '../db';
import { useAuth } from '../contexts/AuthContext';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
    iconColor: '#10B981',
  });
  const { user } = useAuth();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  if (!isOnline) {
    return null;
  }

  const handleSync = async () => {
    const netState = await NetInfo.fetch();
    
    if (!netState.isConnected) {
      setModalConfig({
        title: 'Sem conexão',
        message: 'Verifique sua conexão com a internet',
        icon: 'cloud-offline',
        iconColor: '#EF4444',
      });
      setModalVisible(true);
      return;
    }

    if (!user) {
      setModalConfig({
        title: 'Erro',
        message: 'Usuário não autenticado',
        icon: 'alert-circle',
        iconColor: '#EF4444',
      });
      setModalVisible(true);
      return;
    }

    setIsSyncing(true);

    try {
      await syncDatabase({
        database,
        token: user.token,
      });
      setModalConfig({
        title: 'Sucesso',
        message: 'Dados sincronizados com sucesso!',
        icon: 'checkmark-circle',
        iconColor: '#10B981',
      });
      setModalVisible(true);
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      setModalConfig({
        title: 'Erro',
        message: 'Não foi possível sincronizar os dados',
        icon: 'alert-circle',
        iconColor: '#EF4444',
      });
      setModalVisible(true);
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
    <>
      <TouchableOpacity 
        onPress={handleSync}
        style={{ marginRight: 12 }}
      >
        <Ionicons name="sync-outline" size={24} color="#007AFF" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        icon={modalConfig.icon}
        iconColor={modalConfig.iconColor}
      />
    </>
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
          } else if (route.name === 'UserProfile') {
            iconName = focused ? 'person' : 'person-outline';
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
      <Tab.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          headerTitle: 'Meu Perfil',
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
