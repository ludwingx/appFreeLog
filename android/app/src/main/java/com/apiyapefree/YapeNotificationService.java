package com.apiyapefree;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class YapeNotificationService extends NotificationListenerService {
    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        String packageName = sbn.getPackageName();
        
        if ("com.yape.android".equals(packageName)) {
            String title = sbn.getNotification().extras.getString("android.title");
            String text = sbn.getNotification().extras.getString("android.text");
            
            WritableMap notificationData = Arguments.createMap();
            notificationData.putString("packageName", packageName);
            notificationData.putString("title", title);
            notificationData.putString("text", text);
            
            // Enviar evento a React Native
            NotificationListenerModule.sendEvent("onNotificationReceived", notificationData);
        }
    }
}