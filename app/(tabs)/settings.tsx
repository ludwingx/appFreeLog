import { ThemedText } from '@/components/ThemedText';
import NotificationService from '@/services/NotificationService';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const [clientId, setClientId] = useState('');
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  const [isConfigured, setIsConfigured] = useState(false);
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    loadNotificationCount();
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const config = await notificationService.getGoogleSheetsConfig();
      if (config) {
        setClientId(config.clientId);
        setSpreadsheetId(config.spreadsheetId);
        setSheetName(config.sheetName);
        setIsConfigured(true);
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
  };

  const loadNotificationCount = async () => {
    try {
      const storedNotifications = await notificationService.getAllNotifications();
      setNotificationCount(storedNotifications?.length || 0);
    } catch (error) {
      console.error('Error al cargar las notificaciones:', error);
    }
  };

  const testConnection = async () => {
    try {
      await notificationService.initializeGoogleSheets(clientId, spreadsheetId, sheetName);
      const testData = await notificationService.getSheetData(); // Asegúrate de que este método exista
      Alert.alert('Éxito', 'Configuración guardada y conexión verificada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo verificar la conexión: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleSave = async () => {
    if (!clientId || !spreadsheetId || !sheetName) {
      Alert.alert('Error', 'Todos los campos son requeridos');
      return;
    }

    try {
      const success = await notificationService.initializeGoogleSheets(clientId, spreadsheetId, sheetName);

      if (success || Platform.OS === 'web') {
        setIsConfigured(true);

        if (Platform.OS !== 'web') {
          await testConnection();
        } else {
          Alert.alert(
            'Información',
            'La configuración se ha guardado. Ten en cuenta que la integración completa con Google Sheets solo está disponible en dispositivos móviles. En la versión web, los datos se almacenarán localmente.'
          );
        }
      } else {
        Alert.alert('Error', 'No se pudo inicializar Google Sheets. Por favor, verifica las credenciales.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la configuración: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <ThemedText style={styles.title}>Configuración de Google Sheets</ThemedText>

        {isConfigured && (
          <ThemedText style={styles.statusText}>✅ Google Sheets está configurado y activo</ThemedText>
        )}

        <TextInput
          style={styles.input}
          placeholder="Client ID"
          value={clientId}
          onChangeText={setClientId}
        />

        <TextInput
          style={styles.input}
          placeholder="Spreadsheet ID"
          value={spreadsheetId}
          onChangeText={setSpreadsheetId}
        />

        <TextInput
          style={styles.input}
          placeholder="Nombre de la Hoja"
          value={sheetName}
          onChangeText={setSheetName}
        />

        <TouchableOpacity
          style={[styles.button, isConfigured && styles.updateButton]}
          onPress={handleSave}
        >
          <ThemedText style={styles.buttonText}>
            {isConfigured ? 'Actualizar Configuración' : 'Guardar Configuración'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.title}>Gestión de Notificaciones</ThemedText>

        <ThemedText style={styles.infoText}>
          Notificaciones almacenadas: {notificationCount}
        </ThemedText>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={async () => {
            try {
              await notificationService.clearNotifications();
              setNotificationCount(0);
              Alert.alert('Éxito', 'Todas las notificaciones han sido borradas');
            } catch (error) {
              Alert.alert('Error', 'No se pudieron borrar las notificaciones');
            }
          }}
          disabled={notificationCount === 0}
        >
          <ThemedText style={styles.buttonText}>Borrar Notificaciones</ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 16,
    textAlign: 'center',
  },
  updateButton: {
    backgroundColor: '#2196F3',
  },
});
