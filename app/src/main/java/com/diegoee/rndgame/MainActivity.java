package com.diegoee.rndgame;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.net.Uri;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MotionEvent;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.ShareActionProvider;
import android.widget.Toast;

import org.json.JSONException;
import org.json.JSONObject;

public class MainActivity extends AppCompatActivity{
    public static final String TAG = "TAG_LOG";
    public static final String DATA = "DATA_WEB";
    public static final String DATA_JSON = "DATA_JSON";

    private WebView webView;
    private String data;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        getSupportActionBar().hide();

        webView = createWebView();
        webView.loadUrl("file:///android_asset/www/index.html");

        data = getData();
        checkData();
    }

    public WebView createWebView(){
        webView = findViewById(R.id.web);

        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setAllowContentAccess(true);
        webView.getSettings().setAllowFileAccessFromFileURLs(true);
        webView.getSettings().setAllowUniversalAccessFromFileURLs(true);

        //Only hide the scrollbar, not disables the scrolling:
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);

        //Only disabled the horizontal scrolling:
        webView.getSettings().setLayoutAlgorithm(WebSettings.LayoutAlgorithm.SINGLE_COLUMN);

        //To disabled the horizontal and vertical scrolling:
        webView.setOnTouchListener(new View.OnTouchListener() {
            public boolean onTouch(View v, MotionEvent event) {
                return (event.getAction() == MotionEvent.ACTION_MOVE);
            }
        });
        webView.addJavascriptInterface(this, "android");
        return webView;
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if ((Uri.parse(webView.getUrl())).getFragment()!=null){
            if ((keyCode == KeyEvent.KEYCODE_BACK) && !((Uri.parse(webView.getUrl())).getFragment().equals("init"))) {
                //Log.v(TAG,"onKeyDown init");
                webView.loadUrl("file:///android_asset/www/index.html");
                return true;
            }
        }
        return super.onKeyDown(keyCode, event);
    }

    public void checkData(){
        try{
            JSONObject obj = new JSONObject(data);
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
        SharedPreferences sharedPref = getApplicationContext().getSharedPreferences(DATA,Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPref.edit();
        editor.putString(DATA_JSON, data);
        editor.commit();
        this.data=data;
        checkData();
    }

    @JavascriptInterface
    public void shareScore(int score){
        Log.v(TAG,"shareScore "+score);
        Intent i = new Intent( android.content.Intent.ACTION_SEND);
        i.setType("text/plain");
        i.putExtra(android.content.Intent.EXTRA_TEXT, "My score on RnDGame: "+score+"\nhttps://play.google.com/store/apps/details?id=com.diegoee.rndgame1");
        startActivity(Intent.createChooser( i, "Share Via"));
        Toast.makeText(getApplicationContext(), "Sharing!", Toast.LENGTH_SHORT).show();
    }

    @JavascriptInterface
    public String getData() {
        SharedPreferences sharedPref = getApplicationContext().getSharedPreferences(DATA, Context.MODE_PRIVATE);
        data = sharedPref.getString(DATA_JSON,"{sound: true,orientation: true,score: 0}");
        return data;
    }

}
