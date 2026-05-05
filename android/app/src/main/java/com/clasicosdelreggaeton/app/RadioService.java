package com.clasicosdelreggaeton.app;

import android.app.*;
import android.content.Intent;
import android.media.*;
import android.net.Uri;
import android.os.*;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;
import androidx.core.app.NotificationCompat;
import androidx.media.app.NotificationCompat.MediaStyle;

public class RadioService extends Service {

    private static final String CHANNEL_ID   = "radio_channel";
    private static final int    NOTIF_ID     = 1;
    public  static final String ACTION_STOP  = "com.clasicosdelreggaeton.app.STOP";
    public  static final String ACTION_PAUSE = "com.clasicosdelreggaeton.app.PAUSE";
    public  static final String ACTION_PLAY  = "com.clasicosdelreggaeton.app.PLAY";

    private MediaPlayer        mediaPlayer;
    private AudioManager       audioManager;
    private AudioFocusRequest  focusRequest;
    private MediaSessionCompat mediaSession;
    private String             streamUrl;
    private boolean            isPaused = false;

    // ── Ciclo de vida ─────────────────────────────────────────────────────────
    @Override
    public void onCreate() {
        super.onCreate();
        audioManager = (AudioManager) getSystemService(AUDIO_SERVICE);
        createChannel();
        initMediaSession();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String action = intent != null ? intent.getAction() : null;

        if (ACTION_STOP.equals(action)) {
            stopSelf();
            return START_NOT_STICKY;
        }

        if (ACTION_PAUSE.equals(action)) {
            pausePlayback();
            return START_STICKY;
        }

        if (ACTION_PLAY.equals(action)) {
            resumePlayback();
            return START_STICKY;
        }

        // Arranque inicial
        streamUrl = intent != null ? intent.getStringExtra("url") : null;
        if (streamUrl == null) { stopSelf(); return START_NOT_STICKY; }

        requestFocus();
        isPaused = false;
        startForeground(NOTIF_ID, buildNotification());
        playStream(streamUrl);
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (mediaPlayer  != null) { mediaPlayer.stop(); mediaPlayer.release(); mediaPlayer = null; }
        if (mediaSession != null) { mediaSession.setActive(false); mediaSession.release(); }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && focusRequest != null)
            audioManager.abandonAudioFocusRequest(focusRequest);
    }

    @Override public IBinder onBind(Intent i) { return null; }

    // ── Pausa / Reanudar ─────────────────────────────────────────────────────
    private void pausePlayback() {
        if (mediaPlayer != null && mediaPlayer.isPlaying()) {
            // Para radio en vivo no se puede pausar de verdad (es stream),
            // así que detenemos el buffer pero mantenemos el servicio activo
            mediaPlayer.stop();
            mediaPlayer.release();
            mediaPlayer = null;
        }
        isPaused = true;
        updatePlaybackState(false);
        updateNotification();
    }

    private void resumePlayback() {
        if (streamUrl == null) { stopSelf(); return; }
        isPaused = false;
        playStream(streamUrl);
        updatePlaybackState(true);
        updateNotification();
    }

    // ── MediaSession ──────────────────────────────────────────────────────────
    private void initMediaSession() {
        mediaSession = new MediaSessionCompat(this, "ClasicosSession");
        mediaSession.setFlags(MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS);

        mediaSession.setCallback(new MediaSessionCompat.Callback() {
            @Override public void onPlay()  { resumePlayback(); }
            @Override public void onPause() { pausePlayback();  }
            @Override public void onStop()  { stopSelf();       }
        });

        mediaSession.setMetadata(new MediaMetadataCompat.Builder()
            .putString(MediaMetadataCompat.METADATA_KEY_TITLE,  "Clásicos del Reggaetón")
            .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, "📻 Radio en Vivo")
            .build());

        updatePlaybackState(true);
        mediaSession.setActive(true);
    }

    private void updatePlaybackState(boolean playing) {
        int state = playing ? PlaybackStateCompat.STATE_PLAYING : PlaybackStateCompat.STATE_PAUSED;
        mediaSession.setPlaybackState(new PlaybackStateCompat.Builder()
            .setActions(PlaybackStateCompat.ACTION_PLAY_PAUSE |
                        PlaybackStateCompat.ACTION_PLAY  |
                        PlaybackStateCompat.ACTION_PAUSE |
                        PlaybackStateCompat.ACTION_STOP)
            .setState(state, 0, playing ? 1f : 0f)
            .build());
    }

    // ── Audio Focus ───────────────────────────────────────────────────────────
    private void requestFocus() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            AudioAttributes attrs = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                .build();
            focusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                .setAudioAttributes(attrs)
                .setOnAudioFocusChangeListener(change -> {
                    if (change == AudioManager.AUDIOFOCUS_LOSS)           stopSelf();
                    else if (change == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT) pausePlayback();
                    else if (change == AudioManager.AUDIOFOCUS_GAIN)           resumePlayback();
                })
                .build();
            audioManager.requestAudioFocus(focusRequest);
        }
    }

    // ── MediaPlayer ───────────────────────────────────────────────────────────
    private void playStream(String url) {
        if (mediaPlayer != null) { mediaPlayer.release(); }
        mediaPlayer = new MediaPlayer();
        mediaPlayer.setWakeMode(getApplicationContext(), PowerManager.PARTIAL_WAKE_LOCK);
        try {
            mediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                .build());
            mediaPlayer.setDataSource(getApplicationContext(), Uri.parse(url));
            mediaPlayer.setOnPreparedListener(MediaPlayer::start);
            mediaPlayer.setOnErrorListener((mp, w, e) -> { stopSelf(); return false; });
            mediaPlayer.prepareAsync();
        } catch (Exception e) { stopSelf(); }
    }

    // ── Notificación ──────────────────────────────────────────────────────────
    private void updateNotification() {
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        nm.notify(NOTIF_ID, buildNotification());
    }

    private Notification buildNotification() {
        PendingIntent openApp = PendingIntent.getActivity(this, 0,
            new Intent(this, MainActivity.class).setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // Botón dinámico: si está pausado → Play, si está reproduciendo → Pause
        boolean playing = !isPaused;

        PendingIntent togglePi;
        int            toggleIcon;
        String         toggleLabel;

        if (playing) {
            Intent pi = new Intent(this, RadioService.class).setAction(ACTION_PAUSE);
            togglePi    = PendingIntent.getService(this, 2, pi,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            toggleIcon  = android.R.drawable.ic_media_pause;
            toggleLabel = "Pausar";
        } else {
            Intent pi = new Intent(this, RadioService.class).setAction(ACTION_PLAY);
            togglePi    = PendingIntent.getService(this, 3, pi,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            toggleIcon  = android.R.drawable.ic_media_play;
            toggleLabel = "Reanudar";
        }

        PendingIntent stopPi = PendingIntent.getService(this, 1,
            new Intent(this, RadioService.class).setAction(ACTION_STOP),
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("Clásicos del Reggaetón")
            .setContentText(playing ? "📻 En vivo ahora" : "⏸ Pausado")
            .setContentIntent(openApp)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(playing)           // solo "inamovible" cuando está reproduciendo
            .addAction(toggleIcon, toggleLabel, togglePi)   // botón pause/play
            .addAction(android.R.drawable.ic_delete, "Cerrar", stopPi)  // botón cerrar
            .setStyle(new MediaStyle()
                .setShowActionsInCompactView(0)
                .setMediaSession(mediaSession.getSessionToken()))
            .build();
    }

    // ── Canal ─────────────────────────────────────────────────────────────────
    private void createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel ch = new NotificationChannel(
                CHANNEL_ID, "Radio en Segundo Plano", NotificationManager.IMPORTANCE_LOW);
            ch.setDescription("Reproductor de radio Clásicos del Reggaetón");
            ch.setShowBadge(false);
            ((NotificationManager) getSystemService(NOTIFICATION_SERVICE)).createNotificationChannel(ch);
        }
    }
}
