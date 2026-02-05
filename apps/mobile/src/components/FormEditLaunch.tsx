import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Q } from '@nozbe/watermelondb';
import DatePicker from './DatePicker';
import ButtonTypeLaunch from './ButtonTypeLaunch';
import Button from './Button';
import Modal from './Modal';
import { launchFormSchema, LaunchFormData } from '../schemas/launchFormSchema';
import { database } from '../db';
import Registro from '../db/models/Registro';
import FotoRegistro from '../db/models/FotoRegistro';
import { useAuth } from '../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type LaunchType = 'entrada' | 'saida';

interface FormEditLaunchProps {
  registroId: string;
}

export default function FormEditLaunch({ registroId }: FormEditLaunchProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [existingPhotoIds, setExistingPhotoIds] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
    iconColor: '#10B981',
    onModalClose: () => {},
  });
  const { user } = useAuth();
  const navigation = useNavigation();

  const insets = useSafeAreaInsets();

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

      const photoUriList = fotos.map((foto) => foto.pathUrl);
      const photoIdList = fotos.map((foto) => foto.id);
      setPhotoUris(photoUriList);
      setExistingPhotoIds(photoIdList);
    } catch (error) {
      console.error('Erro ao carregar registro:', error);
      setModalConfig({
        title: 'Erro',
        message: 'Não foi possível carregar o lançamento',
        icon: 'alert-circle',
        iconColor: '#EF4444',
        onModalClose: () => navigation.goBack(),
      });
      setModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: LaunchFormData) => {
    if (!user) {
      setModalConfig({
        title: 'Erro',
        message: 'Usuário não autenticado',
        icon: 'alert-circle',
        iconColor: '#EF4444',
        onModalClose: () => {},
      });
      setModalVisible(true);
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

        const allExistingFotos = await fotoRegistrosCollection
          .query(Q.where('registro_id', registroId))
          .fetch();

        const existingPhotoUris = photoUris.slice(0, existingPhotoIds.length);
        const newPhotoUris = photoUris.slice(existingPhotoIds.length);

        for (let i = 0; i < allExistingFotos.length; i++) {
          const foto = allExistingFotos[i];
          const stillExists = existingPhotoUris.includes(foto.pathUrl);
          
          if (!stillExists) {
            await foto.markAsDeleted();
          }
        }

        for (const photoUri of newPhotoUris) {
          await fotoRegistrosCollection.create((foto) => {
            foto.registroId = registro.id;
            foto.pathUrl = photoUri;
          });
        }
      });

      setModalConfig({
        title: 'Sucesso',
        message: 'Lançamento atualizado com sucesso!',
        icon: 'checkmark-circle',
        iconColor: '#10B981',
        onModalClose: () => navigation.goBack(),
      });
      setModalVisible(true);
    } catch (error) {
      console.error('Erro ao atualizar registro:', error);
      setModalConfig({
        title: 'Erro',
        message: 'Não foi possível atualizar o lançamento',
        icon: 'alert-circle',
        iconColor: '#EF4444',
        onModalClose: () => {},
      });
      setModalVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      setModalConfig({
        title: 'Permissão necessária',
        message: 'Precisamos de acesso à câmera para tirar fotos.',
        icon: 'camera',
        iconColor: '#EF4444',
        onModalClose: () => {},
      });
      setModalVisible(true);
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
      setModalConfig({
        title: 'Permissão necessária',
        message: 'Precisamos de acesso à galeria para selecionar fotos.',
        icon: 'images',
        iconColor: '#EF4444',
        onModalClose: () => {},
      });
      setModalVisible(true);
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Carregando lançamento...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.form, { paddingBottom: insets.bottom }]}>
      <View style={styles.typeContainer}>
        <Text style={styles.label}>Tipo de Lançamento</Text>
        <Controller
          control={control}
          name="tipo"
          render={({ field: { onChange, value } }) => (
            <View style={styles.typeButtons}>
              <ButtonTypeLaunch
                title="Entrada"
                iconName="arrow-down-circle"
                isActive={value === 'entrada'}
                onPress={() => onChange('entrada')}
                variant="entrada"
              />

              <ButtonTypeLaunch
                title="Saída"
                iconName="arrow-up-circle"
                isActive={value === 'saida'}
                onPress={() => onChange('saida')}
                variant="saida"
              />
            </View>
          )}
        />
        {errors.tipo && (
          <Text style={styles.errorText}>{errors.tipo.message}</Text>
        )}
      </View>

      <Controller
        control={control}
        name="dataHora"
        render={({ field: { onChange, value } }) => (
          <DatePicker
            value={value}
            onChange={onChange}
            label="Data e Hora"
            error={errors.dataHora?.message}
          />
        )}
      />

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
          <Button
            title="Câmera"
            iconName="camera-outline"
            variant="outline"
            onPress={handleTakePhoto}
          />

          <Button
            title="Galeria"
            iconName="image-outline"
            variant="outline"
            onPress={handlePickImage}
          />
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
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
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

      <Modal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          modalConfig.onModalClose();
        }}
        title={modalConfig.title}
        message={modalConfig.message}
        icon={modalConfig.icon}
        iconColor={modalConfig.iconColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
  inputContainer: {
    gap: 8,
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
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
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
    borderColor: '#3B82F6',
    gap: 8,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
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
    backgroundColor: '#3B82F6',
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
