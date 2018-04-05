/*globals define, window*/
define([
  'jquery',
  'text!template/help.html'
  ],
  function(
    $,
    template
  ){
  'use strict';
  var help = {
    init: function(Backbone){
      $('#container').append(template);
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
    }
  };
  return help;
});
