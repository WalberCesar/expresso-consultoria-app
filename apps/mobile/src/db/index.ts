import { Platform } from 'react-native';
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { schema } from './schema';
import { Registro, FotoRegistro } from './models';

const adapter = new SQLiteAdapter({
  schema,
  jsi: Platform.OS === 'ios',
  onSetUpError: (error) => {
    console.error('Database setup error:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Registro, FotoRegistro],
});
