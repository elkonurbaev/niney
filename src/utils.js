function BoundsModel() {
    this.bounds = null;
}

BoundsModel.prototype.setBounds = function(bounds) {
    if (bounds.equals(this.bounds)) {
        return;
    }
    this.bounds = bounds;
}

function Bounds(width, height) {
    this.width = width;
    this.height = height;
}

Bounds.prototype.equals = function(o) {
    return ((o != null) && (this.width == o.width) && (this.height == o.height));
};

function Timer(delay, numRepeats) {
    this.delay = delay;
    this.numRepeats = numRepeats;
    this.currentCount = 0;
    this.scope = null;
    this.interval = -1;
    this.timerHandler = function() { };
}

Timer.prototype.start = function() {
    if ((this.interval == -1) && ((this.currentCount < this.numRepeats) || (this.numRepeats == -1))) {
        var timer = this;
        this.interval = setInterval(function() {
            timer.currentCount++;
            timer.tick();
            if (timer.currentCount == timer.numRepeats) {
                timer.stop();
            }
        }, this.delay);
    }
};

Timer.prototype.stop = function() {
    if (this.interval != -1) {
        clearInterval(this.interval);
        this.interval = -1;
    }
};

Timer.prototype.reset = function() {
    this.stop();
    this.currentCount = 0;
};

Timer.prototype.isRunning = function() {
    return (this.interval != -1);
};

Timer.prototype.tick = function() {
    if (this.scope != null) {
        this.scope.$apply(this.timerHandler);
    } else {
        this.timerHandler.apply();
    }
};

function PanSpeedTimer(delay, numRepeats) {
    this.delay = delay;
    this.numRepeats = numRepeats;
    this.currentCount = 0;
    this.scope = null;
    this.interval = -1;
    
    this.panEvent = null;
    this.lastPoint0 = null;
    this.lastPoint1 = null;
    this.lastPointWas0 = false;
    this.speed = {h: -1, v: -1};
    
    var panSpeedTimer = this;
    this.timerHandler = function() {
        if (!panSpeedTimer.lastPointWas0) {
            panSpeedTimer.lastPoint0 = {
                x: panSpeedTimer.panEvent.clientX,
                y: panSpeedTimer.panEvent.clientY,
                numTouches: (panSpeedTimer.panEvent.touches? panSpeedTimer.panEvent.touches.length: 1),
                time: (new Date()).getTime()
            };
            panSpeedTimer.lastPointWas0 = true;
        } else {
            panSpeedTimer.lastPoint1 = {
                x: panSpeedTimer.panEvent.clientX,
                y: panSpeedTimer.panEvent.clientY,
                numTouches: (panSpeedTimer.panEvent.touches? panSpeedTimer.panEvent.touches.length: 1),
                time: (new Date()).getTime()
            };
            panSpeedTimer.lastPointWas0 = false;
        }
    };
}

PanSpeedTimer.prototype = new Timer();
PanSpeedTimer.prototype.constructor = PanSpeedTimer;

PanSpeedTimer.prototype.start = function() {
    this.lastPoint0 = {
        x: this.panEvent.clientX,
        y: this.panEvent.clientY,
        numTouches: (this.panEvent.touches? this.panEvent.touches.length: 1),
        time: (new Date()).getTime()
    };
    this.lastPointWas0 = true;
    
    Timer.prototype.start.call(this);
}

PanSpeedTimer.prototype.resetAndGetSpeed = function() {
    if (this.lastPoint1 == null) {
        // timerHandler has not been called yet. Use the initial point, no other point is available.
    } else if (this.lastPointWas0) {
        // Then use point 1, else use point 0. Always use the oldest point available.
        this.lastPoint0 = this.lastPoint1;
    }
    
    if ((this.panEvent.touches == null) || (this.panEvent.touches.length == this.lastPoint0.numTouches)) {
        var timeSpan = (new Date()).getTime() - this.lastPoint0.time;
        this.speed.h = (this.panEvent.clientX - this.lastPoint0.x) / timeSpan;
        this.speed.v = (this.panEvent.clientY - this.lastPoint0.y) / timeSpan;
    } else {
        this.speed.h = 0;
        this.speed.v = 0;
    }
    
    this.lastPoint0 = null;
    this.lastPoint1 = null;
    this.lastPointWas0 = false;
    
    Timer.prototype.reset.call(this);
    
    return this.speed;
}

function decorateTouchEvent(touchEvent, lastTouchOnly) {
    if (touchEvent.touches == null) {  // Not a touch event.
        return;
    }
    
    var touch = touchEvent.touches[touchEvent.touches.length - 1];
    if ((touchEvent.touches.length == 1) || lastTouchOnly)  {
        touchEvent.clientX = touch.clientX;
        touchEvent.clientY = touch.clientY;
        touchEvent.radius = 1;
    } else {  // 2 or more touches.
        var minX = touch.clientX;
        var minY = touch.clientY;
        var maxX = touch.clientX;
        var maxY = touch.clientY;
        for (var i = 0; i < touchEvent.touches.length - 1; i++) {
            touch = touchEvent.touches[i];
            if (minX > touch.clientX) {
                minX = touch.clientX;
            }
            if (minY > touch.clientY) {
                minY = touch.clientY;
            }
            if (maxX < touch.clientX) {
                maxX = touch.clientX;
            }
            if (maxY < touch.clientY) {
                maxY = touch.clientY;
            }
        }
        touchEvent.clientX = (minX + maxX) / 2;
        touchEvent.clientY = (minY + maxY) / 2;
        touchEvent.radius = Math.sqrt((maxX - minX) * (maxX - minX) + (maxY - minY) * (maxY - minY));
    }
}

