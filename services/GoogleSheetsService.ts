import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SheetConfig {
  spreadsheetId: string;
  sheetName: string;
  clientId?: string;
}

class GoogleSheetsService {
  private static instance: GoogleSheetsService;
  private config: SheetConfig | null = null;

  private constructor() {}

  public static getInstance(): GoogleSheetsService {
    if (!GoogleSheetsService.instance) {
      GoogleSheetsService.instance = new GoogleSheetsService();
    }
    return GoogleSheetsService.instance;
  }

  public async initialize(clientId: string, spreadsheetId: string, sheetName: string) {
    try {
      if (!clientId || !spreadsheetId || !sheetName) {
        throw new Error('Todos los campos son requeridos');
      }

      this.config = {
        spreadsheetId,
        sheetName,
        clientId
      };
      
      // Guardar la configuración en AsyncStorage
      await AsyncStorage.setItem('google_sheets_config', JSON.stringify(this.config));
      
      if (Platform.OS === 'web') {
        // En web, simplemente guardamos la configuración sin intentar iniciar sesión
        // ya que la biblioteca no es compatible con web sin patrocinio
        console.log('Configuración guardada para web. La autenticación se realizará al enviar datos.');
        return true;
      } else {
        // Configuración para móvil
        GoogleSignin.configure({
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
          webClientId: clientId,
        });
        
        // Verificar si ya hay una sesión activa
        const isSignedIn = await GoogleSignin.getCurrentUser() !== null;
        if (!isSignedIn) {
          await GoogleSignin.signIn();
        }
        
        // Obtener token para verificar que todo está bien
        const { accessToken } = await GoogleSignin.getTokens();
        if (!accessToken) {
          throw new Error('No se pudo obtener el token de acceso');
        }
      }

      return true;
    } catch (error) {
      console.error('Error initializing Google Sheets:', error);
      throw new Error(error instanceof Error ? error.message : 'Error al inicializar Google Sheets');
    }
  }

  public async appendRow(values: string[]) {
    if (!this.config) {
      throw new Error('Google Sheets service not initialized');
    }

    try {
      let accessToken = '';
      
      if (Platform.OS === 'web') {
        // En web, mostramos un mensaje informativo ya que no podemos usar Google Sign-In
        console.log('Función no disponible en la versión web sin patrocinio.');
        // Aquí podrías implementar una solución alternativa para web si lo necesitas
        // Por ejemplo, usar un backend propio o almacenar localmente
        
        // Guardamos los datos localmente para no perderlos
        const storedData = await AsyncStorage.getItem('pending_sheet_data') || '[]';
        const pendingData = JSON.parse(storedData);
        pendingData.push(values);
        await AsyncStorage.setItem('pending_sheet_data', JSON.stringify(pendingData));
        
        return true;
      } else {
        // En móvil, usamos la implementación normal
        const { accessToken: token } = await GoogleSignin.getTokens();
        accessToken = token;
      }

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${this.config.sheetName}!A:D:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [values]
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error HTTP: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      return true;
    } catch (error) {
      console.error('Error appending row:', error);
      throw error;
    }
  }

  public async getSheetData() {
    if (!this.config) {
      throw new Error('Google Sheets service not initialized');
    }
  
    try {
      const { accessToken } = await GoogleSignin.getTokens();
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${this.config.sheetName}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
  
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
  
      const data = await response.json();
      return data.values || [];
    } catch (error) {
      console.error('Error getting sheet data:', error);
      throw error;
    }
  }
}

export default GoogleSheetsService;