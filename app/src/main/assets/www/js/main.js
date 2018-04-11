/*globals requirejs, window,android */
requirejs.config({
  baseUrl: 'js',
  paths: {
    jquery: '../node_modules/jquery/dist/jquery.min',
    bootstrap: '../node_modules/bootstrap/dist/js/bootstrap.bundle.min',
    underscore: '../node_modules/underscore/underscore-min',
    snackbar: '../node_modules/node-snackbar/dist/snackbar.min',
    backbone: '../node_modules/backbone/backbone-min',
    howler: '../node_modules/howler/dist/howler.min',
    text: '../node_modules/text/text',
    template: '../templates'
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
    }
  }
});

requirejs([
  'jquery',
  'backbone',
  'text!template/main.html',
  'memoGame',
  'snackbar',
  'bootstrap'
  ],
  function(
    $,
    Backbone,
    template,
    memoGame,
    Snackbar
  ){
    'use strict';
    var data = {
      sound: true,
      orientation: true
    };

    var AppRouter = Backbone.Router.extend({
      routes: {
          "init": "init",
          "help": "help",
          "play": "play"
      },
      init: function(){
        function resize(){
          $('#body').innerHeight($(window).innerHeight());
        }

        var border = ['border-primary','border-secondary','border-success','border-danger','border-warning','border-info','border-light','border-dark'];
        var btnColor = ['btn-primary','btn-secondary','btn-success','btn-danger','btn-warning','btn-info','btn-light'];

        $('#container').html(template);
        resize();
        $(window).on('resize',resize);

        var rnd = Math.floor(Math.random() * (border.length - 1)) + 1;
        rnd = rnd-1;
        $('#border').addClass(border[rnd]);

        $.each(['#btnHelp','#btnPlay','#btnSound','#btnOrentation'],function(i,e){
          rnd = Math.floor(Math.random() * (btnColor.length - 1)) + 1;
          rnd = rnd-1;
          $(e).addClass(btnColor[rnd]);
        });

        $('#btnHelp').on('click',function (){
          Backbone.history.navigate('help', {trigger:true});
        });
        $('#btnPlay').on('click',function(){
          Backbone.history.navigate('play', {trigger:true});
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

        function saveGetData(){
          try{
            android.setData(JSON.stringify(data));
            data = JSON.parse(android.getData());
          }catch(e){
            console.error(e);
          }
        }

        try{
          data = JSON.parse(android.getData());
        }catch(e){
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

        Snackbar.show({
          text: 'App',
          duration: 1
        });

      },
      help: function() {
        this.init();
        $('#modalHelp').modal('dispose');

        var labels = ['badge-primary','badge-secondary','badge-success','badge-danger','badge-warning','badge-info','badge-light','badge-dark'];
        var words = ['Play','Random','in the toilet','whats next!!','living la vida loca','Enjoy','Share','Live'];
        var n = Math.floor(Math.random() * (75 - 1)) + 1;
        var r1,r2;

        for (var i=0; i<n;i++){
          r1 = Math.floor(Math.random() * (labels.length - 1)) + 1;
          r1 = r1-1;
          r2 = Math.floor(Math.random() * (words.length - 1)) + 1;
          r2 = r2-1;
          $('#rndWords').append('<span class="badge '+labels[r1]+'">'+words[r2]+'</span>');
        }

        $('#modalHelp').modal();
        $('#modalHelp').on('hidden.bs.modal',function () {
          Backbone.history.navigate('init', {trigger:true});
        });
      },
      play: function() {
        memoGame.init();
      }
    });

    new AppRouter();
    Backbone.history.start();
    Backbone.history.navigate('init', {trigger:true});

});
