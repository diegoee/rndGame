/*globals requirejs, window,android,setTimeout */
requirejs.config({
  baseUrl: 'js',
  paths: {
    jquery: '../node_modules/jquery/dist/jquery.min',
    bootstrap: '../node_modules/bootstrap/dist/js/bootstrap.bundle.min',
    underscore: '../node_modules/underscore/underscore-min',
    snackbar: '../node_modules/node-snackbar/dist/snackbar.min',
    backbone: '../node_modules/backbone/backbone-min',
    howler: '../node_modules/howler/dist/howler.min',
    hammer: '../node_modules/hammerjs/hammer',
    paper: '../node_modules/paper/dist/paper-full.min',
  },
  shim: {
    bootstrap : {
      deps : ['jquery']
    },
    underscore: {
      exports: '_'
    },
    backbone: {
      exports: 'Backbone',
      deps: ['jquery', 'underscore']
    },
    snackbar: {
      deps: ['jquery','bootstrap']
    },
    paper : {
      exports: 'paper'
    }
  }
});

requirejs([
  'jquery',
  'backbone',
  'game',
  'snackbar',
  'bootstrap'
  ],
  function(
    $,
    Backbone,
    game,
    Snackbar
  ){
    'use strict';
    var data = {
      sound: true,
      orientation: true, 
      score: 0,
    };

    function rndN(max,min){
      var rnd = Math.floor(Math.random() * max) + min;
      return rnd;
    } 

    function saveGetData(){
      try{
        android.setData(JSON.stringify(data));
        data = JSON.parse(android.getData());
      }catch(e){
        console.error(e);
      }
    }
  
    var AppRouter = Backbone.Router.extend({
      routes: {
          init: 'init',
          play: 'play'
      },
      init: function(){
        function resize(){
          $('#body').innerHeight($(window).innerHeight());
        }

        var border = ['border-primary','border-secondary','border-success','border-danger','border-warning','border-info','border-light'];
        var btnColor = ['btn-primary','btn-secondary','btn-success','btn-danger','btn-warning','btn-info','btn-light'];
 
        $.get('templates/main.html',function(template){  
          $('#container').html(template); 
          
          resize();
          $(window).off('resize');
          $(window).on('resize',resize);

          var rnd = rndN(border.length,1)-1;
          $('#border').addClass(border[rnd]);
          $.each(
            ['#btnScore',
             '#btnPlay',
             '#btnSound',
             '#btnOrentation'
          ],function(i,e){
            rnd = rndN(btnColor.length,1)-1;
            $(e).addClass(btnColor[rnd]);
          });          

          function soundIcon(s){
            if(!s){
              $('#btnSound i').removeClass('fa-volume-up');
              $('#btnSound i').addClass('fa-volume-down');
            }else{
              $('#btnSound i').removeClass('fa-volume-down');
              $('#btnSound i').addClass('fa-volume-up');
            }
          }
          function orienIcon(s){
            if(!s){
              $('#btnOrentation i').css({transform: 'rotate(90deg)'});
            }else{
              $('#btnOrentation i').css({transform: 'rotate(0deg)'});
            }
          }

          try{
            data = JSON.parse(android.getData());
          }catch(e){ 
            data.score=0; 
            data.sounddata=true;
            data.orientation=true;
            console.error(e);
          }
          soundIcon(data.sound);
          orienIcon(data.orientation);

          $('#btnSound').on('click',function (){
            data.sound=!data.sound;
            saveGetData();
            soundIcon(data.sound);
            Snackbar.show({
              text: 'Sound: '+(data.sound?'On':'Off'),
              showAction: false,
              duration: 2500
            });
          });
          $('#btnOrentation').on('click',function(){
            data.orientation=!data.orientation;
            saveGetData();
            orienIcon(data.orientation);
          });          
          $('#btnScore').on('click',function(){
            try{
              saveGetData();
              android.shareScore();
            }catch(e){
              console.error(e);
            }
          });          
          $('#btnPlay').on('click',function(){
            Backbone.history.navigate('play', {trigger:true});
          });
          
          Snackbar.show({
            text: 'App',
            duration: 1
          });
                    
        }); 

      }, 
      play: function(){ 
        var self = this;
        game.init(data.sound,function(score){ 
           
          if (score>data.score){
            data.score=score;
            var rec = 'New record!!'; 
            
            try{
              saveGetData(); 
            }catch(e){
              console.error(e);
              //Backbone.history.navigate('init', {trigger:true});
            }
            
            Snackbar.show({
              text: 'Score: '+score+' '+rec,
              duration: 3000,
              actionText: 'Close',
              onClose: function(){
                Backbone.history.navigate('init', {trigger:true});  
              }
            });
          }else{
            Backbone.history.navigate('init', {trigger:true});
          }  
        });
      }
    });

    new AppRouter();
    Backbone.history.start();
    Backbone.history.navigate('init', {trigger:true});
});
