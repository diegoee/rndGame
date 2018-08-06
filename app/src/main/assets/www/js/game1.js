/*globals window, define, Promise,Howl, setTimeout, Path, Group, view, project*/
define([
  'jquery',
  'snackbar',
  'sounds',
  'paper',
  'howler'
  ],
  function(
    $,
    Snackbar,
    sounds,
    paper
  ){
  'use strict';
  var game1 = {
    $canvas: $('<canvas id="canvas"></canvas>'),
    score: 0,
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
    resize: function (gameOverFunction){
      var self = this;
      var h = $(window).outerHeight()-20;
      var w = $(window).outerWidth()-20;
      this.$canvas.css({
        backgroundColor: '#343a40',
        height: h,
        width: w,
        margin: '10px'
      });

      paper.setup(this.$canvas.attr('id'));
      var grid = self.createGrid();

      Snackbar.show({
        text: 'Game 1',
        duration: 0,
        actionText: 'Start game',
        onActionClick: function(){
          self.startGame(grid,gameOverFunction);
          $('.snackbar-container').fadeOut(250);
        }
      });

    },
    init: function(soundOnff,gameOverFunction){
      var self = this;
      $('#container').html(this.$canvas);

      this.sound=this.soundOff;
      if(soundOnff){
        this.sound=this.soundOn;
      }
      paper.install(window);

      this.resize(gameOverFunction);
      $(window).off('resize');
      $(window).on('resize',function(){
        self.resize(gameOverFunction);
      });

    },
    rndN: function rndN(max,min){
      var rnd = Math.floor(Math.random() * max) + min;
      return rnd;
    },
    createGrid: function(){
      //self.sound[parseInt($(this).attr('data'))].play();

      var self = this;
      self.score = 0;

      view.onFrame = function(){};
      project.activeLayer.removeChildren();
      view.draw();

      var grid = new Group();
      var color=new Array(2);
      color[0]=['#FF0000','#00FF00'];
      color[1]=['#0000FF','#FFFF00'];
      for (var i =0;i<2;i++){
        for (var ii =0;ii<2;ii++){
          grid.addChild(new Path.Rectangle({
              point: [(i)*(view.size.width)/2+4, (ii)*(view.size.height)/2+4],
              size: [(view.size.width)/2-8, (view.size.height)/2-8],
              fillColor: (color[i])[ii]
          }));
        }
      }

      var active = [false,false,false,false];
      var iTime = 10;
      var activeTime = [iTime,iTime,iTime,iTime];
      view.onMouseDown = function() {};
      view.onMouseDown = function(e) {
        for (var i = 0; i<grid.children.length; i++){
          if (grid.children[i].contains(e.point)) {
            self.sound[i].play();
            active[i]=true;
            activeTime[i]=iTime;
          }
        }
      };

      view.onFrame = function onFrame() {
        for (var i = 0; i<grid.children.length; i++){
          if (active[i]) {
            if (activeTime[i]>=0){
              grid.children[i].opacity = 0.5;
              activeTime[i]--;
            }else{
              grid.children[i].opacity = 1;
              activeTime[i]=iTime;
              active[i]=false;
            }
          }
        }
      };

      return grid;
    },
    startGame: function(grid,gameOverFunction){
      var self = this;

      var pGame = new Promise(function(resolve) {
        var sec = [];
        var rndN = 0;
        var round = 0;
        self.score= 0;

        ///---START---
        function gameGoOn(){
          round++;
          rndN = Math.floor((Math.random()*grid.children.length));
          sec.push(rndN);

          Snackbar.show({
            text: 'Round: '+round,
            showAction: false,
            duration: 2500
          });

          var iTime = 10;
          var slot = 40;
          var aux = iTime+slot;
          var next = 0;

          view.onMouseDown = function() {};
          view.onFrame = function onFrame() {
            if (aux===iTime+slot){
              self.sound[sec[next]].play();
            }

            if (aux>=slot){
              grid.children[sec[next]].opacity = 0.5;
            }else{
              grid.children[sec[next]].opacity = 1;
            }

            if (aux>=0){
               aux--;
            }else{
              next++;
              aux = iTime+slot;
            }

            if (next>=sec.length){
              view.onFrame = function() {};
              checkTouch();
            }

          };

          function checkTouch() {
            var next = 0;
            var active = [false,false,false,false];
            var iTime = 10;
            var activeTime = [iTime,iTime,iTime,iTime];
            view.onMouseDown = function() {};
            view.onMouseDown = function(e) {
              for (var i = 0; i<grid.children.length; i++){
                if (grid.children[i].contains(e.point)) {
                  grid.children[i].opacity = 1;
                  self.sound[i].play();
                  active[i]=true;
                  activeTime[i]=iTime;
                  //console.log(sec[next]+' '+i);
                  if(sec[next]===i){
                    next++;
                  }else{
                    resolve();
                  }
                }
              }
              if(next>=sec.length){
                view.onMouseDown = function() {};
                setTimeout(function(){
                  gameGoOn();
                },1000);
                self.score++;
              }
            };

            view.onFrame = function() {};
            view.onFrame = function onFrame() {
              for (var i = 0; i<grid.children.length; i++){
                if (active[i]) {
                  if (activeTime[i]>=0){
                    grid.children[i].opacity = 0.5;
                    activeTime[i]--;
                  }else{
                    grid.children[i].opacity = 1;
                    activeTime[i]=iTime;
                    active[i]=false;
                  }
                }
              }
            };
          }
         }
        setTimeout(function(){
          gameGoOn();
        },500);
      });

      pGame.then(function(){
        view.onMouseDown = function() {};
        view.onFrame = function() {};
        for (var i = 0; i<grid.children.length; i++){
          grid.children[i].opacity = 0.75;
        }
        Snackbar.show({
        text: 'Game Over. Final Score: '+self.score,
        duration: 0,
        actionText: 'Back to Menu!',
        onActionClick: function(){
          //self.resize();
          gameOverFunction();
        }
      });

      });

    }
  };

  return game1;
});

