package [tu.paquete];

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.content.Intent;
import android.os.Bundle;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class YapeNotificationService extends NotificationListenerService {
    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        if (sbn.getPackageName().equals("com.yape.android")) {
            Bundle extras = sbn.getNotification().extras;
            String title = extras.getString("android.title", "");
            String text = extras.getString("android.text", "");
            sendEventToReactNative(title, text, sbn.getPackageName());
        }
    }

    private void sendEventToReactNative(String title, String text, String packageName) {
        ReactContext reactContext = getReactContext();
        if (reactContext != null) {
            Bundle params = new Bundle();
            params.putString("title", title);
            params.putString("text", text);
            params.putString("packageName", packageName);
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("onNotificationReceived", params);
        }
    }

    private ReactContext getReactContext() {
        ReactApplication application = (ReactApplication) getApplication();
        ReactNativeHost reactNativeHost = application.getReactNativeHost();
        ReactInstanceManager reactInstanceManager = reactNativeHost.getReactInstanceManager();
        return (ReactContext) reactInstanceManager.getCurrentReactContext();
    }
}