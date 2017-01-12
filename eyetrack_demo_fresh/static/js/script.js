$(document).ready(function() {

    // flask socketio connection
    
    var socket = io.connect('http://' + document.domain + ':' + location.port + '/test');
    socket.on('my response', function(msg) {
      $('#log').append('<p>Received: ' + msg.data + '</p>');
    });
    $('form#emit').submit(function(event) {
      socket.emit('my event', {data: $('#emit_data').val()});
      return false;
    });
    $('form#broadcast').submit(function(event) {
      socket.emit('my broadcast event', {data: $('#broadcast_data').val()});
      return false;
    });

    // $('form#start').submit(function(event) {
    //     socket.emit('start recording', {data: $('#start_data').val()});
    //     console.log('start')
    //     return false;
    // });
    
    //start and stop buttons
    var continueAnimating = true;
    $('#play').click(function() {
      continueAnimating = true;
      circularMotion2();
      // ballCircle();
    });

    $('#stop').click(function() {
      continueAnimating = false;
      circularMotion2();
    });

    // get position of ball -- 4 testing
    $('#btn-pos').click(function() {
      console.log(getBallPosition(the_ball));
    });

    // dropdown
    $(".dropdown-menu li a").click(function(){
      $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
      $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
    });



    /** --------------------------------------------------------------------------------------------------------
    * ----------------------------------------------------------------------------------------------------------
    * Source: http://www.html5code.nl/canvas-tutorial/tutorial-canvas-animation-circular-movement/
    *
    * Normalize the browser animation API for all applications. 
    * This asks the browser make a a schedule for redrawing an initial situation 
    * of the screen for the next animation frame .
    * Checks for cross-browser support, and, if not present,
    * defines a fallback to the clearTimeout function.
    * @param {function} callback.  Function to call when it's time to update 
    * the animation for the next redesign. 
    * @param {HTMLElement} element   Optional parameter that specifies the 
    * element which defines the entire animation.
    * @return {number} Animation frame request.
    */
      if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = (window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        function (callback) {
          return window.setTimeout(callback, 17 /*~ 1000/60*/);
        });
      }
    /**
    * Cancels a request for an animation frame.
    * Checks for cross-browser support, with a fallback to the clearTimeout function
    * @param {number}  Animation frame request.
    */
    if (!window.cancelRequestAnimationFrame) {
      window.cancelRequestAnimationFrame = (window.cancelAnimationFrame ||
      window.webkitCancelRequestAnimationFrame ||
      window.mozCancelRequestAnimationFrame ||
      window.msCancelRequestAnimationFrame ||
      window.oCancelRequestAnimationFrame ||
      window.clearTimeout);
    }



    function checkForCanvasSupport() {
      return !!document.createElement('some_canvas').getContext;
    }


    // JavaScript Document
    function Ball (x,y,radius,color,strokeColor,lineWidth) {
      //ball2 = new Ball(2, Math.random() * 0xffffff,20,'#a3caff','#f00',1);
      if (x === undefined) { x = 0; }
      if (y === undefined) { y = 0; }
      if (radius === undefined) { radius = 20; }
      if (color === undefined) { color = "#f00"; }
      if (strokeColor === undefined) { strokeColor = "#000"; }
      if (lineWidth === undefined) { lineWidth = "7"; }
      this.radius=radius;
      //this.color = service.parseColor(color);
      this.color = color;
      this.strokeColor=strokeColor;
      this.lineWidth = lineWidth;
      this.x = x;
      this.y = y;
      this.rotation = 0;
      this.scaleX = 1;
      this.scaleY = 1;
      //this.vx = 0;
      //this.vy = 0;
    }
      
    Ball.prototype.draw = function (context) {
      context.save();
      context.rotate(this.rotation);
      context.scale(this.scaleX, this.scaleY);
      context.lineWidth = this.lineWidth;
      context.fillStyle = this.color;
      context.beginPath();
      //x, y, radius, start_angle, end_angle, anti-clockwise
      context.arc(this.x, this.y, this.radius, 0, (Math.PI * 2), true);
      //x, y, radius, start_angle, end_angle, anti-clockwise
      context.closePath();
      context.fill();
      if (this.lineWidth > 0) {
      context.stroke();
      }  
      context.restore();
      };

    Ball.prototype.getBounds = function () {
      return {
        x: this.x - this.radius,
        y: this.y - this.radius,
        width: this.radius * 2,
        height: this.radius * 2
      };
    };

    function Balla (x,y,radius,color,strokeColor,lineWidth) {
      //ball2 = new Ball(2, Math.random() * 0xffffff,20,'#a3caff','#f00',1);
      if (x === undefined) { x = 0; }
      if (y === undefined) { y = 0; }
      if (radius === undefined) { radius = 20; }
      if (color === undefined) { color = "#f00"; }
      if (strokeColor === undefined) { strokeColor = "#000"; }
      if (lineWidth === undefined) { lineWidth = "7"; }
      this.radius=radius;
      //this.color = service.parseColor(color);
      this.color = color;
      this.strokeColor=strokeColor;
      this.lineWidth = lineWidth;
      this.x = x;
      this.y = y;
      this.rotation = 0;
      this.scaleX = 1;
      this.scaleY = 1;
      //this.vx = 0;
     // this.vy = 0;
       }
      
    Balla.prototype.draw = function (context) {
      context.save();
      context.rotate(this.rotation);
      context.scale(this.scaleX, this.scaleY);
      context.lineWidth = this.lineWidth;
      context.fillStyle = this.color;
      context.beginPath();
      //x, y, radius, start_angle, end_angle, anti-clockwise
      context.arc(this.x, this.y, this.radius, 0, (Math.PI * 2), true);
      //x, y, radius, start_angle, end_angle, anti-clockwise
      context.closePath();
      context.fill();
      if (this.lineWidth > 0) {
      context.stroke();
      }  
      context.restore();
      };

    Balla.prototype.getBounds = function () {
      return {
        x: this.x - this.radius,
        y: this.y - this.radius,
        width: this.radius * 2,
        height: this.radius * 2
      };
    };


    // my function to return the ball's current position within the canvas pane
    function getBallPosition(ball) {
      // var canvas_x = $('#canvas').position().left;
      // var canvas_y = $('#canvas').position().top;
      var pos = {x: ball.x, y: ball.y};
      return pos;
    }
    // my variable to keep track of the ball canvas drawing
    var the_ball = null;

    function circularMotion2(){
      var centerX;
      var centerY;
      var rotationRadius=200;
      var time;
      var degrees = 0;
      var Angle;
      var x;
      var y;
      var canvas = jQuery("#canvas");
      var context = canvas.get(0).getContext("2d");
      context.canvas.width = window.innerWidth;
      //function Ball(x,y,radius,color,strokeColor,lineWidth) in ball.js
      var ball_2 = new Ball(-10,-10,20,'#f16529','#000',7);
      
      //get the current state of the ball drawing
      the_ball = ball_2;

      var parentWidth=jQuery(canvas).parent().width();
      var canvasWidth=context.canvas.width = parentWidth;
      
      if (!checkForCanvasSupport) {
      return;
      }
       
      (function drawFrame() {
        if (!continueAnimating) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          return;
        }
        window.requestAnimationFrame(drawFrame, canvas);
        var canvasHeight=context.canvas.height= 500;
        context.clearRect(0,0,canvasWidth,500); // clear canvas
        centerX = canvasWidth/2;
        centerY = canvasHeight/2;
        context.save();
        Angle = degrees * (Math.PI / 180);
        degrees = degrees + .25;
        ball_2.x=rotationRadius * Math.cos(setAngle())*2.5 + centerX;
        ball_2.y=rotationRadius * Math.sin(setAngle()) + centerY;
        ball_2.draw(context);
      }());//end drawFrame
      
     function setAngle(){
      Angle = degrees * (Math.PI / 180);
      degrees = degrees + .25;
      return Angle;
      }//end setAngle
    }//end circularMotion2



    /* 
    * circular motion with just jquery
    * 
    */
    var element = document.getElementById('ball');
    var angle = 0;
    var x = 0;
    var y = 0;
    var w = (window.innerWidth - 50) / 2;
    var h = (window.innerHeight - 50) / 2;

    function ballCircle() {
        x = w + w * Math.cos(angle * Math.PI / 180);
        y = h + h * Math.sin(angle * Math.PI / 180);
        
        ball.style.left = x + 'px';
        ball.style.top = y + 'px';

        angle++;
        if (angle > 360) {
            angle = 0;
        }
        setTimeout(ballCircle,20);
    }

});

