import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { withObservables } from '@nozbe/watermelondb/react';
import { database } from '../../db';
import { Registro } from '../../db/models/';
import { syncDatabase } from '../../services/sync.service';
import { useAuth } from '../../contexts/AuthContext';
import { MainStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface ListItemProps {
  item: Registro;
}

function ListItem({ item }: ListItemProps) {
  const navigation = useNavigation<NavigationProp>();
  const getStatusColor = () => {
    return item.sincronizado ? '#4CAF50' : '#FFC107';
  };

  const getStatusIcon = () => {
    return item.sincronizado ? 'checkmark-circle' : 'time';
  };

  const getStatusText = () => {
    return item.sincronizado ? 'Sincronizado' : 'Pendente';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={() => navigation.navigate('EditLaunch', { registroId: item.id })}
    >
      <View style={styles.itemHeader}>
        <View style={styles.itemTypeContainer}>
          <Text style={styles.itemType}>{item.tipo.toUpperCase()}</Text>
        </View>
        <View style={styles.statusContainer}>
          <Ionicons
            name={getStatusIcon()}
            size={16}
            color={getStatusColor()}
          />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </View>
      
      <Text style={styles.itemDescription}>{item.descricao}</Text>
      
      <View style={styles.itemFooter}>
        <Text style={styles.itemDate}>{formatDate(item.dataHora)}</Text>
        <Text style={styles.itemTime}>{formatTime(item.dataHora)}</Text>
      </View>
    </TouchableOpacity>
  );
}

interface LaunchListScreenProps {
  registros: Registro[];
}

function LaunchListScreen({ registros }: LaunchListScreenProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();

  const handleRefresh = async () => {
    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    setIsRefreshing(true);

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
      setIsRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <FlatList
        data={registros}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListItem item={item} />}
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
    </View>
  );
}

const enhance = withObservables([], () => ({
  registros: database.get<Registro>('registros').query().observe(),
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
  itemContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTypeContainer: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  itemType: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  itemDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDate: {
    fontSize: 14,
    color: '#666',
  },
  itemTime: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
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
