import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import UserInitials from '../../components/UserInitials';
import Modal from '../../components/Modal';

export default function UserProfileScreen() {
  const { user, signOut } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = () => {
    setModalVisible(true);
  };

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <UserInitials name={user.nome} size={100} />
        <Text style={styles.userName}>{user.nome}</Text>
      </View>

      <View style={styles.spacer} />

      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={24} color="#FFF" />
        <Text style={styles.logoutButtonText}>Sair</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Sair"
        message="Deseja realmente sair da sua conta?"
        icon="log-out-outline"
        iconColor="#EF4444"
        buttons={[
          {
            text: 'Cancelar',
            onPress: () => {},
            variant: 'secondary',
          },
          {
            text: 'Sair',
            onPress: signOut,
            variant: 'danger',
          },
        ]}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
  },
  spacer: {
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
