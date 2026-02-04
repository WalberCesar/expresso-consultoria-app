import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DatePicker from 'react-native-date-picker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { launchFormSchema, LaunchFormData } from '../../schemas/launchFormSchema';

type LaunchType = 'entrada' | 'saida';

export default function CreateLaunchScreen() {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LaunchFormData>({
    resolver: zodResolver(launchFormSchema),
    defaultValues: {
      tipo: 'entrada',
      descricao: '',
      dataHora: new Date(),
    },
  });

  const onSubmit = (data: LaunchFormData) => {
    console.log('Form data:', data);
    // TODO: Save to WatermelonDB
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar barStyle="dark-content" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Novo Lançamento</Text>
          <Text style={styles.subtitle}>Preencha os dados do registro</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Tipo Selector */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Tipo</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  tipo === 'entrada' && styles.typeButtonActive,
                ]}
                onPress={() => setTipo('entrada')}
              >
                <Ionicons
                  name="arrow-down-circle"
                  size={24}
                  color={tipo === 'entrada' ? '#FFF' : '#007AFF'}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    tipo === 'entrada' && styles.typeButtonTextActive,
                  ]}
                >
                  Entrada
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  tipo === 'saida' && styles.typeButtonActive,
                ]}
                onPress={() => setTipo('saida')}
              >
                <Ionicons
                  name="arrow-up-circle"
                  size={24}
                  color={tipo === 'saida' ? '#FFF' : '#007AFF'}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    tipo === 'saida' && styles.typeButtonTextActive,
                  ]}
                >
                  Saída
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Descrição Input */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Digite a descrição do lançamento"
              placeholderTextColor="#999"
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Data e Hora Picker */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Data e Hora</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={24} color="#007AFF" />
              <Text style={styles.dateButtonText}>{formatDateTime(dataHora)}</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Photo Buttons */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Fotos</Text>
            <View style={styles.photoButtonsContainer}>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={() => console.log('Tirar foto')}
              >
                <Ionicons name="camera" size={24} color="#007AFF" />
                <Text style={styles.photoButtonText}>Tirar Foto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.photoButton}
                onPress={() => console.log('Escolher da galeria')}
              >
                <Ionicons name="images" size={24} color="#007AFF" />
                <Text style={styles.photoButtonText}>Galeria</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <DatePicker
        modal
        open={showDatePicker}
        date={dataHora}
        mode="datetime"
        locale="pt-BR"
        title="Selecione a data e hora"
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={(date) => {
          setShowDatePicker(false);
          setDataHora(date);
        }}
        onCancel={() => {
          setShowDatePicker(false);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
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
  formContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#FFF',
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  typeButtonTextActive: {
    color: '#FFF',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F9F9F9',
    minHeight: 100,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  photoButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: '#FFF',
  },
  photoButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
  },
});
