import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Registro } from '../db/models/';
import { MainStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface CardLaunchProps {
  item: Registro;
}

export default function CardLaunch({ item }: CardLaunchProps) {
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

  const getTypeColor = () => {
    return item.tipo === 'entrada' ? '#10B981' : '#EF4444';
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
        <View style={[styles.itemTypeContainer, { backgroundColor: getTypeColor() }]}>
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

const styles = StyleSheet.create({
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
});
