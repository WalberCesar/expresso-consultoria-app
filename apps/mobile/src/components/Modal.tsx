import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ModalButton {
  text: string;
  onPress: () => void;
  variant?: ButtonVariant;
}

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  buttons?: ModalButton[];
}

export default function Modal({
  visible,
  onClose,
  title,
  message,
  icon,
  iconColor = '#3B82F6',
  buttons = [{ text: 'OK', onPress: onClose, variant: 'primary' }],
}: ModalProps) {
  const getButtonStyle = (variant: ButtonVariant = 'primary') => {
    switch (variant) {
      case 'primary':
        return styles.buttonPrimary;
      case 'secondary':
        return styles.buttonSecondary;
      case 'danger':
        return styles.buttonDanger;
      default:
        return styles.buttonPrimary;
    }
  };

  const getButtonTextStyle = (variant: ButtonVariant = 'primary') => {
    switch (variant) {
      case 'primary':
        return styles.buttonTextPrimary;
      case 'secondary':
        return styles.buttonTextSecondary;
      case 'danger':
        return styles.buttonTextDanger;
      default:
        return styles.buttonTextPrimary;
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <StatusBar backgroundColor="rgba(0,0,0,0.5)" />
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
            <View style={{ display: 'flex', flexDirection: 'row',justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 8 }}>
   
              <Text style={styles.title}>{title}</Text>
                {icon && title!== "Sair" && (
                  <Ionicons name={icon} size={40} color={iconColor} /> 
              )}
            </View>
              
              
              {message && <Text style={styles.message}>{message}</Text>}

              <View style={styles.buttonsContainer}>
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.button, getButtonStyle(button.variant)]}
                    onPress={() => {
                      button.onPress();
                      onClose();
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={getButtonTextStyle(button.variant)}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#3B82F6',
  },
  buttonSecondary: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  buttonDanger: {
    backgroundColor: '#EF4444',
  },
  buttonTextPrimary: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDanger: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
