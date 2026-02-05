import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import DatePicker from './DatePicker';
import Button from './Button';
import ButtonTypeLaunch from './ButtonTypeLaunch';
import Modal from './Modal';
import { launchFormSchema, LaunchFormData } from '../schemas/launchFormSchema';
import { database } from '../db';
import Registro from '../db/models/Registro';
import FotoRegistro from '../db/models/FotoRegistro';
import { useAuth } from '../contexts/AuthContext';

export default function FormCreateLaunch() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
    iconColor: '#10B981',
    onModalClose: () => {},
  });
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
        const registro = await database.get<Registro>('registros').create((r) => {
          r.empresaId = user.empresaId;
          r.usuarioId = user.id;
          r.tipo = data.tipo;
          r.dataHora = data.dataHora;
          r.descricao = data.descricao;
          r.sincronizado = false;
        });

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

      setModalConfig({
        title: 'Sucesso',
        message: 'Lançamento criado com sucesso!',
        icon: 'checkmark-circle',
        iconColor: '#10B981',
        onModalClose: () => {
          reset();
          setPhotoUris([]);
        },
      });
      setModalVisible(true);
    } catch (error) {
      console.error('Erro ao salvar registro:', error);
      setModalConfig({
        title: 'Erro',
        message: 'Não foi possível salvar o lançamento',
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

  return (
    <View style={styles.formContainer}>    
      <Controller
        control={control}
        name="tipo"
        render={({ field: { onChange, value } }) => (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Tipo</Text>
            <View style={styles.typeSelector}>
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
            {errors.tipo && (
              <Text style={styles.errorText}>{errors.tipo.message}</Text>
            )}
          </View>
        )}
      />

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

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Fotos</Text>
        <View style={styles.photoButtonsContainer}>
          <Button
            title="Tirar Foto"
            iconName="camera"
            onPress={handleTakePhoto}
          />

          <Button
            title="Galeria"
            iconName="images"
            onPress={handlePickImage}
          />
        </View>

        {photoUris.length > 0 && (
          <View style={styles.photoPreviewContainer}>
            {photoUris.map((uri) => (
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

      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Salvando...' : 'Salvar Lançamento'}
        </Text>
      </TouchableOpacity>

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
  photoButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
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
