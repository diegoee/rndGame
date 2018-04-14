/*globals window, define, Promise,Howl, setTimeout*/
define([
  'jquery',
  'text!template/memoGame.html',
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
  var memoGame = {
    sound: [],
    soundOn: [
      new Howl({
        src: [sounds.noteC]
      }),
      new Howl({
        src: [sounds.noteE]
      }),
      new Howl({
        src: [sounds.noteG]
      }),
      new Howl({
        src: [sounds.noteB]
      })
    ],
    soundOff: [
      {play: function(){}},
      {play: function(){}},
      {play: function(){}},
      {play: function(){}}
    ],
    resize: function (){
      $('#body').innerHeight($(window).innerHeight());
    },
    init: function(soundOnff){
      this.sound=this.soundOff;
      if(soundOnff){
        this.sound=this.soundOn;
      }

      $('#container').html(template);
      var self= this;

      self.resize();
      $(window).on('resize',self.resize);
      $('.menoBtn').off('click');
      $('.menoBtn').on('click',function(){
        self.sound[parseInt($(this).attr('data'))].play();
      });

      Snackbar.show({
        text: 'The MemoGame!',
        duration: 0,
        actionText: 'Start game',
        onActionClick: function(){
          self.startGame();
        }
      });

    },
    score: 0,
    startGame: function(){
      var self = this;

      var $squares = $('.menoBtn');
      $squares.removeClass('active');
      $squares.off('click');
      $squares.on('click',function(){
        self.sound[parseInt($(this).attr('data'))].play();
      });

      var pGame = new Promise(function(resolve) {
        console.log('Promise created');
        var sec = [];
        var rndN = 0;
        var round = 0;
        self.score= 0;

        ///---START---
        function gameGoOn(){
          round++;
          rndN = Math.floor((Math.random()*$squares.length));
          sec.push(rndN);

          Snackbar.show({
            text: 'Round: '+round,
            showAction: false,
            duration: 2500
          });

          $squares.off('click');

          var ii = 0;
          var p1 = new Promise(function(resolve){
            function repro(){
              $squares.off('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd');
              $($squares[sec[ii]]).addClass('active');
              self.sound[sec[ii]].play();
              $($squares[sec[ii]]).on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
                $($squares[sec[ii]]).removeClass('active');
                ii++;
                if (ii<sec.length){
                  setTimeout(function(){
                    repro();
                  },200);
                }else{
                  resolve();
                }
              });
            }
            setTimeout(function(){
              repro();
            },1000);

          });

          p1.then(function(){
            var checkSec = 0;
            $squares.addClass('pointer');
            $squares.on('click',function(){
              self.sound[parseInt($(this).attr('data'))].play();
              if (parseInt($(this).attr('data'))===sec[checkSec]){
                checkSec++;
                if(checkSec<sec.length){
                }else{
                  self.score++;
                  gameGoOn();
                }
              }else{
                resolve();
                return;
              }
            });
          });
        }
        gameGoOn();

      });

      pGame.then(function(){
        console.log('Promise then');
        $squares.off('click');
        $squares.addClass('active');
        Snackbar.show({
          pos: 'bottom-left',
          text: 'Game Over - Score: '+self.score+' Round(s)',
          duration: 0,
          onActionClick: function(){
            self.startGame();
          },
          actionText: 'Again!',
        });
      });

    }
  };

  return memoGame;
});

