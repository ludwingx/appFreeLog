import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import GoogleSheetsService from '@/services/GoogleSheetsService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';

const googleSheets = GoogleSheetsService.getInstance();

export default function HomeScreen() {
  const [data, setData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Verificar si hay configuración guardada
        const config = await AsyncStorage.getItem('google_sheets_config');
        if (!config) {
          throw new Error('Por favor configura las credenciales de Google Sheets primero');
        }
        
        const sheetData = await googleSheets.getSheetData();
        setData(sheetData);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', error instanceof Error ? error.message : 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.reactLogo}
          />
        }
      >
        <ThemedText>Cargando datos...</ThemedText>
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">¡Bienvenido!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText>Registros recientes:</ThemedText>
        {data.length > 0 && (
          <View style={styles.tableContainer}>
            {/* Encabezados */}
            <View style={styles.headerRow}>
              <ThemedText style={styles.headerCell}>Fecha</ThemedText>
              <ThemedText style={styles.headerCell}>Mensaj</ThemedText>
              <ThemedText style={styles.headerCell}>Dominio</ThemedText>
            </View>
            
            {/* Filas de datos (omitimos la primera fila que son los encabezados) */}
            <FlatList
              data={data.slice(1)}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.dataRow}>
                  <ThemedText style={styles.dataCell}>{item[0]}</ThemedText>
                  <ThemedText style={styles.dataCell}>{item[1]}</ThemedText>
                  <ThemedText style={styles.dataCell}>{item[2]}</ThemedText>
                </View>
              )}
            />
          </View>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  tableContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
  },
  dataRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dataCell: {
    flex: 1,
  },
});
