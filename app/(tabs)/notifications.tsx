import { ThemedText } from '@/components/ThemedText';
import NotificationService from '@/services/NotificationService';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, Platform, Linking, TouchableOpacity } from 'react-native';

interface YapeNotification {
  amount: string;
  date: string;
  sender: string;
  message: string;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<YapeNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    checkNotificationPermission();
    loadNotifications();
  }, []);

  const checkNotificationPermission = async () => {
    if (Platform.OS === 'android') {
      // Verificar si el servicio está habilitado
      const enabled = await notificationService.isNotificationServiceEnabled();
      setHasPermission(enabled);
    }
  };

  const openNotificationSettings = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings();
    }
  };

  const loadNotifications = async () => {
    const storedNotifications = await notificationService.getAllNotifications();
    setNotifications(storedNotifications);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const renderNotification = ({ item }: { item: YapeNotification }) => (
    <View style={styles.notificationCard}>
      <ThemedText style={styles.amount}>S/ {item.amount}</ThemedText>
      <ThemedText style={styles.sender}>{item.sender}</ThemedText>
      <ThemedText style={styles.message}>{item.message}</ThemedText>
      <ThemedText style={styles.date}>
        {new Date(item.date).toLocaleString()}
      </ThemedText>
    </View>
  );

  if (!hasPermission && Platform.OS === 'android') {
    return (
      <View style={styles.permissionContainer}>
        <ThemedText style={styles.permissionText}>
          Se requieren permisos para acceder a las notificaciones
        </ThemedText>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={openNotificationSettings}
        >
          <ThemedText style={styles.permissionButtonText}>
            Configurar Permisos
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item, index) => index.toString()}
        style={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No hay notificaciones</ThemedText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  list: {
    flex: 1,
  },
  notificationCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sender: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});