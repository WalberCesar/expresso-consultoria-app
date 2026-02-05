import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import FormEditLaunch from '../../components/FormEditLaunch';

type EditLaunchScreenRouteProp = RouteProp<
  { EditLaunch: { registroId: string } },
  'EditLaunch'
>;

export default function EditLaunchScreen() {
  const route = useRoute<EditLaunchScreenRouteProp>();
  const { registroId } = route.params;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Editar Lançamento</Text>
          <Text style={styles.subtitle}>Atualize os dados do registro</Text>
        </View>

        <FormEditLaunch registroId={registroId} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
