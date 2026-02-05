import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { getUserInitials } from '../utils/getInitials';

interface UserInitialsProps {
  name: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
}

export default function UserInitials({
  name,
  size = 80,
  backgroundColor = '#3B82F6',
  textColor = '#FFF',
  style,
}: UserInitialsProps) {
  const initials = getUserInitials(name);
  const fontSize = size * 0.4;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize, color: textColor }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '600',
    letterSpacing: 1,
  },
});
