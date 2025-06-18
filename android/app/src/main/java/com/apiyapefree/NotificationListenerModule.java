package com.apiyapefree;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import android.provider.Settings;
import android.text.TextUtils;

public class NotificationListenerModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    public NotificationListenerModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "NotificationListener";
    }

    public static void sendEvent(String eventName, WritableMap params) {
        if (reactContext != null) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
        }
    }

    @ReactMethod
    public void isServiceEnabled(Promise promise) {
        String packageName = getReactApplicationContext().getPackageName();
        String flat = Settings.Secure.getString(getReactApplicationContext().getContentResolver(),
                "enabled_notification_listeners");
        boolean enabled = flat != null && flat.contains(packageName);
        promise.resolve(enabled);
    }
}