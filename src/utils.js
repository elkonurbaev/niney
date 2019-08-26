function BoundsModel() {
    this.incubationTimer = new Timer(1000, 1);
    this.bounds = null;
    this.incubationBounds = null;
    
    var boundsModel = this;
    this.incubationTimer.timerHandler = function() {
        boundsModel.incubationBounds = boundsModel.bounds;
    };
}

BoundsModel.prototype.setBounds = function(bounds) {
    if (this.bounds == null) {
        this.bounds = bounds;
        this.incubationBounds = bounds;
        return;
    }
    if (this.bounds.equals(bounds)) {
        return;
    }
    
    this.bounds = bounds;
    this.setIncubationBounds();
}

BoundsModel.prototype.setIncubationBounds = function() {
    this.incubationTimer.reset();
    this.incubationTimer.start();
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

function AnimationTimer(duration) {
    this.delay = -1;
    this.numRepeats = -1;
    this.currentCount = 0;  // now - startTime
    this.scope = null;
    this.interval = -1;
    this.timerHandler = function() { };
    
    this.duration = duration;
    this.startTime = -1;
}

AnimationTimer.prototype = new Timer();
AnimationTimer.prototype.constructor = AnimationTimer;

AnimationTimer.prototype.start = function() {
    if (this.interval == -1) {
        this.startTime = performance.now();
        var timer = this;
        this.interval = window.requestAnimationFrame(preTick);
        
        function preTick() {
            timer.currentCount = performance.now() - timer.startTime;
            if ((timer.duration > -1) && (timer.currentCount > timer.duration)) {
                timer.currentCount = timer.duration;
                timer.tick();
                timer.stop();
            } else {
                timer.tick();
                timer.interval = window.requestAnimationFrame(preTick);
            }
        }
    }
};

AnimationTimer.prototype.stop = function() {
    if (this.interval != -1) {
        window.cancelAnimationFrame(this.interval);
        this.interval = -1;
        this.startTime = -1;
        this.currentCount = 0;
    }
};

AnimationTimer.prototype.reset = function() {
    this.stop();
};

function PanSpeedTimer() {
    this.delay = -1;
    this.numRepeats = -1;
    this.currentCount = 0;
    this.scope = null;
    this.interval = -1;
    this.timerHandler = function() { };
    
    this.duration = -1;
    this.startTime = -1;
    
    this.panned = false;
    this.panEvents = [];
}

PanSpeedTimer.prototype = new AnimationTimer();
PanSpeedTimer.prototype.constructor = PanSpeedTimer;

PanSpeedTimer.prototype.start = function(panEvent) {
    panEvent.time = performance.now();
    this.panEvents.push(panEvent);
    
    AnimationTimer.prototype.start.call(this);
}

PanSpeedTimer.prototype.resetAndGetSpeed = function(panEvent) {
    var speed = {h: 0, v: 0, z: 1};
    
    if (panEvent.touches == null) {
        this.push(panEvent);
    } else {
        // For touch events, make sure that only events with the same number of touches are included in the speed calculation.
        var eventSeries = [];
        for (var i = 0; i < this.panEvents.length; i++) {
            // Group them in series of subsequent events with the same number of touches.
            if ((i == 0) || (this.panEvents[i].touches.length != this.panEvents[i - 1].touches.length)) {
                eventSeries.push([this.panEvents[i]]);
            } else {
                eventSeries[eventSeries.length - 1].push(this.panEvents[i]);
            }
        }
        this.panEvents = eventSeries.sort(function(a, b) { return b.length - a.length; })[0];  // Select the event series with the most members.
        panEvent = this.panEvents[this.panEvents.length - 1];
    }
    var previousEvent = this.panEvents[0];
    var timeSpan = panEvent.time - previousEvent.time;
    if (timeSpan > 0) {
        speed.h = (panEvent.clientX - previousEvent.clientX) / timeSpan;
        speed.v = (panEvent.clientY - previousEvent.clientY) / timeSpan;
        if (panEvent.touches != null) {
            speed.z = Math.pow(panEvent.radius / previousEvent.radius, 1 / timeSpan);
        }
    }
    
    this.panned = false;
    this.panEvents = [];
    
    AnimationTimer.prototype.reset.call(this);
    
    return speed;
}

PanSpeedTimer.prototype.push = function(panEvent) {
    panEvent.time = performance.now();
    this.panned = true;
    this.panEvents.push(panEvent);
    while (panEvent.time - this.panEvents[0].time > 100) {
        this.panEvents.shift();
    }
}

function decorateTouchEvent(touchEvent, lastTouchOnly) {
    if (touchEvent.touches == null) {  // Not a touch event.
        return;
    }
    
    var touch = touchEvent.touches[touchEvent.touches.length - 1];
    if (touchEvent.touches.length == 0) {
        touchEvent.clientX = touchEvent.changedTouches[0].clientX;
        touchEvent.clientY = touchEvent.changedTouches[0].clientY;
        touchEvent.radius = 1;
    } else if ((touchEvent.touches.length == 1) || lastTouchOnly) {
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

