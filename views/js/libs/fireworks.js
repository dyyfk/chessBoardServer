/* How ELM uses canvas */
/* Not the normal way, but is still based around the basic update & draw loop.
** Each effect has its own canvas, which is created in:
** _.special_effect_canvas.init(sId, domParent)
** Not ideal in some ways, because each canvas has a seperate requestFrameAnim call. For more canvases to play well at once it would be a good idea to re-design how this is working.
*/
var APP = {
  p_aActiveCanvases : [], // collected so they can be cleared
  p_iCurrentFPS: 60, // can be set by user settings, 60 is default for desktops
  p_iStageWidth: window.innerWidth,
  p_iStageHeight: window.innerHeight,
  MODE: {
    CONST: 1,
    SMOOTH: 2
  }
};
APP.special_effect_canvas = {
  mode: 1, // for testing
  testingMsPerFrame: 0, // for testing
  bAlreadyExists: false,
  p_iFrameRequestId : 0,
  p_bIsPlaying : false,
  p_iStartTime: undefined,
  p_iDrawTime : undefined,
  p_iDrawCount : 0,
  p_oEffect : undefined, // will hold the current effect info
  p_oOptions : undefined, // optional settings
  p_domContainer : undefined // contains the canvas
};
APP.special_effect_canvas.init = function (sId, domParent) {
	var thisObj = this;
	// Create shims:
	if(!this.bAlreadyExists) {
    this.bAlreadyExists = true;
		// when animating on canvas, it is best to use requestAnimationFrame instead of setTimeout or setInterval
		// not supported in all browsers though, and sometimes needs a prefix, so we need a shim:
		window.requestCanvasAnimFrame = ( function() {
			return window.requestAnimationFrame || 
				window.webkitRequestAnimationFrame || 
				window.mozRequestAnimationFrame ||
				function( callback ) {
					window.setTimeout( callback, 1000 / APP.p_iCurrentFPS );
				};
		})();
		window.cancelCanvasAnimFrame = ( function() {
			return window.cancelAnimationFrame ||
				window.webkitCancelAnimationFrame ||
				window.mozCancelAnimationFrame || 
				function( requestID ) {
					window.clearTimeout(requestID);
				};
		})();
    this.p_sId = sId;
		// DOM
		this.p_domContainer = document.createElement('div');
		this.p_domContainer.setAttribute('id', sId); // reminder: ID must be unique
		if(!domParent) {
			// ADDING IT TO THE BODY -- should be in the first createContentDiv() call, after content div & before menu bar/student space
			document.body.appendChild(this.p_domContainer);
		} else {
			domParent.appendChild(this.p_domContainer);
		}
		this.p_iDrawCount = 0;
	} else {
    // just clear old one?
		this.clear();
	}
};
APP.special_effect_canvas.setupEffect = function (sEffectType, domRectAreaToCover, oOptions, bStart) {
	var thisController = this;
	if(this.p_oEffect) {
		// Clear before starting new effect. Unfortunately, my code here only handles one effect at a time
		this.clear();
	}
  // Getting the area of the effect, this is passed as a rect object
	domRectAreaToCover = domRectAreaToCover || {left:0, right: APP.p_iStageWidth, top:0, bottom: APP.p_iStageHeight};
	this.p_oEffect = {};
	this.p_oOptions = oOptions || {}; // common options: {overlapX; overlapY; count; subCount; particleMax; timeBetweenRepeats; repeatLimit; }
  // Create the canvas
	this.p_oEffect.canvas = document.createElement('canvas');
	this.p_oEffect.canvas.setAttribute("id", sEffectType + "_canvas_in_" + this.p_sId);
	this.p_oEffect.canvas.setAttribute(
		"style", 
		"position:absolute;left:" + (domRectAreaToCover.left - (this.p_oOptions.overlapX || 0)) + "px;top:" + (domRectAreaToCover.top - (this.p_oOptions.overlapY || 0)) + "px;pointer-events:none;"
	);
  // px;pointer-events:none; ---> allows clicks to pass through it in most browsers
	this.p_domContainer.appendChild(this.p_oEffect.canvas);
	// Set the context. This is what handles drawing to the canvas
	this.p_oEffect.context = this.p_oEffect.canvas.getContext("2d"); // You can do 3d in some browsers
	// canvas size
	this.p_oEffect.w = (domRectAreaToCover.right  - domRectAreaToCover.left) + ((this.p_oOptions.overlapX || 0) * 2);
	this.p_oEffect.h = (domRectAreaToCover.bottom  - domRectAreaToCover.top) + ((this.p_oOptions.overlapY || 0) * 2);
	this.p_oEffect.canvas.width = this.p_oEffect.w;
	this.p_oEffect.canvas.height = this.p_oEffect.h;
	this.p_oEffect.count = 0;
	this.p_oEffect.time = 0;
	this.p_oEffect.repeat = 0;
	// utility
	this.p_oEffect.random = function ( min, max ) {
		return Math.random() * ( max - min ) + min;
	};
  // Now, here's where I might have split this up, but it is currently all in the same method
	if (sEffectType === "sample") {
		this.p_oEffect.elements = [];
		this.p_oEffect.speedLimit = 3;
		this.p_oEffect.createElement = function (cx, cy) {
			var thisEffect = this;
			function Thingy (centerX, centerY) {
				this.x = centerX;
				this.y = centerY;
				this.speed = Math.max( 1, (Math.random() * thisEffect.speedLimit));
				this.boyancy = 1.5;
				this.friction = 1;
				this.angle = 0;
				this.gravity = 0;
        this.hue = thisEffect.random(0, 255);
        this.brightness = thisEffect.random(0, 100);
        this.alpha = thisEffect.random(0, 1);
			};
			Thingy.prototype.update = function (frameDelta, index, bCatchUp, hasSkippedTooManyFrames) {
        var bOutOfFrame;
				// slow down the particle
				this.speed *= Math.pow(this.friction, frameDelta);
				// apply velocity
				this.y += ((this.speed) * (this.gravity - this.boyancy)) * frameDelta;
        bOutOfFrame = (this.y < -10);
				if (bOutOfFrame) {
					// remove Thingy
					thisEffect.elements.splice( index, 1 );
				}
			};
			Thingy.prototype.draw = function () {
        var r = 10;
        // we are going to change the context, and don't want to effect anything else that might also be drawing, so we save the old context and will put it all back when we are done. It is overkill here since this is the only function effecting the canvas and we are not using transforms.
        thisEffect.context.save();
        // Start drawing
				thisEffect.context.beginPath();
        // move to start position:
				thisEffect.context.moveTo( this.x - r, this.y );
				thisEffect.context.lineTo(this.x, this.y - r);
				thisEffect.context.lineTo(this.x + r, this.y);
				thisEffect.context.lineTo(this.x, this.y + r);
				thisEffect.context.lineTo(this.x - r, this.y);
        // you can also use arcTo, quadraticCurveTo, bezierCurveTo, etc.
				thisEffect.context.closePath(); // Needed in order to close the path
				thisEffect.context.lineJoin = 'round';
				thisEffect.context.fillStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
				thisEffect.context.lineWidth = 2;
				thisEffect.context.lineCap = "butt";
				thisEffect.context.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
        // To actually SEE anything, you need to call fill and/or stroke
				thisEffect.context.fill();
				thisEffect.context.stroke();
        // putting back the old context that was saved at the start:
        thisEffect.context.restore();
      };
			this.elements.push(new Thingy(cx, cy));
		};
		//## UPDATE EXAMPLE
    //=====================================
		this.p_oEffect.update = function (ms) {
			var iIndex, frameDelta =  ms / (1000/60), bCatchUp = frameDelta > 1, hasSkippedTooManyFrames = frameDelta > 3, bIsUnderLimit;
			// going in reverse because they will splice themselves out as they go
			iIndex = this.elements.length;
			while (iIndex--) {
				this.elements[iIndex].update(frameDelta, iIndex, bCatchUp, hasSkippedTooManyFrames);
			}
      // if we limit the repeat on the effect, stop creating and wait for the effect to die off, else regenerate the sub elements if there are too few
			if (thisController.p_oOptions.repeatLimit && (this.repeat > thisController.p_oOptions.repeatLimit)) {
				if (this.elements.length === 0) {
					this.isDone = true;
				}
			}
			else {
				while (this.elements.length < thisController.p_oOptions.count) {
					this.repeat++;
					this.createElement(this.random(10, this.w - 10), this.h + 20);
				}
			}
		};
		//## DRAW EXAMPLE
    //=======================================
		this.p_oEffect.draw = function () {
			var thisEffect = this, iIndex, l;
      // clear canvas, if you know exactly where you drew, you can selectively clear areas to reduce what the broswer needs to do each frame
			thisEffect.context.clearRect( 0, 0, this.w, this.h );
			// Draw all the active elements:
			l = this.elements.length;
			for (iIndex = 0; iIndex < l; iIndex ++) {
				this.elements[iIndex].draw();
			}
		};
	}
  // FIREWORKS /////////////////////////////////////////////////////////////
	else if (sEffectType === "fireworks") {
		this.p_oEffect.fireworks = [];
		this.p_oEffect.particles = [];
		// Ensuring some options are set:
		this.p_oOptions.count = this.p_oOptions.count || 1; // number of fireworks at a time
		this.p_oOptions.subCount = this.p_oOptions.subCount || 30; // number of particles that appear in the explosion
		this.p_oOptions.particleMax = this.p_oOptions.particleMax || (this.p_oOptions.count * this.p_oOptions.subCount); // if there are performance issues, we can try limiting it
		this.p_oOptions.repeatLimit = this.p_oOptions.repeatLimit || 0; // how many fireworks are set off before it self-clears. If 0, infinite.
		// other options
		this.p_oOptions.hueBase = this.p_oOptions.hueBase || 0;
		this.p_oOptions.hueIncrease = this.p_oOptions.hueIncrease || 0;
		this.p_oOptions.hueVariation = this.p_oOptions.hueVariation || 0;
		this.p_oOptions.brightnessBase = (this.p_oOptions.brightnessBase >= 0) ? this.p_oOptions.brightnessBase : 65;
		this.p_oOptions.brightnessVariation = this.p_oOptions.brightnessVariation || 0;
		this.p_oOptions.lineMin = this.p_oOptions.lineMin || 1;
		this.p_oOptions.lineMax = this.p_oOptions.lineMax || this.p_oOptions.lineMin;
		this.p_oOptions.timeBetweenRepeats = this.p_oOptions.timeBetweenRepeats || 0;
		this.p_oEffect.hue = this.p_oOptions.hueBase;
		this.p_oEffect.count = 0;
		this.p_oEffect.time = 0;
		this.p_oEffect.repeat = 0;
		this.p_oEffect.calculateDistance = function ( p1x, p1y, p2x, p2y ) {
			var xDistance = p1x - p2x, yDistance = p1y - p2y;
			return Math.sqrt( Math.pow( xDistance, 2 ) + Math.pow( yDistance, 2 ) );
		};
		//## CREATE A FIREWORK
    //=================================================================================================
		this.p_oEffect.createFirework = function (startX, startY, targetX, targetY) {
			var thisEffect = this;
			//### START - FIREWORK PROTOTYPE
      //-----------------------------------------------------------------------------------
			function Firework( sx, sy, tx, ty ) {
				this.lineWidth = Math.floor(thisEffect.random(thisController.p_oOptions.lineMin, thisController.p_oOptions.lineMax));
				// actual coordinates
				this.x = sx;
				this.y = sy;
				// starting coordinates
				this.sx = sx;
				this.sy = sy;
				// target coordinates
				this.tx = tx;
				this.ty = ty;
				// distance from starting point to target
				this.distanceToTarget = thisEffect.calculateDistance( sx, sy, tx, ty );
				this.distanceTraveled = 0;
				// track the past coordinates of each firework to create a trail effect, increase the coordinate count to create more prominent trails
				this.coordinates = [];
				this.coordinateCount = 3;
				// populate initial coordinate collection with the current coordinates
				while( this.coordinateCount-- ) {
					this.coordinates.push( [ this.x, this.y ] );
				}
				this.angle = Math.atan2( ty - sy, tx - sx );
				this.speed = 3;
				this.acceleration = 1.05;
				this.brightness = thisEffect.random( thisController.p_oOptions.brightnessBase - thisController.p_oOptions.brightnessVariation, thisController.p_oOptions.brightnessBase + thisController.p_oOptions.brightnessVariation);
				// circle target indicator radius
				this.targetRadius = 1;
			}
			// update firework
			Firework.prototype.update = function(frameDelta, index ) {
				// remove last item in coordinates array
				this.coordinates.pop();
				// add current coordinates to the start of the array
				this.coordinates.unshift( [ this.x, this.y ] );
				// cycle the circle target indicator radius
				if( this.targetRadius < 8 ) {
					this.targetRadius += 0.3;
				} else {
					this.targetRadius = 1;
				}
				// speed up the firework
				this.speed *= Math.pow(this.acceleration, frameDelta);
				// get the current velocities based on angle and speed
				var vx = (Math.cos( this.angle ) * (this.speed)) * frameDelta,
					vy = (Math.sin( this.angle ) * (this.speed)) * frameDelta;
				// how far will the firework have traveled with velocities applied?
				this.distanceTraveled = thisEffect.calculateDistance( this.sx, this.sy, this.x + vx, this.y + vy );
				// if the distance traveled, including velocities, is greater than the initial distance to the target, then the target has been reached
				if( this.distanceTraveled >= this.distanceToTarget ) {
					// Have we shown it reaching the target?
					if (this.done) {
						thisEffect.createParticles( this.tx, this.ty , this.lineWidth);
						// remove the firework, use the index passed into the update function to determine which to remove
						thisEffect.fireworks.splice( index, 1 );
					} else {
						// Let it draw one more time
						this.x = this.tx;
						this.y = this.ty;
						this.done = true;
					}
				} else {
					// target not reached, keep traveling
					this.x += vx;
					this.y += vy;
				}
			};
			// draw firework
			Firework.prototype.draw = function() {
				thisEffect.context.beginPath();
				// move to the last tracked coordinate in the set, then draw a line to the current x and y
				thisEffect.context.moveTo( this.coordinates[ this.coordinates.length - 1][ 0 ], this.coordinates[ this.coordinates.length - 1][ 1 ] );
				thisEffect.context.lineWidth = 1;
				thisEffect.context.lineCap = "butt";
				thisEffect.context.lineTo( this.x, this.y );
				thisEffect.context.strokeStyle = 'hsl(' + thisEffect.hue + ', 100%, ' + this.brightness + '%)';
				thisEffect.context.stroke();
				// draw the target for this firework with a pulsing circle
				if (this.done) {
					thisEffect.context.beginPath();
					thisEffect.context.arc( this.tx, this.ty, 3, 0, Math.PI * 2 );
					thisEffect.context.strokeStyle = 'hsl(' + thisEffect.hue + ', 100%, ' + this.brightness + '%)';
					thisEffect.context.lineWidth = 2;
					thisEffect.context.fillStyle = 'hsl(' + thisEffect.hue + ', 100%, ' + 100 + '%)';
					thisEffect.context.fill();
					thisEffect.context.stroke();
				}
			};
			//### END - FIREWORK PROTOTYPE 
      //------------------------------------------------------------------------------------
			this.fireworks.push( new Firework( startX, startY, targetX, targetY ) );
		};
		//## CREATE FIREWORKS PARTICLES
    //=================================================================================================
		this.p_oEffect.createParticles = function ( xPos, yPos, size ) {
			var thisEffect = this, 
				particleCount; // increase the particle count for a bigger explosion, beware of the canvas performance hit with the increased particles though
			//### START - FIREWORKS PARTICLE PROTOTYPE
      //----------------------------------------------------------------------------------
			function Particle( x, y, lineWidth ) {
				var weight = (lineWidth / 2);
				if(weight < 1) {
					weight = 1;
				}
				this.x = x;
				this.y = y;
				this.lineWidth = lineWidth;
				// track the past coordinates of each particle to create a trail effect, increase the coordinate count to create more prominent trails
				this.coordinates = [];
				this.coordinateCount = 2; // 5
				while( this.coordinateCount-- ) {
					this.coordinates.push( [ this.x, this.y ] );
				}
				// set a random angle in all possible directions, in radians
				this.angle = thisEffect.random( 0, Math.PI * 2 );
				this.speed = 3 * lineWidth + thisEffect.random( 1, 5 );
				// friction will slow the particle down
				this.friction = 0.95;//0.95;
				// gravity will be applied and pull the particle down
				this.gravity = weight;
				// set the hue to a random number +-50 of the overall hue variable
				this.hue = thisEffect.random( thisEffect.hue - thisController.p_oOptions.hueVariation, thisEffect.hue - thisController.p_oOptions.hueVariation );
				this.brightness = thisEffect.random( thisController.p_oOptions.brightnessBase - thisController.p_oOptions.brightnessVariation, thisController.p_oOptions.brightnessBase + thisController.p_oOptions.brightnessVariation);//50, 80 );
				this.alpha = 1;
				// set how fast the particle fades out
				this.decay = thisEffect.random( 0.01, 0.02 );//0.015, 0.03 );
			};
			Particle.prototype.update = function(frameDelta, index, bCatchUp, hasSkippedTooManyFrames) {
				// remove last item in coordinates array
				this.coordinates.pop();
				// if we skipped frames, move the last position closer to the new position
				if(hasSkippedTooManyFrames) {
					// Switch to dot mode instead of lines
					this.coordinates = [];
				} else if (bCatchUp && this.coordinates.length > 1) {
					this.coordinates.pop();
					this.coordinates.unshift( [ this.x - ((Math.cos( this.angle ) * (this.speed))) / 4, this.y - ((Math.sin( this.angle ) * (this.speed) + this.gravity)) / 4 ] );
				}
				// add current coordinates to the start of the array
				this.coordinates.unshift( [ this.x, this.y ] );
				// slow down the particle
				this.speed *= Math.pow(this.friction, frameDelta);
				// apply velocity
				this.x += (Math.cos( this.angle ) * (this.speed)) * frameDelta;
				this.y += (Math.sin( this.angle ) * (this.speed) + this.gravity) * frameDelta;
				// fade out the particle -- controls particle life!
				this.alpha -= this.decay * frameDelta;
				// remove the particle once the alpha is low enough, based on the passed in index
				if( this.alpha <= this.decay ) {
					thisEffect.particles.splice( index, 1 );
				}
			};
			Particle.prototype.draw = function() {
				var r, x1, y1, x2, y2, twinkle = (thisEffect.random(0,10) < 1);
				thisEffect.context.beginPath();
				// move to the last tracked coordinates in the set, then draw a line to the current x and y
				if ( this.coordinates.length > 1) {
					thisEffect.context.moveTo( this.coordinates[ this.coordinates.length - 1 ][ 0 ], this.coordinates[ this.coordinates.length - 1 ][ 1 ] );
					thisEffect.context.lineWidth = this.lineWidth;
					thisEffect.context.lineCap = "round";
					thisEffect.context.lineTo( this.x, this.y );
					thisEffect.context.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + ((twinkle)? 100 : this.brightness) + '%, ' + ((twinkle)? 100 : this.alpha) + ')';
					thisEffect.context.stroke();
				} else {
					// if not a line, draw circles
					r = (twinkle) ? Math.ceil(this.lineWidth) : Math.ceil(this.lineWidth/2) ;
					thisEffect.context.moveTo( this.x - r, this.y );
					thisEffect.context.lineTo(this.x, this.y - r);
					thisEffect.context.lineTo(this.x + r, this.y);
					thisEffect.context.lineTo(this.x, this.y + r);
					thisEffect.context.lineTo(this.x - r, this.y);
					thisEffect.context.closePath();
					thisEffect.context.lineJoin = 'round';
					thisEffect.context.fillStyle = 'hsla(' + this.hue + ', 100%, ' + ((twinkle)? 100 : this.brightness) + '%, ' + ((twinkle)? 100 : this.alpha) + ')';
					thisEffect.context.lineWidth = 2;
					thisEffect.context.lineCap = "butt";
					thisEffect.context.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + ((twinkle)? 100 : this.brightness) + '%, ' + ((twinkle)? 100 : this.alpha) + ')';
					thisEffect.context.fill();
					thisEffect.context.stroke();
				}
			};
			//### END - FIREWORKS PARTICLE PROTOTYPE
      //------------------------------------------------------------------------------------
			particleCount = thisController.p_oOptions.subCount;
			while( particleCount--  && ( !(thisController.p_oOptions.particleMax) || thisController.p_oOptions.particleMax > thisEffect.particles.length)) {
				thisEffect.particles.push( new Particle( xPos, yPos, size ) );
			}
		};
		//## FIREWORKS UPDATE
    //============================================================================================================
		this.p_oEffect.update = function (ms) {
			var iIndex, fwl, pl, frameDelta =  ms / (1000/60), bCatchUp = frameDelta > 1, hasSkippedTooManyFrames = frameDelta > 3, bIsUnderLimit;
			// update the fireworks & particles -- going in reverse because they will splice themselves out as they go
			iIndex = this.fireworks.length;
			while (iIndex--) {
				this.fireworks[iIndex].update(frameDelta, iIndex, bCatchUp, hasSkippedTooManyFrames);
			}
			iIndex = this.particles.length;
			while (iIndex--) {
				this.particles[iIndex].update(frameDelta, iIndex, bCatchUp, hasSkippedTooManyFrames);
			}
			// checking length before update
			pl = this.particles.length;
			fwl = this.fireworks.length;
			// Any new fireworks to add?
			bIsUnderLimit = ((fwl + 1) <= thisController.p_oOptions.count) && ((pl + ((fwl + 1) * thisController.p_oOptions.subCount)) <= thisController.p_oOptions.particleMax);
			// launch fireworks automatically towards target coordinates
			if( (bIsUnderLimit) && (this.count === 0 || !(thisController.p_oOptions.timeBetweenRepeats) || this.time >= thisController.p_oOptions.timeBetweenRepeats) ) {
				if ((thisController.p_oOptions.repeatLimit && this.repeat >= thisController.p_oOptions.repeatLimit)) {
					// if no timer total, just delete it when the last particles disappear
					if (thisController.p_oOptions.timeBetweenRepeats || (this.fireworks.length + this.particles.length === 0) ) {
						this.isDone = true;
						return;
					}
				} else {
					// start the firework at the bottom middle of the screen, then set the random target coordinates, the random y coordinates will be set within the range of the top half of the screen
					this.createFirework( this.w / 2, this.h, (typeof thisController.p_oOptions.xTarget === "undefined") ? this.random( 0, this.w ) : thisController.p_oOptions.xTarget, (typeof thisController.p_oOptions.yTarget === "undefined") ? this.random( 0, this.h / 2 ) : thisController.p_oOptions.yTarget );
					this.time = 0;
					this.count += 1;
					this.repeat += 1;
				}
			} else {
				this.time += ms;
			}
		};
		//## DRAW ==============================================================================================================
		this.p_oEffect.draw = function () {
			var thisEffect = this;
			var iIndex, fwl, pl;
			// Set up for next
			if (thisController.p_oOptions.hueIncrease) {
				// increase the hue to get different colored fireworks over time
				this.hue += thisController.p_oOptions.hueIncrease;
			} else {
				this.hue = this.random( thisController.p_oOptions.hueBase - thisController.p_oOptions.hueVariation, thisController.p_oOptions.hueBase - thisController.p_oOptions.hueVariation );
			}
			// normally, clearRect() would be used to clear the canvas
			// we want to create a trailing effect though
			// setting the composite operation to destination-out will allow us to clear the canvas at a specific opacity, rather than wiping it entirely
			thisEffect.context.globalCompositeOperation = 'destination-out';
			// decrease the alpha property to create more prominent trails
			thisEffect.context.fillStyle = 'rgba(0, 0, 0, ' + Math.min(1, 0.25) + ')'; // 0.25
			thisEffect.context.fillRect( 0, 0, this.w, this.h );
			// change the composite operation back to our main mode
			// lighter creates bright highlight points as the fireworks and particles overlap each other
			thisEffect.context.globalCompositeOperation = 'lighter';
			// Draw the fireworks:
			fwl = this.fireworks.length;
			for (iIndex = 0; iIndex < fwl; iIndex ++) {
				this.fireworks[iIndex].draw();
			}
			pl = this.particles.length;
			for (iIndex = 0; iIndex < pl; iIndex ++) {
				this.particles[iIndex].draw();
			}
		};
	}
  
  
	// Start!
	if (bStart) {
		this.start();
	}
};
APP.special_effect_canvas.alterEffect = function (oOptions) {
	var property;
	if(typeof oOptions != 'undefined'){
		for(property in oOptions){
			this.p_oOptions[property] = oOptions[property];
		}
	}
};
APP.special_effect_canvas.start = function () {
	var now, ms = 0, thisContoller = this, testingMsPerFrame, ms60fps;
  // If already playing, don't duplicate it
	if (thisContoller.p_iFrameRequestId > 0) { // TODO: change in ELM code
		return false;
	}
	ms60fps = (1000/60);
	APP.p_aActiveCanvases.push(this); // so that they can be cleared during navigation
	this.p_bIsPlaying = true;
	// the loop that will be added to the request frame call:
	function loop () {
		var frameMod, testingMsPerFrame;
		if (!thisContoller.p_bIsPlaying) {
			// paused: reset draw tme and do nothing this time
      thisContoller.p_iDrawTime = undefined; // TODO: change ELM code
			thisContoller.p_iFrameRequestId = window.requestCanvasAnimFrame(loop);
			return false;
		}
		// set milliseconds
		ms = 0;
		if (thisContoller.p_iDrawTime) {
			ms = Date.now() - thisContoller.p_iDrawTime;
		}
		thisContoller.p_iDrawCount ++;
		// TESTING FRAMERATE! 
    testingMsPerFrame = thisContoller.testingMsPerFrame || ms;
		frameMod = (Math.floor(testingMsPerFrame / ms60fps) || 1);
    // Here I am skipping frames on purpose to test what it would look like at different frame rates
		if (testingMsPerFrame && thisContoller.p_iDrawCount % frameMod !== 0) {
			// frame skipped!
		} else {
      // Do render!
			// update
			thisContoller.p_oEffect.update((thisContoller.mode === APP.MODE.CONST) ? testingMsPerFrame : ms60fps);
			// draw
			thisContoller.p_oEffect.draw();
			// record last draw time up for next loop
			thisContoller.p_iDrawTime = Date.now();
		}
		if (!thisContoller.p_oEffect.isDone) {
			// start the next frame request -- recursive
			thisContoller.p_iFrameRequestId = window.requestCanvasAnimFrame(loop);
		} else {
      // Done, so clear everything
			thisContoller.clear();
		}
	}
	// start!
	loop();
	// Started
	return true;
};
APP.special_effect_canvas.pause = function () {
	this.p_bIsPlaying = false;
};
APP.special_effect_canvas.togglePause = function () {
	this.p_bIsPlaying = this.p_bIsPlaying !== true;
};
APP.special_effect_canvas.clear = function () {
	// Cancel the next frame request
  if(window.cancelCanvasAnimFrame) {
    window.cancelCanvasAnimFrame(this.p_iFrameRequestId);
    this.p_iFrameRequestId = 0;
    this.p_bIsPlaying = false;
    this.p_iStartTime = undefined;
    this.p_iDrawTime = undefined;
    this.p_iDrawCount = 0;
    this.p_oEffect = undefined;
    this.p_oOptions = undefined;
    this.p_domContainer = document.getElementById(this.p_sId);
    this.p_domContainer.innerHTML = '';
  }
};
APP.special_effect_canvas.setTestingMsPerFrame = function (e) {
  var val = parseInt(e.target.value,10);
  if (val > 0) {
    this.testingMsPerFrame = 1000 / val;
  } else {
    this.testingMsPerFrame = 0;
  }
 
};
APP.special_effect_canvas.setTestingMode = function (e) {
  this.mode = parseInt(e.target.value,10);
};