/*globals window,document, define, Howl, setTimeout, clearInterval, setInterval*/
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
  var whereIsTheBall = {
    $canvas: $('<canvas id="canvas"></canvas>'),
    score: 0,
    sound: [],
    soundOn: [
      new Howl({
        src: [sounds.noteC]
      }),
      new Howl({
        src: [sounds.noteB]
      })
    ],
    soundOff: [
      {play: function(){}},
      {play: function(){}}
    ],
    resize: function (){
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
      self.startGame();

    },
    init: function(soundOnff){
      //console.log(' ** init **');
      var self = this;
      $('#container').html(this.$canvas);
      this.sound=this.soundOff;
      if(soundOnff){
        this.sound=this.soundOn;
      }
      paper.install(window);

      this.resize();
      $(window).off('resize');
      $(window).on('resize',function(){
        self.resize();
      });

    },
    startGame: function(){
      /*globals Path,Point,view,project,PointText,Group */
      //console.log(' ** start **');

      var self = this;
      self.score = 0;

      view.onFrame = function(){};
      project.activeLayer.removeChildren();
      view.draw();

      //clearInterval(this.interCircle);

      var circle = new Group();
      var n = 3;
      for (var i =0;i<n;i++){
        circle.addChild(new Path.Circle({
          center: new Point((i+1)*(view.size.width)/(n+1), view.size.height/2),
          radius: view.size.width/(2*(n+1))-view.size.width/(2*(n+1)*20),
          fillColor: 'black',//color[i],
          strokeColor: 'red',
          strokeWidth: 2
        }));
      }

      var scoreView = new PointText({
        point: [15, 20],
        content: 'Score: '+this.score,
        fillColor: 'black',
        fontFamily: 'Courier New',
        fontSize: 15
      });

      var next = 0;
      var flip = 0;
      var speed = 5;
      var nFlip = 5;

      var flipView = new PointText({
        point: [15, 40],
        content: 'Flip: '+flip+'/'+nFlip,
        fillColor: 'black',
        fontFamily: 'Courier New',
        fontSize: 15
      });

      Snackbar.show({
        text: 'Game 3',
        duration: 0,
        actionText: 'Start game',
        onActionClick: function(){
          $('.snackbar-container').fadeOut(250,function(){
            startAnimation();
          });
        }
      });

      function startAnimation(){
        flip = 0;
        next = 0;
        flipView.content='Flip: '+flip+'/'+nFlip;

        var pos = [];
        $.each(circle.children,function(){
          pos.push(this.position.x);
        });

        circle.children[0].fillColor = 'red';

        view.onFrame = function(){
          next++;
          if(next>=20){
            circle.fillColor = 'black';
            $.each(circle.children,function(i){
              if(this.position.x<pos[i]-speed){
                this.position.x+=speed;
                next = 20;
              }
              if(this.position.x>pos[i]+speed){
                this.position.x-=speed;
                next = 20;
              }
            });

            if (next===30&&flip<nFlip){
              flip++;
              flipView.content='Flip: '+flip+'/'+nFlip;
              next = 0;
              $.each(circle.children,function(i){
                this.position.x=pos[i];
              });
              var x = Math.floor(Math.random() * pos.length);
              var y = Math.floor(Math.random() * pos.length);
              var v = pos[x];
              pos[x] = pos[y];
              pos[y] = v;
              //console.log(event.count+' ** '+flip+' ** '+x+'-'+y+' ** '+pos);
            }

            if (flip>=nFlip){
              view.onFrame = function(){};
              circle.onMouseDown = function(){};
              circle.onMouseDown = function(e) {
                if (circle.children[0].contains(e.point)) {
                  self.sound[1].play();
                  if (speed<55){
                      speed=speed+5;
                    }
                  self.score++;
                  scoreView.content='Score: '+self.score;
                  Snackbar.show({
                    text: 'OK, next!',
                    showAction: false,
                    duration: 2500
                  });
                  startAnimation();
                } else {
                  self.sound[0].play();
                  circle.children[0].fillColor = 'red';
                  $.each(circle.children,function(){
                    if (this.contains(e.point)) {
                      this.fillColor = 'blue';
                    }
                  });
                  Snackbar.show({
                    text: 'Game Over! - Score: '+self.score,
                    duration: 0,
                    actionText: 'Start Again',
                    onActionClick: function(){
                      $('.snackbar-container').fadeOut(250,function(){
                        self.startGame();
                      });
                    }
                  });
                }
                this.onMouseDown = function(){};
              };

              //console.log('END');
            }
          }
        };
      }


    }
  };

  return whereIsTheBall;
});

