$(document).ready(function() {

   /* -----------------------------------------------------------------------------------------------------------------------------------
  * ------------------------------------------------------------------------------------------------------------------------------------
  * Flask socketio connection
  * -----------------------------------------------------------------------------------------------------------------------------------
  * -----------------------------------------------------------------------------------------------------------------------------------
  */

  // Connect to the Socket.IO server.
  // The connection URL has the following format:
  //     http[s]://<domain>:<port>[/<namespace>]
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  // Event handler for new connections.
  // The callback function is invoked when a connection with the
  // server is established.
  socket.on('connect', function() {
      socket.emit('first_connection', {data: 'I\'m connected!'});
  });

  // Event handler for server sent data.
  // The callback function is invoked whenever the server emits data
  // to the client. The data is then displayed in the "Received"
  // section of the page.
  socket.on('my_response', function(msg) {
      console.log(msg)
  });


  // testing socket pong/pong
  $('button#btn-test-front').click(function(event) {
    socket.emit('click_test_front', {data: 'test data from frontend'});
    return false;
  });

  $('button#btn-test-back').click(function(event) {
    socket.emit('click_test_back', {data: 'test data from backend'});
    return false;
  });


  /* -----------------------------------------------------------------------------------------------------------------------------------
  * ------------------------------------------------------------------------------------------------------------------------------------
  * UI controls
  * -----------------------------------------------------------------------------------------------------------------------------------
  * -----------------------------------------------------------------------------------------------------------------------------------
  */

  // array to store ball's position in memory
  var ball_positions = [];

  // Play
  var continueAnimating = true;
  $('#play').click(function() {
    if (ball_positions.length > 0 || recordArmed) {
      if (recordArmed) {
        console.log('BEGIN RECORD SESSION: record ball + eyetrack coordinates');
        ball_positions.length = 0; // reset ball_positions b/c we're starting a new session
        circularMotion(); //would be replaced by custom animation function
      } else {
        console.log('BEGIN PLAYBACK: show last recording session');
        drawObjects(ball_positions);

        //viewing timestamps of objects
        var times = [];
        ball_positions.forEach(function (o){
          times.push(o.timestamp)
        })
        console.log(times);
      } 
    }
  });

  //  Record: Toggling between recording/playback modes
  var recordArmed = false;
  $('#record').click(function() {
    if (recordArmed) {
    	recordArmed = false;  
    	$('#record').removeClass("armed");
    	$('#play').removeClass("armed-play");
    	console.log('END RECORD SESSION')
    } else {
    	recordArmed = true;
      $('#record').addClass("armed");
      $('#play').addClass("armed-play");
    }
  });

  // Stop
  $('#stop').click(function() {
  	if (recordArmed) {
  		recordArmed = false;  
  		$('#record').removeClass("armed");
  		$('#play').removeClass("armed-play");
  		console.log('END RECORD SESSION')
  	} else {
    	console.log('END PLAYBACK SESSION')
  	}
    console.log(ball_positions);
    continueAnimating = false;
    circularMotion();
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


  /** -----------------------------------------------------------------------------------------------------------------------------------
  * -------------------------------------------------------------------------------------------------------------------------------------
  * Master animation function
  * -------------------------------------------------------------------------------------------------------------------------------------
  * -------------------------------------------------------------------------------------------------------------------------------------
  * params: 
  *    objs - list of TrackObjects (either type AnimationObject or EyetrackObject)
  */

  function drawObjects(objs){ //change name to play
    continueAnimating = true;
    var canvas = jQuery("#canvas");
    var context = canvas.get(0).getContext("2d");
    context.canvas.width = window.innerWidth;

    var first_obj = objs[0];
    var ball = new Ball(first_obj.current_coords.x,first_obj.current_coords.y,20,first_obj.marker,'#000',7);

    var parentWidth=jQuery(canvas).parent().width();
    var canvasWidth=context.canvas.width = parentWidth;
    
    if (!checkForCanvasSupport) {
    return;
    }

    // index of current object being drawn
    obj_index = 0;
     
    // Main update loop 
    (function drawFrame() {
      if (!continueAnimating) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      
      if (obj_index >= objs.length) {obj_index = 0}
      window.requestAnimationFrame(drawFrame, canvas);
      var canvasHeight=context.canvas.height= 500;
      // context.clearRect(0,0,canvasWidth,500); // clear canvas
      context.save();
      ball.x=objs[obj_index].current_coords.x;
      ball.y=objs[obj_index].current_coords.y;
      ball.draw(context);
      obj_index ++;
    }());//end drawFrame
  }

  /*
  * Testing stuff
  */
  var test_positions = []
  for (var i=0; i<100; i++) {
    test_positions.push({x: 100, y: 100});
  }
  for (var i=0; i<100; i++) {
    test_positions.push({x: 300, y: 100});
  }
  $('#btn-test-play').click(function() {
    var testing_oop = []
    for (var i=0; i<50; i++) {
      testing_oop.push(new AnimationObject({x: 100, y:100}, 'test_session', '#42f477', true, 'test'));
    }
    for (var i=0; i<50; i++) {
      testing_oop.push(new AnimationObject({x: 200, y:100}, 'test_session', '#42f477', true, 'test'));
    }
    drawObjects(testing_oop)
  });


  /*
  * ----------------------------------------------------------------------------------------------------------------------------------
  * ----------------------------------------------------------------------------------------------------------------------------------
  * Creating the Tracker Object Prototype and it's children
  * ----------------------------------------------------------------------------------------------------------------------------------
  * ----------------------------------------------------------------------------------------------------------------------------------
  */

  // Function to create inheritance between parent and child classes
  function inheritPrototype(childObject, parentObject) {
    // As discussed above, we use the Crockford’s method to copy the properties and methods from the parentObject onto the childObject​
    // So the copyOfParent object now has everything the parentObject has ​
    var copyOfParent = Object.create(parentObject.prototype);

    //Then we set the constructor of this new object to point to the childObject.​
    // Why do we manually set the copyOfParent constructor here, see the explanation immediately following this code block.​
    copyOfParent.constructor = childObject;

    // Then we set the childObject prototype to copyOfParent, so that the childObject can in turn inherit everything from copyOfParent (from parentObject)​
    childObject.prototype = copyOfParent;
  }

  ///// Parent Track Object class
  function TrackObject(current_coords, session_coords, marker, visible, stream) {
    this.current_coords = current_coords;
    this.session_coords = session_coords;
    this.marker = marker;
    this.visible = visible;
    this.stream = stream;
    this.timestamp = Date.now();
  }

  TrackObject.prototype.drawObject = function() {
    drawObjects([this])
  }

  ////// Child class: Animation Object
  function AnimationObject(current_coords, session_coords, marker, visible, stream) {
    TrackObject.call(this, current_coords, session_coords, marker, visible, stream);
  }
  // inherit parent class
  inheritPrototype(AnimationObject, TrackObject);

  //AnimationObject method: draw the object
  AnimationObject.prototype.circularMotion = function() {
    circularMotion();
  }

  ////// Child class: EyetrackObject Object
  function EyetrackObject(current_coords, session_coords, marker, visible, stream) {
    TrackObject.call(this, current_coords, session_coords, marker, visible, stream);
  }
  // inherit parent class
  inheritPrototype(EyetrackObject, TrackObject);


  /** -------------------------------------------------------------------------------------------------------------------------------------
  * ---------------------------------------------------------------------------------------------------------------------------------------
  * Source: http://www.html5code.nl/canvas-tutorial/tutorial-canvas-animation-circular-movement/
  * Objects to create balls on canvas 
  * ---------------------------------------------------------------------------------------------------------------------------------------
  * ---------------------------------------------------------------------------------------------------------------------------------------
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


  /* -------------------------------------------------------------------------------------------------------------------------------------
  * --------------------------------------------------------------------------------------------------------------------------------------
  * Custom Animation Functions
  * --------------------------------------------------------------------------------------------------------------------------------------
  ----------------------------------------------------------------------------------------------------------------------------------------
  */
  //// Function that precomputes list of AnimationObjects to be animated
  //// this animation function is a secondary feature, another custom function that takes time as a param will be used
  function circle() {
    circle_coords = [];
    var x, y, centerX, centerY, time, Angle;
    var rotationRadius=200;
    var degrees = 0;
    var canvas = jQuery("#canvas");
    var context = canvas.get(0).getContext("2d");
    context.canvas.width = window.innerWidth;
    var parentWidth=jQuery(canvas).parent().width();
    var canvasWidth=context.canvas.width = parentWidth;

    while (degrees < (Math.PI*90)) {
      var canvasHeight=context.canvas.height= 500;
      centerX = canvasWidth/2;
      centerY = canvasHeight/2;
      Angle = degrees * (Math.PI / 180);
      degrees = degrees + .25;
      x = rotationRadius * Math.cos(setAngle())*2.5 + centerX;
      y = rotationRadius * Math.sin(setAngle()) + centerY;
      circle_coords.push( new AnimationObject({'x': x, 'y': y}, 'precomputed_circle_session', '#42f477', true, 'circle_stream') );
    }
    
    function setAngle(){
      Angle = degrees * (Math.PI / 180);
      degrees = degrees + .25;
      return Angle;
    }//end setAngle

    return circle_coords;
  }

  //// circular motion animation
  // my variable to keep track of the ball canvas drawing
  var the_ball = null;
  function circularMotion(){
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
    var ball = new Ball(-10,-10,20,'purple','#000',7);
    
    //get the current state of the ball drawing
    the_ball = ball;

    var parentWidth=jQuery(canvas).parent().width();
    var canvasWidth=context.canvas.width = parentWidth;
    
    if (!checkForCanvasSupport) {
    return;
    }

    // variables about the memory storage of ball coords
    var num_ball_coords = ball_positions.length;
    var i_ball = -1;

    // Main update loop 
    (function drawFrame() {
      if (!continueAnimating) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      // if in PLAYBACK mode
      if (recordArmed == false) {
      	i_ball ++;
     		if (i_ball >= num_ball_coords) {i_ball = 0;}

     		window.requestAnimationFrame(drawFrame, canvas);
     		var canvasHeight=context.canvas.height= 500;
     		context.clearRect(0,0,canvasWidth,500); // clear canvas
     		centerX = canvasWidth/2;
     		centerY = canvasHeight/2;
     		context.save();
     		Angle = degrees * (Math.PI / 180);
     		degrees = degrees + .25;

     		ball.x=ball_positions[i_ball].x;
     		ball.y=ball_positions[i_ball].y;
     		ball.draw(context);
     	}

     	// if in RECORD mode
      else {
      	window.requestAnimationFrame(drawFrame, canvas);
      	var canvasHeight=context.canvas.height= 500;
      	context.clearRect(0,0,canvasWidth,500); // clear canvas
      	centerX = canvasWidth/2;
      	centerY = canvasHeight/2;
      	context.save();
      	Angle = degrees * (Math.PI / 180);
      	degrees = degrees + .25;
      	ball.x=rotationRadius * Math.cos(setAngle())*2.5 + centerX;
      	ball.y=rotationRadius * Math.sin(setAngle()) + centerY;
      	ball.draw(context);

      	// store the current position of the ball
      	ball_positions.push( new AnimationObject(getBallPosition(ball), 'circularMotion-test', '#42f477', true, 'circularMotion-stream') ); 
      }
    }());//end drawFrame
    
   function setAngle(){
    Angle = degrees * (Math.PI / 180);
    degrees = degrees + .25;
    return Angle;
    }//end setAngle
  }//end circularMotion


  /* 
  * -----------------------------------------------------------------------------------------------------------------------------------
  * -----------------------------------------------------------------------------------------------------------------------------------
  * circular motion with just jquery
  * -----------------------------------------------------------------------------------------------------------------------------------
  *------------------------------------------------------------------------------------------------------------------------------------
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

