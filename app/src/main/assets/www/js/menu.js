/*globals define, window*/
define([
  'jquery',
  'text!template/menu.html',
  'snackbar'
  ],
  function(
    $,
    template,
    Snackbar
  ){
  'use strict';
  var menu = {
    resize: function (){
      $('#body').innerHeight($(window).innerHeight());
    },
    border: ['border-primary','border-secondary','border-success','border-danger','border-warning','border-info','border-light','border-dark'],
    btnColor: ['btn-primary','btn-secondary','btn-success','btn-danger','btn-warning','btn-info','btn-light'],
    init: function(Backbone){
      var self = this;
      $('#container').html(template);
      self.resize();
      $(window).on('resize',self.resize);

      var rnd = Math.floor(Math.random() * (self.border.length - 1)) + 1;
      rnd = rnd-1;
      $('#border').addClass(self.border[rnd]);

      $.each(['#btnHelp','#btnPlay'],function(i,e){
        rnd = Math.floor(Math.random() * (self.btnColor.length - 1)) + 1;
        rnd = rnd-1;
        $(e).addClass(self.btnColor[rnd]);
      });

      $('#btnHelp').on('click',function (){
        Backbone.history.navigate('help', {trigger:true});
      });
      $('#btnPlay').on('click',function(){
        Backbone.history.navigate('play', {trigger:true});
      });

      Snackbar.show({
        text: 'App',
        duration: 1
      });
    }
  };
  return menu;
});

