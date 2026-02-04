import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function LaunchListScreen() {
  const { signOut, user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lançamentos</Text>
      <Text style={styles.subtitle}>Lista de registros</Text>
      
      {user && (
        <Text style={styles.userInfo}>
          Usuário: {user.nome} (Empresa: {user.empresaId})
        </Text>
      )}
      
      <TouchableOpacity style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  userInfo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
