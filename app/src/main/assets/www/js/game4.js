/*globals window, document, define, Howl, Path, view, project, PointText, Group, Hammer*/
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
  var game4 = {
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
    rndN: function rndN(max,min){
      var rnd = Math.floor(Math.random() * max) + min;
      return rnd;
    },
    gameOver: function(){
      var self = this;
      Snackbar.show({
        text: 'Game Over! - Score: '+self.score,
        duration: 0,
        showAction: false
      });
    },
    grid: function(){
      var grid = new Group();
      var n = 10;
      var nn = 20;
      if(view.size.width>view.size.height){
        n=20;
        nn=10;
      }

      for (var i =0;i<=n;i++){
        for (var ii =0;ii<=nn;ii++){
          grid.addChild(new Path.Rectangle({
              point: [(i)*(view.size.width)/(n+1), (ii)*(view.size.height)/(nn+1)],
              size: [(view.size.width)/(n+1), (view.size.height)/(nn+1)],
              strokeColor: '#F0F0F0'
          }));
        }
      }

      return [nn+1,grid];

    },
    getPick: function(l,snakePath,lSnake){
      var aux = [];
      var snake = [];
      var i;
      for (i=0;i<l;i++){
        aux.push(i);
      }
      for(i=snakePath.length-1;i>snakePath.length-1-lSnake;i--){
        snake.push(snakePath[i]);
      }
      for (i=0;i<snake.length;i++){
        aux = aux.filter(function(item) {
          return item !== snake[i];
        });
      }
      i = this.rndN(aux.length-1,0);
      var pick = aux[i];
      return pick;

    },
    startGame: function(){
      //console.log(' ** start **');

      var self = this;
      self.score = 0;

      view.onFrame = function(){};
      project.activeLayer.removeChildren();
      view.draw();

      //clearInterval(this.interCircle);

      var aux;
      aux = self.grid();
      var lr = aux[0];
      var grid = aux[1];
      aux = undefined;

      var scoreView = new PointText({
        point: [15, 20],
        content: 'Score: '+this.score,
        fillColor: 'black',
        fontFamily: 'Courier New',
        fontSize: 15
      });

      var lrud=[];
      lrud[0]=lrud[1]=lrud[2]=lrud[3]=false;
      lrud[0]= false;

      var mc = new Hammer(document.getElementById('canvas'));
      mc.get('swipe').set({
        direction: Hammer.DIRECTION_ALL,
        threshold:  5,
        velocity:  0.1
      });
      mc.on('swipeleft swiperight swipeup swipedown', function(ev) {
        console.log(ev.type);
        var nn = 0;
        var exe = false;
        //self.sound[1].play();
        if ((ev.type==='swipeleft')&&!lrud[1]) {
          exe = true;
          nn=0;
        }
        if ((ev.type==='swipeup')&&!lrud[3]) {
          exe = true;
          nn=2;
        }
        if ((ev.type==='swipedown')&&!lrud[2]) {
          exe = true;
          nn=3;
        }
        if ((ev.type==='swiperight')&&!lrud[0]) {
          exe = true;
          nn=1;
        }
        if (exe){
          lrud[0]=lrud[1]=lrud[2]=lrud[3]=false;
          lrud[nn]=true;
        }
      });

      $(document).on('keydown', function(e) {
        var nn = 0;
        var exe = false;
        //self.sound[1].play();
        if ((e.keyCode===37)&&!lrud[1]) {
          exe = true;
          nn=0;
        }
        if ((e.keyCode===38)&&!lrud[3]) {
          exe = true;
          nn=2;
        }
        if ((e.keyCode===40)&&!lrud[2]) {
          exe = true;
          nn=3;
        }
        if ((e.keyCode===39)&&!lrud[0]) {
          exe = true;
          nn=1;
        }
        if (exe){
          lrud[0]=lrud[1]=lrud[2]=lrud[3]=false;
          lrud[nn]=true;
        }
      });

      var snakePath=[];
      var gameover = false;
      var snakeHead = lr+lr-20; //self.rndN(grid.children.length-1,0);
      snakePath[0]=snakeHead;
      var lSnake = 1;
      var pick = self.getPick(grid.children.length,snakePath);
      pick = self.getPick(grid.children.length,snakePath,lSnake);
      view.onFrame = function(e){
        if(e.count%10===0){
          //console.log(snakePath);

          if(snakePath[snakePath.length-1]!==snakeHead){
            snakePath.push(snakeHead);
          }
          if(snakePath.length>=grid.children.length){
            snakePath.shift();
          }

          if(gameover){
            self.sound[0].play();
            self.gameOver();
            view.onFrame = function(){};
          }

          if(pick===snakeHead){
            self.sound[3].play();
            self.score++;
            scoreView.content='Score: '+self.score;
            //pick = self.rndN(grid.children.length-1,0);
            pick = self.getPick(grid.children.length,snakePath,lSnake);
            lSnake++;
          }

          grid.fillColor='white';
          grid.children[pick].fillColor='red';
          grid.children[snakeHead].fillColor='black';
          for(var i=snakePath.length-1;i>snakePath.length-1-lSnake;i--){
            grid.children[snakePath[i]].fillColor='black';
          }
          var item = grid.children[snakeHead];

          var condition = ((item.point[0]===0)&&lrud[0])||
              ((item.point[0]+item.size[0]>=view.size.width)&&lrud[1])||
              ((item.point[1]===0)&&lrud[2])||
              ((item.point[1]+item.size[1]>=view.size.height)&&lrud[3]);

          //console.log(' - ');
          for(i=snakePath.length-2;i>snakePath.length-1-lSnake;i--){
            //console.log(snakePath[i]+' - '+snakeHead);
            condition=condition||(snakePath[i]===snakeHead);

          }


          if (condition){
            gameover=true;
          }else{

            if(lrud[0]){
              snakeHead=snakeHead-lr;
            }

            if(lrud[1]){
              snakeHead=snakeHead+lr;
            }

            if(lrud[2]){
              snakeHead=snakeHead-1;
            }

            if(lrud[3]){
              snakeHead=snakeHead+1;
            }
          }
        }
      };
    }
  };

  return game4;
});

