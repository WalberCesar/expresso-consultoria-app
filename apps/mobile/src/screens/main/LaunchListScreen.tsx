import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { withObservables } from '@nozbe/watermelondb/react';
import { database } from '../../db';
import { Registro } from '../../db/models/';
import { syncDatabase } from '../../services/sync.service';
import { useAuth } from '../../contexts/AuthContext';
import CardLaunch from '../../components/CardLaunch';
import Modal from '../../components/Modal';

interface LaunchListScreenProps {
  registros: Registro[];
}

function LaunchListScreen({ registros }: LaunchListScreenProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const handleRefresh = async () => {
    if (!isOnline) {
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

    setIsRefreshing(true);

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
      setIsRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <FlatList
        data={registros}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CardLaunch item={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
            colors={['#007AFF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Nenhum lançamento encontrado</Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        icon={modalConfig.icon}
        iconColor={modalConfig.iconColor}
      />
    </View>
  );
}

const enhance = withObservables([], () => ({
  registros: database
    .get<Registro>('registros')
    .query()
    .observeWithColumns(['descricao', 'tipo', 'data_hora', 'sincronizado']),
}));

export default enhance(LaunchListScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});
