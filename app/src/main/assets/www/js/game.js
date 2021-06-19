/*globals window, define, Howl, clearInterval, setInterval*/
define([
  'jquery',  
  'sounds',
  'paper',
  'howler',
  'bootstrap'
  ],
  function(
    $, 
    sounds,
    paper
  ){
  'use strict';
  var game = {
    modalOver: '<div class="modal fade" id="modalOver">  <div class="modal-dialog modal-dialog-centered" role="document">    <div class="modal-content">       <div class="modal-body">      <div class="container">        <div class="row"> <div class="col-12 centerE">Score:</div>        <div class="col-12">            <div id="score" class="text-center p-5 h1"></div>          </div>         <div class="col-12">            <button type="button" class="btn btn-block btn-xs btn-outline-dark" data-dismiss="modal">Back to Menu</button>          </div>        </div>       </div>    </div>  </div></div>',    
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
    rndN: function(max,min){
      return Math.floor(Math.random() * max) + min;
    },
    resize: function (){ 
      this.$canvas.css({
        backgroundColor: 'white',
        height: $(window).outerHeight(),
        width: $(window).outerWidth(),
      });
    },
    init: function(soundOnff,fnEnd){
      var self = this;
      this.sound=this.soundOff;
      if(soundOnff){
        this.sound=this.soundOn;
      }
      
      $('#container').html(this.$canvas);
      $('#container').append(this.modalOver);
      this.resize();
      $(window).off('resize');
      $(window).on('resize',function(){
        self.resize();
        self.startGame();
      }); 
       
      paper.install(window);
      paper.setup(this.$canvas.attr('id')); 
      self.startGame(fnEnd);

    },
    gameOverSnackBar: function(fnEnd){ 
      var self = this;
      $('#score').html(self.score);
      $('#modalOver').on('hidden.bs.modal',function(){
        fnEnd(self.score);
      });
      $('#modalOver').modal({
        backdrop: 'static', 
        keyboard: false
      }); 
    },
    score: 0,  
    startGame: function(fnEnd){
      /*globals Path,Point,view,project,PointText,Group */
      var self = this;
      self.score = 0; 
      self.$canvas.css({
        backgroundColor: 'white'
      });
      view.onFrame = function(){};
      project.activeLayer.removeChildren();
      view.draw();
      clearInterval(this.interCircle);

      var circle = new Group();
      var shoots = new Group();
      
      var rect = new Path.Rectangle({
        point: new Point(0,view.size.height-5),
        size: [view.size.width,5],
        fillColor: 'black'
      });

      var scoreView = new PointText({
        point: [15, 20],
        content: 'Score: '+this.score,
        fillColor: 'black',
        fontFamily: 'Courier New',
        fontSize: 15
      });
 
      function createCircle(){
        circle.addChild(new Path.Circle({
          center: new Point(self.rndN(Math.floor((view.size.width-10)),(10)/2), 5),
          radius: self.rndN(15,10),
          fillColor: 'black',
          strokeColor: 'red',
          strokeWidth: 2
        }));
      }

      this.interCircle = setInterval(createCircle,250);

      function createShoot(x){
        self.score--; 
        scoreView.content='Score: '+self.score; 
        self.sound[self.rndN(self.sound.length-1,0)].play();
        shoots.addChild(new Path.Circle({
          center: new Point(x, view.size.height-5),
          radius: 10,
          fillColor: 'grey'
        })); 
      } 
      var moveShoot=false;

      var counter = 0;
      var posX = 0;
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
          if(circle.strokeWidth===0){
            circle.strokeWidth=2;
          }else{
            circle.strokeWidth=0;
          }
        }  

         //Check intersections
        $.each(circle.children,function(){
          auxInter = rect.getIntersections(this);
          intersections +=auxInter.length;
        });

        if (intersections>0){  
          self.sound[self.rndN(self.sound.length-1,0)].play();
          //gameOver 
          clearInterval(self.interCircle);
          self.$canvas.css({
            backgroundColor: 'black'
          });
          shoots.removeChildren();

          view.onFrame = function(){};
          circle.fillColor='red';
          rect.fillColor='red';
          self.gameOverSnackBar(fnEnd); 
        }

        //Path move 
        $.each(circle.children,function(){
          this.position.y+=this.bounds.width/20;
        });

        $.each(shoots.children,function(){
          this.position.y-=8;
        });

        /*
        $.each(circle.children,function(){
          if(this.position.y>view.size.height){
            self.score=self.score+5;
            scoreView.content='Score: '+self.score;
          }
        });
        */

        //Remove items
        for (i=circle.children.length-1; i >=0; i--){
          if(circle.children[i].position.y>view.size.height){
            circle.children[i].remove();
          }
        }
        
        for (i=shoots.children.length-1; i >=0; i--){
          if(shoots.children[i].position.y<0){
            shoots.children[i].remove();
          }
        }

        for (i=circle.children.length-1; i >=0; i--){
          for (j=shoots.children.length-1; j >=0; j--){
            auxInter = circle.children[i].getIntersections(shoots.children[j]);
            if(auxInter.length>0){
              self.sound[2].play();
              shoots.children[j].remove();
              circle.children[i].remove();
              self.score=self.score+5;
              scoreView.content='Score: '+self.score;
              break;
            }
          }
          if(auxInter.length>0){
            break;
          }
        }

        //Actions
        if(moveShoot){
          moveShoot=false;
          createShoot(posX);
        }

      };

      //Action;
      this.$canvas.on('mousedown touchstart', function(e){ 
        posX = e.clientX!==undefined?e.clientX:e.touches[0].clientX; 
        moveShoot=true;
      }).on('mouseup mouseleave touchsend', function() {
        moveShoot=false;
      });
    }
  };

  return game;
});

