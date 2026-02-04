import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DatePicker from 'react-native-date-picker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Q } from '@nozbe/watermelondb';
import { launchFormSchema, LaunchFormData } from '../../schemas/launchFormSchema';
import { database } from '../../db';
import Registro from '../../db/models/Registro';
import FotoRegistro from '../../db/models/FotoRegistro';
import { useAuth } from '../../contexts/AuthContext';

type LaunchType = 'entrada' | 'saida';

type EditLaunchScreenRouteProp = RouteProp<
  { EditLaunch: { registroId: string } },
  'EditLaunch'
>;

export default function EditLaunchScreen() {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDataHora, setTempDataHora] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [existingPhotoIds, setExistingPhotoIds] = useState<string[]>([]);
  const { user } = useAuth();
  const route = useRoute<EditLaunchScreenRouteProp>();
  const navigation = useNavigation();
  const { registroId } = route.params;

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

  useEffect(() => {
    loadRegistroData();
  }, [registroId]);

  const loadRegistroData = async () => {
    try {
      setIsLoading(true);

      const registro = await database.get<Registro>('registros').find(registroId);
      const fotos = await database
        .get<FotoRegistro>('foto_registros')
        .query(Q.where('registro_id', registroId))
        .fetch();

      reset({
        tipo: registro.tipo as LaunchType,
        descricao: registro.descricao,
        dataHora: registro.dataHora,
      });

      setTempDataHora(registro.dataHora);

      const photoUriList = fotos.map((foto) => foto.pathUrl);
      const photoIdList = fotos.map((foto) => foto.id);
      setPhotoUris(photoUriList);
      setExistingPhotoIds(photoIdList);
    } catch (error) {
      console.error('Erro ao carregar registro:', error);
      Alert.alert('Erro', 'Não foi possível carregar o lançamento', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: LaunchFormData) => {
    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    setIsSubmitting(true);

    try {
      await database.write(async () => {
        const registro = await database.get<Registro>('registros').find(registroId);
        await registro.update((r) => {
          r.tipo = data.tipo;
          r.dataHora = data.dataHora;
          r.descricao = data.descricao;
          r.sincronizado = false;
        });

        const fotoRegistrosCollection = database.get<FotoRegistro>('foto_registros');

        const currentPhotoUris = photoUris.filter((uri) => uri);
        const existingPhotoUris = photoUris.slice(0, existingPhotoIds.length);
        const newPhotoUris = photoUris.slice(existingPhotoIds.length);

        for (const photoUri of newPhotoUris) {
          await fotoRegistrosCollection.create((foto) => {
            foto.registroId = registro.id;
            foto.pathUrl = photoUri;
          });
        }
      });

      Alert.alert('Sucesso', 'Lançamento atualizado com sucesso!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Erro ao atualizar registro:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o lançamento');
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando lançamento...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <View style={styles.typeContainer}>
            <Text style={styles.label}>Tipo de Lançamento</Text>
            <Controller
              control={control}
              name="tipo"
              render={({ field: { onChange, value } }) => (
                <View style={styles.typeButtons}>
                  <TouchableOpacity
                    style={[styles.typeButton, value === 'entrada' && styles.typeButtonActive]}
                    onPress={() => onChange('entrada')}
                  >
                    <Ionicons
                      name="arrow-down"
                      size={24}
                      color={value === 'entrada' ? '#fff' : '#28A745'}
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
                    style={[styles.typeButton, value === 'saida' && styles.typeButtonActive]}
                    onPress={() => onChange('saida')}
                  >
                    <Ionicons
                      name="arrow-up"
                      size={24}
                      color={value === 'saida' ? '#fff' : '#DC3545'}
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
              )}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Data e Hora</Text>
            <Controller
              control={control}
              name="dataHora"
              render={({ field: { onChange, value } }) => (
                <>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={24} color="#666" />
                    <Text style={styles.dateText}>{formatDateTime(value)}</Text>
                  </TouchableOpacity>
                  <DatePicker
                    modal
                    open={showDatePicker}
                    date={tempDataHora}
                    mode="datetime"
                    locale="pt-BR"
                    onConfirm={(date) => {
                      setShowDatePicker(false);
                      setTempDataHora(date);
                      onChange(date);
                    }}
                    onCancel={() => {
                      setShowDatePicker(false);
                    }}
                    title="Selecione a data e hora"
                    confirmText="Confirmar"
                    cancelText="Cancelar"
                  />
                </>
              )}
            />
            {errors.dataHora && <Text style={styles.errorText}>{errors.dataHora.message}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Descrição</Text>
            <Controller
              control={control}
              name="descricao"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.textArea, errors.descricao && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Descreva o lançamento (mínimo 10 caracteres)"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              )}
            />
            {errors.descricao && <Text style={styles.errorText}>{errors.descricao.message}</Text>}
          </View>

          <View style={styles.photosContainer}>
            <Text style={styles.label}>Fotos</Text>
            <View style={styles.photoButtons}>
              <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
                <Ionicons name="camera-outline" size={24} color="#007AFF" />
                <Text style={styles.photoButtonText}>Câmera</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.photoButton} onPress={handlePickImage}>
                <Ionicons name="image-outline" size={24} color="#007AFF" />
                <Text style={styles.photoButtonText}>Galeria</Text>
              </TouchableOpacity>
            </View>

            {photoUris.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoList}>
                {photoUris.map((uri, index) => (
                  <View key={`${uri}-${index}`} style={styles.photoItem}>
                    <Image source={{ uri }} style={styles.photoImage} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => handleRemovePhoto(uri)}
                    >
                      <Ionicons name="close-circle" size={24} color="#DC3545" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Salvar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollContent: {
    padding: 16,
  },
  form: {
    gap: 16,
  },
  typeContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  inputContainer: {
    gap: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
  },
  inputError: {
    borderColor: '#DC3545',
  },
  errorText: {
    color: '#DC3545',
    fontSize: 14,
  },
  photosContainer: {
    gap: 8,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    gap: 8,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  photoList: {
    marginTop: 12,
  },
  photoItem: {
    position: 'relative',
    marginRight: 12,
  },
  photoImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
