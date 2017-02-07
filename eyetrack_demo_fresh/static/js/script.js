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


  //// GLOBALS ////
  var trackedObjs = [];
  var playback_time = 0;
  var start_time = 0;
  var recordArmed = false;
  var continueAnimating = true;

  // Play
  $('#play').click(function() {
    if (trackedObjs.length == 0) {
      console.log("Add an object to track!");
      return
    }
    continueAnimating = true;
    if (recordArmed) {
      console.log('BEGIN PLAYBACK: start recording');

      // clear out the previous session
      trackedObjs.forEach(function(obj) {
        obj.session_coords.length = 0;
      });

      play('record');
    } else {

      // if a previous session exists, play it back
      if (trackedObjs.some(obj => obj.session_coords.length > 0)) {
        console.log('BEGIN PLAYBACK: show recorded sessions of tracked objects');
        play('playback'); 
      } 
      else {
        console.log('no sessions to playback')
      }
    }
  });

  //  Record: Toggling between recording/playback modes
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
    console.log('trackedObjs', trackedObjs);
  	if (recordArmed) {
  		recordArmed = false;  
  		$('#record').removeClass("armed");
  		$('#play').removeClass("armed-play");
  		console.log('END RECORD SESSION')
  	} else {
    	console.log('END PLAYBACK SESSION')
  	}
    continueAnimating = false;
    play('stop');
  });

  // dropdown
  $(".dropdown-menu li a").click(function(){
    $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
    $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
  });

  // toggle controls for adding / removing objects
  $(".toggle").prop('checked', false).change();

  $('#toggle-circle').change(function() {
    if ($(this).prop('checked')){
      c = new CircleObject({x:0, y:0}, [], true, "circle");
      trackedObjs.push(c);
    } else {
      for (var i=0; i<trackedObjs.length; i++) {
        if (trackedObjs[i].stream == 'circle') {
          trackedObjs.splice(i, i+1);
        }
      }
    }
  });

  $('#toggle-circle2').change(function() {
    if ($(this).prop('checked')){
      c2 = new CircleObject2({x:0, y:0}, [], true, "circle2");
      trackedObjs.push(c2);
    } else {
      for (var i=0; i<trackedObjs.length; i++) {
        if (trackedObjs[i].stream == 'circle2') {
          trackedObjs.splice(i, i+1);
        }
      }
    }
  });


  /** -----------------------------------------------------------------------------------------------------------------------------------
  * -------------------------------------------------------------------------------------------------------------------------------------
  * Master play function
  * -------------------------------------------------------------------------------------------------------------------------------------
  * -------------------------------------------------------------------------------------------------------------------------------------
  * 
  */

  function play(mode) {
    var canvas = jQuery("#canvas");
    var context = canvas.get(0).getContext("2d");
    context.canvas.width = window.innerWidth;
    var parentWidth=jQuery(canvas).parent().width();
    var canvasWidth=context.canvas.width = parentWidth;
    var canvasHeight=context.canvas.height= 500;
    if (!checkForCanvasSupport) {
      return;
    }

    if (mode == 'stop') {
      context.clearRect(0, 0, canvas.width, canvas.height);
      return
    } 

    else if (mode == 'playback') {
      console.log('playback');
      start_time = Date.now();
      (function drawFramePlayback() {
        playback_time = Date.now() - start_time;
        if (!continueAnimating) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          return;
        }
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();

        // loop thru each tracked objects
        for (var i=0; i<trackedObjs.length; i++) {
          var obj = trackedObjs[i];
          var session = obj.session_coords;
          var coords = undefined;
          var recording_time = session[session.length-1].time;
          
          // start playback from the beginnning when reach the end
          if (playback_time > recording_time) {
            start_time = Date.now();
            break;
          }

          // loop thru session_coords
          for (var j=0; j<session.length; j++) {
            var s = session[j];
            if (playback_time < s.time) {
              coords = s;
              break;
            }
          }
          if (obj) {
            obj.marker.x = coords.x;
            obj.marker.y = coords.y;
          }
        };

        // update positions of the markers
        drawTrackedObjects(context, mode);

        // request new frame
        window.requestAnimationFrame(drawFramePlayback, canvas);
      }());//end drawFramePlayback
    } 

    else if (mode == 'record') {
      console.log('record');
      start_time = Date.now();
      (function drawFrameRecord() {
        playback_time = Date.now() - start_time;
        if (!continueAnimating) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          return;
        }
        context.save();
        context.clearRect(0, 0, canvas.width, canvas.height);

        // loop thru each tracked object
        trackedObjs.forEach(function(obj) {
          var coords = obj.update(playback_time, context);
          // obj.marker.draw(context, coords, mode);
          obj.marker.x = coords.x;
          obj.marker.y = coords.y;
        });
        
        // update positions of the markers
        drawTrackedObjects(context, mode);

        // request new frame
        window.requestAnimationFrame(drawFrameRecord, canvas);
      }());//end drawFrameRecord
    }    
  }

  // Function to draw every tracked object on the canvas
  function drawTrackedObjects(context, mode){
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    for (var i=0; i<trackedObjs.length; i++) {
      var obj = trackedObjs[i];
      var marker = obj.marker;

      context.rotate(marker.rotation);
      context.scale(marker.scaleX, marker.scaleY);
      context.lineWidth = marker.lineWidth;
      context.fillStyle = marker.color;
      context.beginPath();
      context.arc(marker.x, marker.y, marker.radius, 0, (Math.PI * 2), true);
      context.closePath(); 
      context.fill();
      if (marker.lineWidth > 0) {
      context.stroke();
      }  
    }
    context.restore();
  }


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
  function TrackObject(current_coords, session_coords, visible, stream) {
    this.current_coords = current_coords;
    this.session_coords = session_coords;
    this.visible = visible;
    this.stream = stream;
  }

  ////// Child class: Marker Object
  function MarkerObject(current_coords, session_coords, visible, stream) {
    TrackObject.call(this, current_coords, session_coords, visible, stream);
  }
  // inherit parent class
  inheritPrototype(MarkerObject, TrackObject);

  ///// Grandchild class: CircleObject -- extends MarkerObject
  function CircleObject(current_coords, session_coords, visible, stream) {
    MarkerObject.call(this, current_coords, session_coords, visible, stream);
    if (current_coords) {
      this.marker =  new Ball(current_coords.x, current_coords.y, 20, 'blue', 'blue', 5);
    }
    else {
      this.marker =  new Ball(0, 0, 20, 'blue', 'blue', 5);
    }
    
  }
  // inherit parent class
  inheritPrototype(CircleObject, MarkerObject);
  CircleObject.prototype.update = function(time, context) {
    //get updated position in frame
    return this.animate(time, context);
  }
  CircleObject.prototype.animate = function(time, context) {
    // calculate new position based off time
    // Ax = rcos(ts) + center
    // Ay = rsin(ts) + center
    var parentWidth=jQuery(canvas).parent().width();
    var canvasWidth=context.canvas.width = parentWidth;
    var canvasHeight=context.canvas.height= 500;
    var centerX = canvasWidth/2;
    var centerY = canvasHeight/2;
    var rotationRadius=200;
    var stretch_width = 2.5;
    var stretch_time = 5;

    var _x = stretch_width * rotationRadius * Math.cos((time/stretch_time) * (0.25*Math.PI/180)) + centerX //moves as .25degrees/sec
    var _y = rotationRadius * Math.sin((time/5) * (0.25*Math.PI/180)) + centerY

    var coords = {'x':_x, 'y':_y, time: time};
    this.session_coords.push(coords);
    return coords;
  }

  ///// Grandchild class: CircleObject2 -- extends MarkerObject
  function CircleObject2(current_coords, session_coords, visible, stream) {
    MarkerObject.call(this, current_coords, session_coords, visible, stream);
    if (current_coords) {
      this.marker = new Ball(current_coords.x, current_coords.y, 20, 'yellow', 'yellow', 5);
    }
    else {
      this.marker = new Ball(0, 0, 20, 'yellow', 'yellow', 5);
    }
    
  }
  // inherit parent class
  inheritPrototype(CircleObject2, MarkerObject);
  CircleObject2.prototype.update = function(time, context) {
    //get updated position in frame
    return this.animate(time, context);
  }
  CircleObject2.prototype.animate = function(time, context) {
    // calculate new position based off time
    // Ax = rcos(ts) + center
    // Ay = rsin(ts) + center
    var parentWidth=jQuery(canvas).parent().width();
    var canvasWidth=context.canvas.width = parentWidth;
    var canvasHeight=context.canvas.height= 500;
    var centerX = canvasWidth/2;
    var centerY = canvasHeight/2;
    var rotationRadius=200;
    var stretch_width = 1;
    var stretch_time = 5;

    var _x = stretch_width * rotationRadius * Math.cos((time/stretch_time) * (0.25*Math.PI/180)) + centerX //moves as .25degrees/sec
    var _y = rotationRadius * Math.sin((time/5) * (0.25*Math.PI/180)) + centerY

    var coords = {'x':_x, 'y':_y, time: time};
    this.session_coords.push(coords);
    return coords;
  }

  ////// Child class: GazeObject Object
  function GazeObject(current_coords, session_coords, visible, stream) {
    TrackObject.call(this, current_coords, session_coords, visible, stream);
    this.marker = new Ball(0, 0, 20, 'green', 'green', 7);
  }
  // inherit parent class
  inheritPrototype(GazeObject, TrackObject);
  GazeObject.prototype.update = function(time, context) {
    //get updated position in frame
    return this.animate(time, context);
  }
  GazeObject.prototype.animate = function(time, context) {
    // calculate new position based off time
  }


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
    if (color === undefined) { color = "blue"; }
    if (strokeColor === undefined) { strokeColor = "#fff"; }
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
    
  Ball.prototype.draw = function (context, coords, mode) {
    // console.log(this);
    // do something with coords
    // if (mode == 'playback') {
    //   context.clearRect(0, 0, canvas.width, canvas.height);
    // }
    context.save();
    context.rotate(this.rotation);
    context.scale(this.scaleX, this.scaleY);
    context.lineWidth = this.lineWidth;
    context.fillStyle = this.color;
    context.beginPath();
    //x, y, radius, start_angle, end_angle, anti-clockwise
    context.arc(coords.x, coords.y, this.radius, 0, (Math.PI * 2), true);
    context.closePath();
    context.fill();
    if (this.lineWidth > 0) {
    context.stroke();
    }  
    context.restore();
  };


  /* -------------------------------------------------------------------------------------------------------------------------------------
  * --------------------------------------------------------------------------------------------------------------------------------------
  * Custom Animation Functions
  * --------------------------------------------------------------------------------------------------------------------------------------
  ----------------------------------------------------------------------------------------------------------------------------------------
  */
  //// Function that precomputes list of MarkerObjects to be animated
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
      circle_coords.push( new CircleObject({'x': x, 'y': y}, 'precomputed_circle_session', true, 'circle_stream') );
    }
    
    function setAngle(){
      Angle = degrees * (Math.PI / 180);
      degrees = degrees + .25;
      return Angle;
    }//end setAngle

    return circle_coords;
  }

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