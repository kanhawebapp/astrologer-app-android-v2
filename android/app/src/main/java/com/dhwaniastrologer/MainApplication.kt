package partner.dhwaniastro.com

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.flipper.ReactNativeFlipper
import com.facebook.soloader.SoLoader
import com.onesignal.OneSignal

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              add(CallNotificationPackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(this.applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, false)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      load()
    }
    ReactNativeFlipper.initializeFlipper(this, reactNativeHost.reactInstanceManager)
    initOneSignal()
  }

  private fun initOneSignal() {
    // The appId is required at the native level for the OneSignal SDK to
    // self-initialize from the FCM receiver and render kill-mode notifications.
    // It is also declared as <meta-data android:name="com.onesignal.appId"> in
    // AndroidManifest.xml so the killed-process push path works independently
    // of the JS bundle. JS (oneSignalService.init) re-initializes with the same
    // appId, which is idempotent.
    try {
      OneSignal.initWithContext(this, getString(R.string.onesignal_app_id))
    } catch (e: Exception) {
      android.util.Log.e("MainApplication", "OneSignal.initialize failed", e)
    }
  }
}
