/*globals window,document, define, Howl, setTimeout, clearInterval, setInterval, Path,Point,view,project,PointText,Group */
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
        actionText: 'play again!',
        onActionClick: function(){
          self.init();
          $('.snackbar-container').fadeOut(250);
        }
      });
    },
    grid: function(){
      var grid = new Group();
      var n = 1;
      var nn = 30;
      //console.log('Getting square');
      var exit = false;
      var counter = 0;
      while(!exit){
        if(Math.floor((view.size.width)/(n+1))!==Math.floor((view.size.height)/(nn+1))){
          n=n+1;
        }else{
          //console.log('Exit by condition');
          exit = true;
        }
        counter++;
        if (counter>100){
          //console.log('Exit by counter');
          exit = true;
        }
      }
      //console.log(n+' X '+nn);
      //console.log((view.size.width)/(n+1)+' X '+(view.size.height)/(nn+1));
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
    control: function(){
      var control = new Group();
      var n = 3;
      for (var j =0;j<n;j++){
        for (var jj =0;jj<n;jj++){
          control.addChild(new Path.Rectangle({
            point: [(j)*(view.size.width)/(n), (jj)*(view.size.height)/(n)],
            size: [(view.size.width)/(n), (view.size.height)/(n)]
          }));
        }
      }
      return control;

    },
    startGame: function(){
      console.log(' ** start **');

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

      var control = self.control();

      var lrud=[];
      lrud[0]=lrud[1]=lrud[2]=lrud[3]=false;
      lrud[0]= false;

      view.on('mousedown', function(e) {
        var n = 0;
        var nn = 0;
        var exe = false;
        if (control.children[1].contains(e.point)) {
          exe = true;
          n=1;
          nn=0;
        }
        if (control.children[3].contains(e.point)) {
          exe = true;
          n=3;
          nn=2;
        }
        if (control.children[5].contains(e.point)) {
          exe = true;
          n=5;
          nn=3;
        }
        if (control.children[7].contains(e.point)) {
          exe = true;
          n=7;
          nn=1;
        }
        if (exe){
          lrud[0]=lrud[1]=lrud[2]=lrud[3]=false;
          lrud[nn]=true;
          control.children[n].fillColor='grey';
          setTimeout(function(){
            control.children[n].fillColor=null;
          },250);
          //console.log(lrud);
        }
      });

      var snakePath=[];
      var gameover = false;
      var snakeHead = lr+lr-20; //self.rndN(grid.children.length-1,0);
      snakePath[0]=snakeHead;
      var lSnake = 1;
      var pick = self.rndN(grid.children.length-1,0);
      pick = snakeHead+3;
      view.onFrame = function(e){
        if(e.count%20===0){
          console.log(snakePath);

          if(snakePath[snakePath.length-1]!==snakeHead){
            snakePath.push(snakeHead);
          }
          if(snakePath.length>=grid.children.length){
            snakePath.shift();
          }

          if(gameover){
            self.gameOver();
            view.onFrame = function(){};
          }

          if(pick===snakeHead){
            self.score++;
            scoreView.content='Score: '+self.score;
            //pick = self.rndN(grid.children.length-1,0);
            pick = snakeHead+3;
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

