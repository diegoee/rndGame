/*globals window, define, Promise,Howl, noteC, noteB, noteE, noteG, setTimeout*/
define([
  'jquery',
  'text!template/memoGame.html',
  'snackbar',
  'howler',
  'notes'
  ],
  function(
    $,
    template,
    Snackbar
  ){
  'use strict';
  var memoGame = {
    sound: [
      new Howl({
        src: [noteC]
      }),
      new Howl({
        src: [noteE]
      }),
      new Howl({
        src: [noteG]
      }),
      new Howl({
        src: [noteB]
      })
    ],
    resize: function (){
      $('#body').innerHeight($(window).innerHeight());
    },
    init: function(){

      $('#container').html(template);
      var self= this;

      self.resize();
      $(window).on('resize',self.resize);
      $('.menoBtn').on('click',function(){
        self.sound[parseInt($(this).attr('data'))].play();
      });

      Snackbar.show({
        text: 'The MemoGame!',
        duration: 10000,
        actionText: 'Start game',
        onActionClick: function() {
         self.startGame();
       }
      });

    },
    score: 0,
    startGame: function(){
      var self = this;

      var $squares = $('.menoBtn');

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
            //console.log('repro secuence');
            function repro(){
              //console.log('repro - n='+ii+' - element='+sec[ii]);
              $squares.off('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd');
              $($squares[sec[ii]]).addClass('active');
              self.sound[sec[ii]].play();
              $($squares[sec[ii]]).on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
                $($squares[sec[ii]]).removeClass('active');
                ii++;
                if (ii<sec.length){
                  setTimeout(function(){
                    repro();
                  },250);
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
            //console.log('check secuence');
            var checkSec = 0;
            $squares.addClass('pointer');
            $squares.on('click',function(){
              //console.log('check - click='+$(this).attr('data')+' - sec='+sec[checkSec]);
              self.sound[parseInt($(this).attr('data'))].play();
              if (parseInt($(this).attr('data'))===sec[checkSec]){
                checkSec++;
                if(checkSec<sec.length){
                  Snackbar.show({
                    text: 'Good! Carry on..('+checkSec+'/'+sec.length+')',
                    showAction: false,
                    duration: 500
                  });
                }else{
                  Snackbar.show({
                    text: 'Good! complete('+checkSec+'/'+sec.length+')',
                    showAction: false,
                    duration: 500
                  });
                  self.score++;
                  gameGoOn();
                }
              }else{
                Snackbar.show({
                  text: 'Fail! (it was '+(sec[checkSec]+1)+' and you click '+(parseInt($(this).attr('data'))+1)+')',
                  showAction: false,
                  duration: 500
                });
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
        Snackbar.show({
          text: 'Game Over!',
          showAction: false,
          duration: 2500
        });
      });

    }
  };

  return memoGame;
});

