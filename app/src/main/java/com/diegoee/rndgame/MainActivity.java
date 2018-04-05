package com.diegoee.rndgame;

import android.net.Uri;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;

public class MainActivity extends AppCompatActivity{
    public static String TAG = "TAG_DIEGO";

    WebView webView;

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

    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if ((keyCode == KeyEvent.KEYCODE_BACK) && !((Uri.parse(webView.getUrl())).getFragment().equals("init"))) {
            webView.loadUrl("file:///android_asset/www/index.html");
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    /*
    @JavascriptInterface
    public void showToast(String toast) {
        Log.v(TAG,"showToast: "+toast);
        Toast.makeText(this, toast, Toast.LENGTH_SHORT).show();
    }
    */
}
