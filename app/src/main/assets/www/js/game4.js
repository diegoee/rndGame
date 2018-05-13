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
    startGame: function(){
      /*globals Path,Point,view,project,PointText,Group */
      console.log(' ** start **');

      var self = this;
      self.score = 0;

      view.onFrame = function(){};
      project.activeLayer.removeChildren();
      view.draw();

      //clearInterval(this.interCircle);

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

      var scoreView = new PointText({
        point: [15, 20],
        content: 'Score: '+this.score,
        fillColor: 'black',
        fontFamily: 'Courier New',
        fontSize: 15
      });

      var control = new Group();
      n = 3;
      for (var j =0;j<n;j++){
        for (var jj =0;jj<n;jj++){
          control.addChild(new Path.Rectangle({
            point: [(j)*(view.size.width)/(n), (jj)*(view.size.height)/(n)],
            size: [(view.size.width)/(n), (view.size.height)/(n)],
            //fillColor: 'black',
            strokeColor: 0xF0F0F0
          }));
        }
      }

      var lrud=[];
      lrud[0]=lrud[1]=lrud[2]=lrud[3]=false;
      lrud[0]=true;

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

      var snake=[];
      var gameover= false;
      snake[0]=self.rndN(grid.children.length-1,0);
      view.onFrame = function(e){
        if(e.count%20===0){

          if(lrud[0]){

          }

          if(lrud[1]){
          }

          if(lrud[2]){
            snake[0]=snake[0]-1;
          }

          if(lrud[3]){
            snake[0]=snake[0]+1;
          }

          var item =grid.children[snake[0]];
          if ((item.point[0]===0)||(item.point[1]===0)){
            gameover=true;
          }
          if ((item.point[0]+item.size[0]>=view.size.width)||(item.point[1]+item.size[1]>=view.size.height)){
            gameover=true;
          }

          //console.log((item.point[0]+item.size[0])+','+(item.point[1]+item.size[1])+' <-> '+[view.size.width,view.size.height]);

          grid.fillColor='white';
          grid.strokeColor= '#F0F0F0';
          for(var i=0;i<snake.length;i++){
            grid.children[snake[i]].fillColor='black';
          }

          if(gameover){
            self.gameOver();
            view.onFrame = function(){};
          }else{

          }
        }
      };
    }
  };

  return whereIsTheBall;
});

