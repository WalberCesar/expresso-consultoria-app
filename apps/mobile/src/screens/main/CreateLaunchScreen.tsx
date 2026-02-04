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
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DatePicker from 'react-native-date-picker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { launchFormSchema, LaunchFormData } from '../../schemas/launchFormSchema';
import { database } from '../../db';
import Registro from '../../db/models/Registro';
import FotoRegistro from '../../db/models/FotoRegistro';
import { useAuth } from '../../contexts/AuthContext';

type LaunchType = 'entrada' | 'saida';

export default function CreateLaunchScreen() {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDataHora, setTempDataHora] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const { user } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LaunchFormData>({
    resolver: zodResolver(launchFormSchema),
    defaultValues: {
      tipo: 'entrada',
      descricao: '',
      dataHora: new Date(),
    },
  });

  const onSubmit = async (data: LaunchFormData) => {
    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    setIsSubmitting(true);

    try {
      await database.write(async () => {
        const registro = await database.get<Registro>('registros').create((r) => {
          r.empresaId = user.empresaId;
          r.usuarioId = user.id;
          r.tipo = data.tipo;
          r.dataHora = data.dataHora;
          r.descricao = data.descricao;
          r.sincronizado = false;
        });

        // Salvar as fotos associadas ao registro
        if (photoUris.length > 0) {
          const fotoRegistrosCollection = database.get<FotoRegistro>('foto_registros');
          
          for (const photoUri of photoUris) {
            await fotoRegistrosCollection.create((foto) => {
              foto.registroId = registro.id;
              foto.pathUrl = photoUri;
            });
          }
        }
      });

      Alert.alert('Sucesso', 'Lançamento criado com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            reset();
            setPhotoUris([]);
          },
        },
      ]);
    } catch (error) {
      console.error('Erro ao salvar registro:', error);
      Alert.alert('Erro', 'Não foi possível salvar o lançamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para tirar fotos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUris((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para selecionar fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uris = result.assets.map((asset) => asset.uri);
      setPhotoUris((prev) => [...prev, ...uris]);
    }
  };

  const handleRemovePhoto = (uri: string) => {
    setPhotoUris((prev) => prev.filter((item) => item !== uri));
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
          <Controller
            control={control}
            name="tipo"
            render={({ field: { onChange, value } }) => (
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Tipo</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      value === 'entrada' && styles.typeButtonActive,
                    ]}
                    onPress={() => onChange('entrada')}
                  >
                    <Ionicons
                      name="arrow-down-circle"
                      size={24}
                      color={value === 'entrada' ? '#FFF' : '#007AFF'}
                    />
                    <Text
                      style={[
                        styles.typeButtonText,
                        value === 'entrada' && styles.typeButtonTextActive,
                      ]}
                    >
                      Entrada
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      value === 'saida' && styles.typeButtonActive,
                    ]}
                    onPress={() => onChange('saida')}
                  >
                    <Ionicons
                      name="arrow-up-circle"
                      size={24}
                      color={value === 'saida' ? '#FFF' : '#007AFF'}
                    />
                    <Text
                      style={[
                        styles.typeButtonText,
                        value === 'saida' && styles.typeButtonTextActive,
                      ]}
                    >
                      Saída
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.tipo && (
                  <Text style={styles.errorText}>{errors.tipo.message}</Text>
                )}
              </View>
            )}
          />

          {/* Descrição Input */}
          <Controller
            control={control}
            name="descricao"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Descrição</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    errors.descricao && styles.textInputError,
                  ]}
                  placeholder="Digite a descrição do lançamento"
                  placeholderTextColor="#999"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                {errors.descricao && (
                  <Text style={styles.errorText}>{errors.descricao.message}</Text>
                )}
              </View>
            )}
          />

          {/* Data e Hora Picker */}
          <Controller
            control={control}
            name="dataHora"
            render={({ field: { onChange, value } }) => (
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Data e Hora</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => {
                    setTempDataHora(value);
                    setShowDatePicker(true);
                  }}
                >
                  <Ionicons name="calendar-outline" size={24} color="#007AFF" />
                  <Text style={styles.dateButtonText}>{formatDateTime(value)}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
                {errors.dataHora && (
                  <Text style={styles.errorText}>{errors.dataHora.message}</Text>
                )}
                <DatePicker
                
                  modal
                  open={showDatePicker}
                  date={tempDataHora}
                  mode="datetime"
                  locale="pt-BR"
                  title="Selecione a data e hora"
                  confirmText="Confirmar"
                  cancelText="Cancelar"
                  onConfirm={(date) => {
                    setShowDatePicker(false);
                    onChange(date);
                  }}
                  onCancel={() => {
                    setShowDatePicker(false);
                  }}
                />
              </View>
            )}
          />

          {/* Photo Buttons */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Fotos</Text>
            <View style={styles.photoButtonsContainer}>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={handleTakePhoto}
              >
                <Ionicons name="camera" size={24} color="#007AFF" />
                <Text style={styles.photoButtonText}>Tirar Foto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.photoButton}
                onPress={handlePickImage}
              >
                <Ionicons name="images" size={24} color="#007AFF" />
                <Text style={styles.photoButtonText}>Galeria</Text>
              </TouchableOpacity>
            </View>

            {/* Photo Preview */}
            {photoUris.length > 0 && (
              <View style={styles.photoPreviewContainer}>
                {photoUris.map((uri, index) => (
                  <View key={uri} style={styles.photoPreviewWrapper}>
                    <Image source={{ uri }} style={styles.photoPreview} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => handleRemovePhoto(uri)}
                    >
                      <Ionicons name="close-circle" size={24} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Salvando...' : 'Salvar Lançamento'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
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
  textInputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 8,
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
  photoPreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  photoPreviewWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#B0C4DE',
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
