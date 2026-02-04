import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MockRegistro {
  id: string;
  tipo: string;
  descricao: string;
  data_hora: Date;
  _status: 'synced' | 'created' | 'updated';
}

const MOCK_DATA: MockRegistro[] = [
  {
    id: '1',
    tipo: 'entrada',
    descricao: 'Chegada ao local',
    data_hora: new Date('2025-01-15T08:30:00'),
    _status: 'synced',
  },
  {
    id: '2',
    tipo: 'saida',
    descricao: 'Saída para almoço',
    data_hora: new Date('2025-01-15T12:00:00'),
    _status: 'created',
  },
  {
    id: '3',
    tipo: 'entrada',
    descricao: 'Retorno do almoço',
    data_hora: new Date('2025-01-15T13:30:00'),
    _status: 'synced',
  },
];

interface ListItemProps {
  item: MockRegistro;
}

function ListItem({ item }: ListItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced':
        return '#4CAF50';
      case 'created':
        return '#FFC107';
      case 'updated':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return 'checkmark-circle';
      case 'created':
        return 'time';
      case 'updated':
        return 'sync';
      default:
        return 'help-circle';
    }
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
    <TouchableOpacity style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <View style={styles.itemTypeContainer}>
          <Text style={styles.itemType}>{item.tipo.toUpperCase()}</Text>
        </View>
        <Ionicons
          name={getStatusIcon(item._status)}
          size={20}
          color={getStatusColor(item._status)}
        />
      </View>
      
      <Text style={styles.itemDescription}>{item.descricao}</Text>
      
      <View style={styles.itemFooter}>
        <Text style={styles.itemDate}>{formatDate(item.data_hora)}</Text>
        <Text style={styles.itemTime}>{formatTime(item.data_hora)}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function LaunchListScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <FlatList
        data={MOCK_DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListItem item={item} />}
        contentContainerStyle={styles.listContent}
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
