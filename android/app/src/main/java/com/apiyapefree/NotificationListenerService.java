package com.apiyapefree;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.os.Bundle;
import android.app.Notification;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.ReactContext;

public class YapeNotificationService extends NotificationListenerService {
    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        if (sbn.getPackageName().equals("com.yape.android")) {
            Notification notification = sbn.getNotification();
            Bundle extras = notification.extras;
            
            WritableMap notificationData = Arguments.createMap();
            notificationData.putString("packageName", sbn.getPackageName());
            notificationData.putString("title", extras.getString(Notification.EXTRA_TITLE));
            notificationData.putString("text", extras.getString(Notification.EXTRA_TEXT));
            notificationData.putDouble("timestamp", sbn.getPostTime());
            
            sendNotificationEvent(notificationData);
        }
    }

    private void sendNotificationEvent(WritableMap notificationData) {
        ReactContext reactContext = getReactContext();
        if (reactContext != null) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onNotificationReceived", notificationData);
        }
    }

    private ReactContext getReactContext() {
        // Implementar la lógica para obtener el ReactContext
        return null; // Temporal
    }
}