/*globals window,document, define, Howl, setTimeout, clearInterval, setInterval*/
define([
  'jquery',
  'text!template/squareOut.html',
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
  var squareOut = {
    $canvas: $('<canvas id="canvas"></canvas>'),
    interCircle: undefined,
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
      if(soundOnff){

      }else{

      }

      $('#container').html(template);
      this.resize();
      $(window).on('resize',function(){
        self.resize();
        self.startGame();
      });

      Snackbar.show({
        text: 'Square Out!',
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
    startGame: function(){
      /*globals Path,Point,view,project,PointText */
      var self = this;
      self.score=0;
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

      var scoreView = new PointText({
        point: [15, 20],
        content: 'Score: '+this.score,
        fillColor: 'black',
        fontFamily: 'Courier New',
        fontSize: 15
      });

      function rndN(max,min){
        var rnd = Math.floor(Math.random() * max) + min;
        return rnd;
      }

      var circle=[];
      function createCircle(){
        circle.push(new Path.Circle({
          center: new Point(rndN(Math.floor((view.size.width-10)),(10)/2), 5),
          radius: rndN(8,4),
          fillColor: 'balck',
          strokeColor: 'red',
          strokeWidth: 2
        }));
      }
      createCircle();
      this.interCircle = setInterval(createCircle,250);

      var moveLeft=false;
      var moveRight=false;

      var counter=0;
      view.onFrame = function(){
        counter++;

        //Animations
        if (counter%10===0){
          $.each(circle,function(){
            (this.strokeWidth===0)?this.strokeWidth=2:this.strokeWidth=0;
          });
        }

        //Check intersections
        var intersections = 0;
        $.each(circle,function(){
          var aux = rect.getIntersections(this);
          intersections +=aux.length;
        });

        if (intersections>0){
          gameOver();
        }

        //Path move
        var rCircle=[];
        $.each(circle,function(i){
          this.position.y+=this.bounds.width/10;
          if(this.position.y>view.size.height){
            rCircle.push(i);
            self.score++;
            scoreView.content='Score: '+self.score;
          }
        });

        for (var i=rCircle.length-1; i >=0; i--){
          circle[rCircle[i]].remove();
          circle.splice(rCircle[i],1);
        }

        //Actions
        if(moveLeft){
          if(rect.position.x-rect.size[0]/2>0){
            rect.position.x-=5;
          }
        }
        if(moveRight){
          if(rect.position.x<view.size.width-rect.size[0]/2){
            rect.position.x+=5;
          }
        }
      };

      function gameOver(){
        rect.fillColor='red';
        clearInterval(self.interCircle);
        self.$canvas.css({
          backgroundColor: 'black'
        });
        view.onFrame = function(){};
        $.each(circle,function(){
          this.fillColor='red';
        });
        self.gameOverSnackBar();
      }

      // Draw the view now:
      //view.draw();

      //Action;
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

  return squareOut;
});

