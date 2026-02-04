import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { testDatabaseSetup } from './src/db/__tests__/database.test';

export default function App() {
  const [dbStatus, setDbStatus] = useState<string>('Testing database...');

  useEffect(() => {
    const runTest = async () => {
      const success = await testDatabaseSetup();
      setDbStatus(success ? '✅ Database configured!' : '❌ Database error');
    };
    runTest();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Expresso Consultoria App</Text>
      <Text style={styles.status}>{dbStatus}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  status: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
