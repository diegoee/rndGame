/*globals window,document, define, Howl, setTimeout, clearInterval, setInterval*/
define([
  'jquery',
  'text!template/game2.html',
  'snackbar',
  'sounds',
  'paper',
  'howler'
  ],
  function(
    $,
    template,
    Snackbar,
    sounds,
    paper
  ){
  'use strict';
  var game2 = {
    $canvas: $('<canvas id="canvas"></canvas>'),
    interCircle: undefined,
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
      var w,h;
      var c=[];
      if($(window).outerHeight()<$(window).outerWidth()){
        c=['.landscape','.portrait','#canvasLandscapeContainer' ];
        h=$(window).outerHeight()-15;
      }else{
        c=['.portrait','.landscape','#canvasPortraitContainer'];
        h=$(window).outerHeight()-250;
      }

      w=$(c[2]).width();
      $(c[0]).css({
        display: 'block'
      });
      $(c[1]).css({
        display: 'none'
      });
      $(c[2]).append(this.$canvas);
      this.$canvas.css({
        backgroundColor: 'white',
        height: h,
        width: w,
      });
    },
    init: function(soundOnff){
      var self = this;
      this.sound=this.soundOff;
      if(soundOnff){
        this.sound=this.soundOn;
      }

      $('#container').html(template);
      this.resize();
      $(window).off('resize');
      $(window).on('resize',function(){
        self.resize();
        self.startGame();
      });

      Snackbar.show({
        text: 'Game 2',
        duration: 0,
        actionText: 'Start game',
        onActionClick: function(){
          $('.snackbar-container').fadeOut(250,function(){
            self.startGame();
          });
        }
      });
      paper.install(window);
      paper.setup(this.$canvas.attr('id'));

    },
    gameOverSnackBar: function(){
      var self = this;
      Snackbar.show({
        text: 'Game Over! - Score: '+self.score,
        duration: 0,
        actionText: 'play again!',
        onActionClick: function(){
          self.startGame();
          $('.snackbar-container').fadeOut(250);
        }
      });
    },
    score: 0,
    nShoot: 3,
    startGame: function(){
      /*globals Path,Point,view,project,PointText,Group */
      var self = this;
      self.score = 0;
      self.nShoot = 3;
      self.$canvas.css({
        backgroundColor: 'white'
      });
      view.onFrame = function(){};
      project.activeLayer.removeChildren();
      view.draw();
      clearInterval(this.interCircle);

      var rect = new Path.Rectangle({
        point: new Point((view.size.width-50)/2,(view.size.height-50)-5),
        size: [50, 50],
        fillColor: 'black'
      });

      var circle = new Group();
      var shoots = new Group();

      var scoreView = new PointText({
        point: [15, 20],
        content: 'Score: '+this.score,
        fillColor: 'black',
        fontFamily: 'Courier New',
        fontSize: 15
      });

      var shootsView = new PointText({
        point: [15, 40],
        content: 'shoots: '+this.nShoot,
        fillColor: 'black',
        fontFamily: 'Courier New',
        fontSize: 15
      });

      function rndN(max,min){
        var rnd = Math.floor(Math.random() * max) + min;
        return rnd;
      }

      function createCircle(){
        circle.addChild(new Path.Circle({
          center: new Point(rndN(Math.floor((view.size.width-10)),(10)/2), 5),
          radius: rndN(8,4),
          fillColor: 'black',
          strokeColor: 'red',
          strokeWidth: 2
        }));
      }

      this.interCircle = setInterval(createCircle,250);

      function createShoot(x){
        if (self.nShoot>0){
          self.sound[3].play();
          shoots.addChild(new Path.Circle({
            center: new Point(x, (view.size.height-55)-5),
            radius: 4,
            fillColor: 'grey'
          }));
          self.nShoot--;
        }
      }

      var moveLeft=false;
      var moveRight=false;
      var moveShoot=false;

      var counter=0;
      var intersections = 0;
      var i=0;
      var j=0;
      var auxInter=[];
      view.onFrame = function(){
        counter++;
        intersections = 0;
        auxInter=[];

        //Animations
        if (counter%10===0){
          (circle.strokeWidth===0)?circle.strokeWidth=2:circle.strokeWidth=0;
        }
        shootsView.content='shoots: '+self.nShoot;
        if (counter%500===0){
          if(self.nShoot<4){
            self.nShoot++;
          }
        }

         //Check intersections
        $.each(circle.children,function(){
          auxInter = rect.getIntersections(this);
          intersections +=auxInter.length;
        });

        if (intersections>0){
          //gameOver
          self.sound[0].play();

          rect.fillColor='red';
          clearInterval(self.interCircle);
          self.$canvas.css({
            backgroundColor: 'black'
          });
          shoots.removeChildren();

          view.onFrame = function(){};
          circle.fillColor='red';
          rect.fillColor='red';
          self.gameOverSnackBar();
        }

        //Path move
        console.log(circle.children.length);
        $.each(circle.children,function(){
          this.position.y+=this.bounds.width/10;
        });

        $.each(shoots.children,function(){
          this.position.y-=4;
        });

        $.each(circle.children,function(){
          if(this.position.y>view.size.height){
            self.score++;
            scoreView.content='Score: '+self.score;
          }
        });

        //Remove items
        for (i=circle.children.length-1; i >=0; i--){
          if(circle.children[i].position.y>view.size.height){
            circle.children[i].remove();
          }
        }

        for (i=circle.children.length-1; i >=0; i--){
          for (j=shoots.children.length-1; j >=0; j--){
            auxInter = circle.children[i].getIntersections(shoots.children[j]);
            if(auxInter.length>0){
              self.sound[2].play();
              shoots.children[j].remove();
              circle.children[i].remove();
              break;
            }
          }
          if(auxInter.length>0){
            break;
          }
        }

        //Actions
        if(moveLeft){
          if(rect.position.x-rect.size[0]/2>0){
            rect.position.x-=2;
          }
        }
        if(moveRight){
          if(rect.position.x<view.size.width-rect.size[0]/2){
            rect.position.x+=2;
          }
        }
        if(moveShoot){
          moveShoot=false;
          createShoot(rect.position.x);
        }

      };

      //Action;
      $('canvas').on('mousedown touchstart', function() {
         moveShoot=true;
      }).on('mouseup mouseleave touchsend', function() {
         moveShoot=false;
      });
      $('.btnCenter').on('mousedown touchstart', function() {
         moveShoot=true;
      }).on('mouseup mouseleave touchsend', function() {
         moveShoot=false;
      });
      $('.btnLeft').on('mousedown touchstart', function() {
         moveLeft=true;
      }).on('mouseup mouseleave touchsend', function() {
         moveLeft=false;
      });
      $('.btnRight').on('mousedown touchstart', function() {
         moveRight=true;
      }).on('mouseup mouseleave touchsend', function() {
         moveRight=false;
      });
    }
  };

  return game2;
});

