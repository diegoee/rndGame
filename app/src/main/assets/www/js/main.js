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
    paper: '../node_modules/paper/dist/paper-full.min',
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
    },
    paper : {
      exports: 'paper'
    }
  }
});

requirejs([
  'jquery',
  'backbone',
  'text!template/main.html',
  'game1',
  'game2',
  'game3',
  'game4',
  'snackbar',
  'bootstrap'
  ],
  function(
    $,
    Backbone,
    template,
    game1,
    game2,
    game3,
    game4,
    Snackbar
  ){
    'use strict';
    var data = {
      sound: true,
      orientation: true
    };

    function rndN(max,min){
      var rnd = Math.floor(Math.random() * max) + min;
      return rnd;
    }

    var AppRouter = Backbone.Router.extend({
      routes: {
          "init": "init",
          "rnd": "rnd",
          "play": "play"
      },
      init: function(){
        function resize(){
          $('#body').innerHeight($(window).innerHeight());
        }

        var border = ['border-primary','border-secondary','border-success','border-danger','border-warning','border-info','border-light'];
        var btnColor = ['btn-primary','btn-secondary','btn-success','btn-danger','btn-warning','btn-info','btn-light'];

        $('#container').html(template);
        resize();
        $(window).on('resize',resize);

        var rnd = rndN(border.length,1)-1;
        $('#border').addClass(border[rnd]);

        $.each(['#btnHelp','#btnPlay','#btnSound','#btnOrentation'],function(i,e){
          rnd = rndN(btnColor.length,1)-1;
          $(e).addClass(btnColor[rnd]);
        });

        $('#btnHelp').on('click',function (){
          Backbone.history.navigate('rnd', {trigger:true});
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
      rnd: function() {
        this.init();
        $('#modal').modal('dispose');

        var n = rndN(6,1);
        $('#rndN').append('<p class="h1 zoomOutIn">'+n+'</p>');
        $('#rndN').outerHeight($(window).outerHeight()-250);

        $('#modal').on('shown.bs.modal',function () {
          setTimeout(function(){
            $('#rndN p').addClass('zoomIn');
          },200);
        });

        $('#modal').on('hidden.bs.modal',function () {
          Backbone.history.navigate('init', {trigger:true});
        });
        $('#modal').modal();

      },
      play: function() {
        var games=[
          game1,
          game2,
          game3,
          game4
        ];
        //var n = ((new Date()).getHours()+(new Date()).getDate())%games.length;
        games[3].init(data.sound);
      }
    });

    new AppRouter();
    Backbone.history.start();
    //Backbone.history.navigate('init', {trigger:true});
    Backbone.history.navigate('play', {trigger:true});

});
