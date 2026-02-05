import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DatePickerModal from 'react-native-date-picker';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  error?: string;
}

export default function DatePicker({ value, onChange, label = 'Data e Hora', error }: DatePickerProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDataHora, setTempDataHora] = useState(new Date());

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
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
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
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      <DatePickerModal
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
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
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
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 8,
  },
});
