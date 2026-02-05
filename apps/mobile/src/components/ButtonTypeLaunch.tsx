import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ButtonTypeLaunchProps extends TouchableOpacityProps {
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  onPress: () => void;
  variant: 'entrada' | 'saida';
}

export default function ButtonTypeLaunch({
  title,
  iconName,
  isActive,
  onPress,
  variant,
  style,
  ...rest
}: ButtonTypeLaunchProps) {
  const getColors = () => {
    if (variant === 'entrada') {
      return {
        border: '#10B981',
        background: '#10B981',
        text: '#10B981',
      };
    }
    return {
      border: '#EF4444',
      background: '#EF4444',
      text: '#EF4444',
    };
  };

  const colors = getColors();


  return (
    <TouchableOpacity
      style={[
        styles.typeButton,
        { borderColor: colors.border },
        isActive && { backgroundColor: colors.background },
        style,
      ]}      onPress={onPress}
      {...rest}
    >
      <Ionicons
        name={iconName}
        size={24}
        color={isActive ? '#FFF' : colors.text}
      />
      <Text
        style={[
          styles.typeButtonText,
          { color: colors.text },
          isActive && styles.typeButtonTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#FFF',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#FFF',
  },
});
