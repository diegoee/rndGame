/*globals window, document, define, Howl, Path, view, project, PointText, Group, setTimeout */
define([
  'jquery',
  'snackbar',
  'sounds',
  'paper',
  'hammer',
  'howler'
  ],
  function(
    $,
    Snackbar,
    sounds,
    paper
  ){
  'use strict';
  var game5 = {
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
        backgroundColor: 'white',
        height: h,
        width: w,
        margin: '10px'
      });

      paper.setup(this.$canvas.attr('id'));
      self.startGame(gameOverFunction);

    },
    init: function(soundOnff,gameOverFunction ){
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
    gameOver: function(gameOverFunction){
      var self = this;
      self.sound[0].play();
      Snackbar.show({
        text: 'Game Over! - Score: '+self.score,
        duration: 0,
        actionText: 'Back to Menu!',
        onActionClick: function(){
          //self.startGame();
          gameOverFunction();
        }
      });
    },
    startGame: function(gameOverFunction){
      var self = this;
      self.score = 0;

      view.onFrame = function(){};
      project.activeLayer.removeChildren();
      view.draw();

      var scoreView = new PointText({
        point: [15, 20],
        content: 'Score: '+this.score,
        fillColor: 'black',
        fontFamily: 'Courier New',
        fontSize: 15
      });

      var n = 4;
      var floor = new Path.Rectangle({
        point: [0, (n-1)*(view.size.height)/n],
        size: [view.size.width, (view.size.height)/4],
        fillColor: '#000000'
      });

      var radius = 20;
      var w = view.size.width/4;
      var h = (n-1)*(view.size.height)/n-radius;
      var ball = new Path.Circle({
        center: [w,h],
        radius: radius,
        fillColor: 'black',//color[i],
        strokeColor: 'red',
        strokeWidth: 2
      });

      var jumpOn = [0,0];
      var counter = [0,0];


      $(document).off('keydown');
      $(document).one('keydown',function(e){
        if(e.keyCode==32){
          go();
          $('.snackbar-container').fadeOut(250);
        }
      });

      var walls = new Group();

      Snackbar.show({
        text: 'Go!!',
        duration: 0,
        actionText: 'Press to start',
        onActionClick: function(){
          go();
          $('.snackbar-container').fadeOut(250);
        }
      });

      function go(){

        view.onMouseDown = function() {
            self.sound[3].play();
            if(jumpOn[0]>0){
                jumpOn[1] = 1;
                counter[1] = 0;
            }
            jumpOn[0] = 1;
            counter[0] = 0;
        };

        $(document).off('keydown');
        $(document).on('keydown',function(e){
          if(e.keyCode==32){
            view.onMouseDown();
            if(view.onFrame===null){
                 self.startGame();
             }
          }
        });

        self.sound[1].play();
        view.onFrame = function(e){

          for (var i=0; i<jumpOn.length; i++){
            counter[i] = counter[i] +0.075;
            jumpOn[i]  = jumpOn[i]  -0.05;
            if(jumpOn[i]<0){
              jumpOn[i]=0;
            }
          }
          var jump = [(view.size.height)*Math.sin(counter[0]),(view.size.height/2)*Math.sin(counter[1])];
          ball.position.y = h-jumpOn[0]*jump[0]-jumpOn[1]*jump[1];
          //console.log(ball.position.y);

          for (i = 0; i<walls.children.length; i++) {
            walls.children[i].position.x=walls.children[i].position.x-10;

            if (view.size.width/20+walls.children[i].position.x<0){
              walls.children[i].remove();
              self.score++;
              scoreView.content='Score: '+self.score;
              break;
            }
          }

          if(e.count%25===0){
            var hh = h+radius-view.size.height/16;
            var ss = view.size.height/16;
            var rr = self.rndN(2,0);
            if(rr===1){
              hh = 0;
              ss = view.size.height-floor.bounds.height-ball.bounds.height-10;
            }
            walls.addChild( new Path.Rectangle({
              point: [view.size.width, hh],
              size: [view.size.width/20, ss],
              fillColor: 'black',//color[i],
              strokeColor: 'red',
              strokeWidth: 2
            }));

          }

          var intersections=0;
          $.each(walls.children,function(){
            intersections = ball.getIntersections(this);
            intersections = intersections.length;
            //console.log(this.bounds.width);
            if(intersections!==0){
              this.fillColor='red';
              view.onFrame = null;
              self.gameOver(gameOverFunction);
            }
          });

        };
      }

    }
  };

  return game5;
});

