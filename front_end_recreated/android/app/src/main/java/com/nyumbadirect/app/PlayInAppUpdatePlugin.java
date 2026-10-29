package com.nyumbadirect.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.PluginMethod;
import com.google.android.play.core.appupdate.AppUpdateInfo;
import com.google.android.play.core.appupdate.AppUpdateManager;
import com.google.android.play.core.appupdate.AppUpdateManagerFactory;
import com.google.android.play.core.appupdate.AppUpdateOptions;
import com.google.android.play.core.install.model.AppUpdateType;
import com.google.android.play.core.install.model.InstallStatus;
import com.google.android.play.core.install.model.UpdateAvailability;

/**
 * Native bridge for Google Play's own flexible in-app update UI.
 * It only reports an update for builds installed and updated through Google Play.
 */
@CapacitorPlugin(name = "PlayInAppUpdate")
public class PlayInAppUpdatePlugin extends Plugin {
    private AppUpdateManager updateManager;

    @Override
    public void load() {
        super.load();
        updateManager = AppUpdateManagerFactory.create(getContext());
    }

    @PluginMethod
    public void checkForUpdate(PluginCall call) {
        updateManager.getAppUpdateInfo()
            .addOnSuccessListener(info -> {
                JSObject result = new JSObject();
                boolean available = info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE
                    && info.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE);
                result.put("available", available);
                result.put("installStatus", info.installStatus());
                call.resolve(result);
            })
            .addOnFailureListener(error -> call.reject("Unable to check Google Play for an update.", error));
    }

    @PluginMethod
    public void startFlexibleUpdate(PluginCall call) {
        updateManager.getAppUpdateInfo()
            .addOnSuccessListener(info -> {
                if (info.updateAvailability() != UpdateAvailability.UPDATE_AVAILABLE
                    || !info.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE)) {
                    call.resolve(new JSObject().put("started", false));
                    return;
                }
                updateManager.startUpdateFlowForResult(
                    info,
                    getActivity(),
                    AppUpdateOptions.newBuilder(AppUpdateType.FLEXIBLE).build(),
                    8101
                );
                call.resolve(new JSObject().put("started", true));
            })
            .addOnFailureListener(error -> call.reject("Unable to start the Google Play update.", error));
    }

    @PluginMethod
    public void completeFlexibleUpdate(PluginCall call) {
        updateManager.completeUpdate();
        call.resolve();
    }

    @PluginMethod
    public void getInstallStatus(PluginCall call) {
        updateManager.getAppUpdateInfo()
            .addOnSuccessListener(info -> call.resolve(new JSObject().put("downloaded", info.installStatus() == InstallStatus.DOWNLOADED)))
            .addOnFailureListener(error -> call.reject("Unable to get update status.", error));
    }
}
