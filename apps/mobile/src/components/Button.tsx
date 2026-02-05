import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
  variant?: 'outline' | 'solid';
  iconSize?: number;
  iconColor?: string;
}

const BUTTON_COLOR = '#3B82F6';

export default function Button({
  title,
  iconName,
  variant = 'outline',
  iconSize = 24,
  iconColor,
  style,
  ...rest
}: ButtonProps) {
  const finalIconColor = iconColor || (variant === 'solid' ? '#FFF' : BUTTON_COLOR);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'outline' && styles.buttonOutline,
        variant === 'solid' && styles.buttonSolid,
        style,
      ]}
      {...rest}
    >
      <Ionicons name={iconName} size={iconSize} color={finalIconColor} />
      <Text
        style={[
          styles.buttonText,
          variant === 'outline' && styles.buttonTextOutline,
          variant === 'solid' && styles.buttonTextSolid,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: BUTTON_COLOR,
    backgroundColor: '#FFF',
  },
  buttonSolid: {
    backgroundColor: BUTTON_COLOR,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  buttonTextOutline: {
    color: BUTTON_COLOR,
  },
  buttonTextSolid: {
    color: '#FFF',
  },
});
