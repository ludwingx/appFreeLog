import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GoogleSheetsService from './GoogleSheetsService';

interface YapeNotification {
  amount: string;
  date: string;
  sender: string;
  message: string;
}

class NotificationService {
  private static instance: NotificationService;
  private eventEmitter: NativeEventEmitter;
  private googleSheets: GoogleSheetsService;

  private constructor() {
    this.eventEmitter = new NativeEventEmitter(NativeModules.NotificationListener);
    this.googleSheets = GoogleSheetsService.getInstance();
    this.setupNotificationListener();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private setupNotificationListener() {
    if (Platform.OS === 'android') {
      this.eventEmitter.addListener('onNotificationReceived', this.handleNotification);
    }
  }

  private handleNotification = async (notification: any) => {
    if (this.isYapeNotification(notification)) {
      const yapeData = this.parseYapeNotification(notification);
      await this.saveNotification(yapeData);
      await this.sendToGoogleSheets(yapeData);
    }
  }

  private isYapeNotification(notification: any): boolean {
    return notification.packageName === 'com.yape.android';
  }

  private parseYapeNotification(notification: any): YapeNotification {
    return {
      amount: this.extractAmount(notification.text),
      date: new Date().toISOString(),
      sender: notification.title,
      message: notification.text
    };
  }

  private extractAmount(text: string): string {
    const match = text.match(/S\/\s*(\d+(\.\d{2})?)/i);
    return match ? match[1] : '0';
  }

  private async saveNotification(data: YapeNotification) {
    try {
      const notifications = await this.getStoredNotifications();
      notifications.push(data);
      await AsyncStorage.setItem('yape_notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  }

  private async getStoredNotifications(): Promise<YapeNotification[]> {
    try {
      const stored = await AsyncStorage.getItem('yape_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored notifications:', error);
      return [];
    }
  }

  private async sendToGoogleSheets(data: YapeNotification) {
    try {
      const values = [
        data.date,
        data.amount,
        data.sender,
        data.message
      ];
      await this.googleSheets.appendRow(values);
    } catch (error) {
      console.error('Error sending to Google Sheets:', error);
    }
  }

  public async getGoogleSheetsConfig() {
    try {
      const config = await AsyncStorage.getItem('google_sheets_config');
      return config ? JSON.parse(config) : null;
    } catch (error) {
      console.error('Error getting Google Sheets config:', error);
      return null;
    }
  }

  public async initializeGoogleSheets(clientId: string, spreadsheetId: string, sheetName: string) {
    try {
      const success = await this.googleSheets.initialize(clientId, spreadsheetId, sheetName);
      if (success) {
        // Guardar la configuración si la inicialización fue exitosa
        await AsyncStorage.setItem('google_sheets_config', JSON.stringify({
          clientId,
          spreadsheetId,
          sheetName
        }));
      }
      return success;
    } catch (error) {
      console.error('Error initializing Google Sheets:', error);
      throw error;
    }
  }

  // Métodos públicos para acceder a las notificaciones
  public async getAllNotifications(): Promise<YapeNotification[]> {
    return this.getStoredNotifications();
  }

  public async clearNotifications() {
    try {
      await AsyncStorage.removeItem('yape_notifications');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  public async isNotificationServiceEnabled(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    
    try {
      const result = await NativeModules.NotificationListener.isServiceEnabled();
      return result;
    } catch (error) {
      console.error('Error checking notification service status:', error);
      return false;
    }
  }
}

export default NotificationService;