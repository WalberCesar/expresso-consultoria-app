import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal';

const loginSchema = z.object({
  login: z.string().min(3, 'Login deve ter no mínimo 3 caracteres'),
  senha: z.string().min(4, 'Senha deve ter no mínimo 4 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function FormLogin() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    icon: 'cloud-offline' as keyof typeof Ionicons.glyphMap,
    iconColor: '#EF4444',
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: 'usuario.a@empresaa.com',
      senha: 'senha123',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    if (!isOnline) {
      setModalConfig({
        title: 'Sem conexão',
        message: 'Você precisa estar conectado à internet para fazer login.',
        icon: 'cloud-offline',
        iconColor: '#EF4444',
      });
      setModalVisible(true);
      return;
    }

    try {
      setLoading(true);
      setError('');

      await signIn(data.login, data.senha);
    } catch (err: any) {
      const errorMessage = 
        err.response?.data?.mensagem || 
        err.response?.data?.error ||
        'Erro ao fazer login. Verifique suas credenciais.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Login</Text>
        <Controller
          control={control}
          name="login"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                errors.login && styles.inputError,
              ]}
              placeholder="Digite seu login"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              autoCapitalize="none"
              editable={!loading}
            />
          )}
        />
        {errors.login && (
          <Text style={styles.errorText}>{errors.login.message}</Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Senha</Text>
        <View style={styles.passwordContainer}>
          <Controller
            control={control}
            name="senha"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.senha && styles.inputError,
                ]}
                placeholder="Digite sua senha"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
            )}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={22}
              color="#666"
            />
          </TouchableOpacity>
        </View>
        {errors.senha && (
          <Text style={styles.errorText}>{errors.senha.message}</Text>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        icon={modalConfig.icon}
        iconColor={modalConfig.iconColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
