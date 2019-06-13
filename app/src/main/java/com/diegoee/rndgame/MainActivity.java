package com.diegoee.rndgame;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
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

import java.io.File;
import java.io.FileOutputStream;
import java.util.Date;

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


        if(Build.VERSION.SDK_INT > Build.VERSION_CODES.LOLLIPOP){
            checkPermission();
        }else{
            permissionCheck = 0;
        }

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



    public static int CODE_PERM = 01;
    int permissionCheck;


    private void checkPermission(){
        permissionCheck = this.checkSelfPermission("Manifest.permission.WRITE_EXTERNAL_STORAGE");
        permissionCheck += this.checkSelfPermission("Manifest.permission.READ_EXTERNAL_STORAGE");
        if (permissionCheck != 0) {
            this.requestPermissions(new String[]{
                    Manifest.permission.WRITE_EXTERNAL_STORAGE,
                    Manifest.permission.READ_EXTERNAL_STORAGE
            },CODE_PERM); //Any number
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String permissions[], int[] grantResults) {
        if(requestCode==CODE_PERM){
            if (grantResults.length!=0) {
                permissionCheck = 0;
                for (int num : grantResults) {
                    permissionCheck = permissionCheck + num;
                }
            }
        }
    }

    @JavascriptInterface
    public void shareScore(int score){

        try {

            String mPath = Environment.getExternalStorageDirectory().toString() + "/"+getResources().getString(R.string.app_name)+".jpg";

            // create bitmap screen capture
            View v1 = getWindow().getDecorView().getRootView();
            v1.setDrawingCacheEnabled(true);
            Bitmap bitmap = Bitmap.createBitmap(v1.getDrawingCache());
            v1.setDrawingCacheEnabled(false);

            File imageFile = new File(mPath);

            FileOutputStream outputStream = new FileOutputStream(imageFile);
            int quality = 100;
            bitmap.compress(Bitmap.CompressFormat.JPEG, quality, outputStream);
            outputStream.flush();
            outputStream.close();

            Log.v(TAG,"shareScore "+score);
            Intent i = new Intent( Intent.ACTION_SEND);
            Uri imageUri = Uri.parse(mPath);
            i.putExtra(Intent.EXTRA_TEXT, "My score on RnDGame: "+score+"\nhttps://play.google.com/store/apps/details?id=com.diegoee.rndgame1");
            i.putExtra(Intent.EXTRA_STREAM, imageUri);
            i.setType("image/jpeg");
            startActivity(Intent.createChooser( i, "Share Via"));
            Toast.makeText(getApplicationContext(), "Sharing!", Toast.LENGTH_SHORT).show();

        } catch (Throwable e) {
            Log.v(TAG,e.getMessage());
            Toast.makeText(getApplicationContext(), "Error, can not share :(", Toast.LENGTH_SHORT).show();
            // Several error may come out with file handling or DOM
            e.printStackTrace();
        }

    }

    @JavascriptInterface
    public String getData() {
        SharedPreferences sharedPref = getApplicationContext().getSharedPreferences(DATA, Context.MODE_PRIVATE);
        data = sharedPref.getString(DATA_JSON,"{sound: true,orientation: true,score: 0}");
        return data;
    }

}
