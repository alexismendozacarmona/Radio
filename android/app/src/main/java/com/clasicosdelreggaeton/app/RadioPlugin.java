package com.clasicosdelreggaeton.app;

import android.content.Intent;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "RadioPlugin")
public class RadioPlugin extends Plugin {

    // ── Iniciar audio en segundo plano ────────────────────────────────────────
    @PluginMethod
    public void startAudio(PluginCall call) {
        String url = call.getString("url");
        if (url == null || url.isEmpty()) {
            call.reject("URL requerida");
            return;
        }

        try {
            Intent intent = new Intent(getContext(), RadioService.class);
            intent.putExtra("url", url);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getContext().startForegroundService(intent);
            } else {
                getContext().startService(intent);
            }

            JSObject result = new JSObject();
            result.put("status", "started");
            call.resolve(result);

        } catch (Exception e) {
            call.reject("Error al iniciar servicio: " + e.getMessage());
        }
    }

    // ── Detener audio ─────────────────────────────────────────────────────────
    @PluginMethod
    public void stopAudio(PluginCall call) {
        try {
            Intent intent = new Intent(getContext(), RadioService.class);
            intent.setAction(RadioService.ACTION_STOP);
            getContext().startService(intent);

            JSObject result = new JSObject();
            result.put("status", "stopped");
            call.resolve(result);

        } catch (Exception e) {
            call.reject("Error al detener servicio: " + e.getMessage());
        }
    }
}