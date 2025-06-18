package [tu.paquete];

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import android.content.ComponentName;
import android.content.Context;
import android.provider.Settings;
import android.text.TextUtils;

public class NotificationListenerModule extends ReactContextBaseJavaModule {
    public NotificationListenerModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "NotificationListener";
    }

    @ReactMethod
    public void isNotificationServiceEnabled(Promise promise) {
        Context context = getReactApplicationContext();
        String pkgName = context.getPackageName();
        final String flat = Settings.Secure.getString(context.getContentResolver(), "enabled_notification_listeners");
        final boolean enabled = flat != null && flat.contains(pkgName);
        promise.resolve(enabled);
    }

    @ReactMethod
    public void openNotificationAccessSettings() {
        Context context = getReactApplicationContext();
        Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
    }
}