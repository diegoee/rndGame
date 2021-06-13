package com.diegoee.rndgame;


import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.Manifest;
import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;

import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;


public class MainActivity extends AppCompatActivity{
  public static final String TAG = "TAG_LOG";
  public static final String DATA = "DATA_WEB";
  public static final String DATA_JSON = "DATA_JSON";

  private static final String AD_UNIT_ID = "ca-app-pub-7963003009765790/8418832648"; //MINE
  //private static final String AD_UNIT_ID = "ca-app-pub-3940256099942544/1033173712"; //TEST GOOGLE

  public static int CODE_PERM = 01;

  private WebView webView;
  private String data;
  private int score;

  private InterstitialAd interstitialAd;

  int permissionCheck;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);
    getSupportActionBar().hide();

    //check permissions needed
    if(Build.VERSION.SDK_INT > Build.VERSION_CODES.LOLLIPOP){
      permissionCheck = this.checkSelfPermission("Manifest.permission.WRITE_EXTERNAL_STORAGE");
      permissionCheck += this.checkSelfPermission("Manifest.permission.READ_EXTERNAL_STORAGE");
      if (permissionCheck != 0) {
        this.requestPermissions(new String[]{
          Manifest.permission.WRITE_EXTERNAL_STORAGE,
          Manifest.permission.READ_EXTERNAL_STORAGE
        },CODE_PERM); //Any number
      }
    }else{
      permissionCheck = 0;
    }

    //Crete webView
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

    webView.loadUrl("file:///android_asset/www/index.html");
    loadAd();

    score = 0;
    data = getData();
    checkData();
  }

  public void loadAd(){
    Log.v(TAG,"loadAd() -> Exe ");
    try {
      AdRequest adRequest = new AdRequest.Builder().build();
      interstitialAd = null;
      InterstitialAd.load(
        this,
        AD_UNIT_ID,
        adRequest,
        new InterstitialAdLoadCallback() {
          @Override
          public void onAdLoaded(@NonNull InterstitialAd interstitialAd) {
            // The mInterstitialAd reference will be null until
            // an ad is loaded.
            MainActivity.this.interstitialAd = interstitialAd;
            Log.v(TAG, "loadAd() -> onAdLoaded");
            interstitialAd.setFullScreenContentCallback(
              new FullScreenContentCallback() {
                @Override
                public void onAdDismissedFullScreenContent() {
                  // Called when fullscreen content is dismissed.
                  // Make sure to set your reference to null so you don't
                  // show it a second time.
                  MainActivity.this.interstitialAd = null;
                  Log.v(TAG, "loadAd() -> onAdDismissedFullScreenContent(): The ad was dismissed.");
                }
                @Override
                public void onAdFailedToShowFullScreenContent(AdError adError) {
                  // Called when fullscreen content failed to show.
                  // Make sure to set your reference to null so you don't
                  // show it a second time.
                  MainActivity.this.interstitialAd = null;
                  Log.v(TAG, "loadAd() -> onAdFailedToShowFullScreenContent(): The ad failed to show.");
                }
                @Override
                public void onAdShowedFullScreenContent() {
                  // Called when fullscreen content is shown.
                  Log.v(TAG, "loadAd() -> onAdShowedFullScreenContent(): The ad was shown.");
                }
              });
              interstitialAd.show(MainActivity.this);
          }
          @Override
          public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
            // Handle the error
            interstitialAd = null;
            String error = String.format("domain: %s, code: %d, message: %s", loadAdError.getDomain(), loadAdError.getCode(), loadAdError.getMessage());
            Log.v(TAG, "loadAd() -> onAdFailedToLoad: " + error);
            Toast.makeText(MainActivity.this, error, Toast.LENGTH_SHORT).show();
          }
        }
      );
    }catch (Exception e){
      Log.v(TAG, "loadAd() -> Error: "+String.format("%s", e.getMessage()));
    }
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

  @Override
  public void onRequestPermissionsResult(int requestCode, String permissions[], int[] grantResults) {
    super.onRequestPermissionsResult(requestCode,permissions,grantResults);
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
  public void shareScore(){
    data = getData();
    try {
      JSONObject obj = new JSONObject(data);
      score = obj.getInt("score");
    } catch (Throwable e) {
      Log.v(TAG,e.getMessage());
      Toast.makeText(getApplicationContext(), "Error: Score not read", Toast.LENGTH_SHORT).show();
      e.printStackTrace();
    }

    AlertDialog.Builder mBuilder = new AlertDialog.Builder(MainActivity.this);
    final View mView = getLayoutInflater().inflate(R.layout.score_dialog, null);
    ((TextView) mView.findViewById(R.id.score_text)).setText(""+score+"");
    mBuilder.setView(mView);

    final AlertDialog dialog = mBuilder.create();
    mView.findViewById(R.id.btnShare).setOnClickListener(new View.OnClickListener(){
      @Override
      public void onClick(View view) {
        try {
          String mPath = Environment.getExternalStorageDirectory().toString() + "/"+getResources().getString(R.string.app_name)+".jpg";

          // create bitmap screen capture
          //View v1 = getWindow().getDecorView().getRootView();
          mView.getRootView().setDrawingCacheEnabled(true);
          Bitmap bitmap = Bitmap.createBitmap(mView.getRootView().getDrawingCache());
          mView.getRootView().setDrawingCacheEnabled(false);

          File imageFile = new File(mPath);

          FileOutputStream outputStream = new FileOutputStream(imageFile);
          int quality = 100;
          bitmap.compress(Bitmap.CompressFormat.JPEG, quality, outputStream);
          outputStream.flush();
          outputStream.close();

          Log.v(TAG,"shareScore "+score);
          Intent i = new Intent( Intent.ACTION_SEND);
          Uri imageUri = Uri.parse(mPath);
          i.putExtra(Intent.EXTRA_TEXT, "My score on RnDGame: "+score+"\n"+getString(R.string.url_playstore));
          i.putExtra(Intent.EXTRA_STREAM, imageUri);
          i.setType("image/jpeg");
          startActivity(Intent.createChooser( i, "Share Via"));
          //Toast.makeText(getApplicationContext(), "Sharing!", Toast.LENGTH_SHORT).show();
          dialog.dismiss();
        }catch (Throwable e) {
          Log.v(TAG,e.getMessage());
          Toast.makeText(getApplicationContext(), "Error, u can not share :(", Toast.LENGTH_SHORT).show();
          // Several error may come out with file handling or DOM
          e.printStackTrace();
        }
      }
    });
    dialog.show();
  }

  @JavascriptInterface
  public String getData() {
    SharedPreferences sharedPref = getApplicationContext().getSharedPreferences(DATA, Context.MODE_PRIVATE);
    data = sharedPref.getString(DATA_JSON,"{sound: true,orientation: true,score: 0}");
    return data;
  }

  @Override
  public void onResume() {
    super.onResume();
  }

  @Override
  public void onPause() {
    super.onPause();
  }

}
