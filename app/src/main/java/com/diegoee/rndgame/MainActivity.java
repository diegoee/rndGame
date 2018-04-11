package com.diegoee.rndgame;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.media.AudioManager;
import android.net.Uri;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import org.json.JSONException;
import org.json.JSONObject;


public class MainActivity extends AppCompatActivity{
    public static final String TAG = "TAG_DIEGO";
    public static final String DATA = "DATA_WEB";
    public static final String DATA_JSON = "DATA_JSON";

    WebView webView;
    String data;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        getSupportActionBar().hide();

        webView = findViewById(R.id.web);

        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setAllowContentAccess(true);
        webView.getSettings().setAllowFileAccessFromFileURLs(true);
        webView.getSettings().setAllowUniversalAccessFromFileURLs(true);

        webView.loadUrl("file:///android_asset/www/index.html");
        webView.addJavascriptInterface(this, "android");

        SharedPreferences sharedPref = getApplicationContext().getSharedPreferences(DATA, Context.MODE_PRIVATE);
        data = sharedPref.getString(DATA_JSON,"{sound: true,orientation: true}");
        checkData();
    }


    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if ((keyCode == KeyEvent.KEYCODE_BACK) && !((Uri.parse(webView.getUrl())).getFragment().equals("init"))) {
            webView.loadUrl("file:///android_asset/www/index.html");
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    public void checkData(){
        try{
            JSONObject obj = new JSONObject(data);
            AudioManager mAudioManager=(AudioManager)getSystemService(Context.AUDIO_SERVICE);
            if(obj.getBoolean("sound")){
                int unmute_volume = mAudioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC);
                mAudioManager.setStreamVolume(AudioManager.STREAM_MUSIC, unmute_volume, 0);
            }else{
                int mute_volume = 0;
                mAudioManager.setStreamVolume(AudioManager.STREAM_MUSIC, mute_volume, 0);
            }
            if(obj.getBoolean("orientation")){
                this.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
            }else{
                this.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
            }
        }catch(JSONException e){
            e.printStackTrace();
            Log.e(TAG,e.getMessage());
        }
    }

    @JavascriptInterface
    public void setData(String data){
        SharedPreferences sharedPref =  getApplicationContext().getSharedPreferences(DATA,Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString(DATA_JSON, data);
        editor.commit();
        this.data=data;
        checkData();
    }

    @JavascriptInterface
    public String getData() {
        SharedPreferences sharedPref = getApplicationContext().getSharedPreferences(DATA, Context.MODE_PRIVATE);
        data = sharedPref.getString(DATA_JSON,"{sound: true,orientation: true}");
        return data;
    }


}
