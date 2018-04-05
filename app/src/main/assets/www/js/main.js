/*globals requirejs */
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
  'menu',
  'help',
  'memoGame',
  'bootstrap'
  ],
  function(
    $,
    Backbone,
    menu,
    help,
    memoGame
  ){
    'use strict';

    var AppRouter = Backbone.Router.extend({
      routes: {
          "init": "init",
          "help": "help",
          "play": "play"
      },
      init: function(){
        //memoGame.init();
        menu.init(Backbone);
      },
      help: function() {
        this.init();
        help.init(Backbone);
      },
      play: function() {
        memoGame.init();
      }
    });

    new AppRouter();
    Backbone.history.start();
    Backbone.history.navigate('init', {trigger:true});


});
