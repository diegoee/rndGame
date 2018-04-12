/*globals window, define, Promise,Howl, setTimeout*/
define([
  'jquery',
  'text!template/squareOut.html',
  'snackbar',
  'sounds',
  'howler'
  ],
  function(
    $,
    template,
    Snackbar,
    sounds
  ){
  'use strict';
  var squareOut = {
    canvas: '',
    resize: function (){
      var w,h;
      var c=[];
      if($(window).outerHeight()<$(window).outerWidth()){
        c=['.landscape','.portrait','#canvasLandscape' ];
        w=$(c[2]).parent().width();
        h=$(window).outerHeight()-15;
      }else{
        c=['.portrait','.landscape','#canvasPortrait'];
        w=$(c[2]).parent().width();
        h=$(window).outerHeight()-250;
      }

      $(c[0]).css({
        display: 'block'
      });
      $(c[1]).css({
        display: 'none'
      });

      $(c[2]).css({
        backgroundColor: 'white',
        height: h,
        width: w,
      });
      this.canvas=c[2];
      this.startGame();
    },
    init: function(soundOnff){
      if(soundOnff){

      }else{

      }

      $('#container').html(template);
      this.resize();
      $(window).on('resize',this.resize);

      Snackbar.show({
        text: 'Square Out!',
        duration: 0,
        actionText: 'Start game',
        onActionClick: function(){
          $('.snackbar-container').fadeOut(250,function(){
            this.remove();
          });
        }
      });

    },
    score: 0,
    startGame: function(){

    }
  };

  return squareOut;
});

