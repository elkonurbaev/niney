function MapController(element, env, scope) {
    var mouseWheelTime = performance.now();
    var mouseWheelDelta = -1;
    
    var panTimer = new PanSpeedTimer();  // Role of timer is 2-fold: measure pan speed, but also apply digest cycle every tick.
    panTimer.scope = scope;
    panTimer.timerHandler = function() { env.focusModel.panimate(); };
    
    element.addEventListener("wheel", mouseWheelHandler);
    element.addEventListener("mousedown", pressHandler);
    element.addEventListener("touchstart", pressHandler);
    document.addEventListener("mousemove", mouseMoveHandler);
    
    function mouseWheelHandler(mouseEvent) {
        mouseEvent.preventDefault();
        
        var delta = mouseEvent.deltaY;
        if (delta == 0) {
            return;
        }
        
        var width = env.boundsModel.bounds.width;
        var height = env.boundsModel.bounds.height;
        
        var cs = env.focusModel.centerScale;
        var acs = env.focusModel.animationCenterScale;
        
        if (env.mouseWheelAction == "HORIZONTAL_PAN") {
            if (delta > 0) {
                env.focusModel.setCenterScale(new CenterScale(
                    cs.centerX - acs.getNumWorldCoords(width / 2),
                    cs.centerY,
                    cs.scale
                ));
            } else {
                env.focusModel.setCenterScale(new CenterScale(
                    cs.centerX + acs.getNumWorldCoords(width / 2),
                    cs.centerY,
                    cs.scale
                ));
            }
        } else if (env.mouseWheelAction == "VERTICAL_PAN") {
            if (delta > 0) {
                env.focusModel.setCenterScale(new CenterScale(
                    cs.centerX,
                    cs.centerY + acs.getNumWorldCoords(height / 2),
                    cs.scale
                ));
            } else {
                env.focusModel.setCenterScale(new CenterScale(
                    cs.centerX,
                    cs.centerY - acs.getNumWorldCoords(height / 2),
                    cs.scale
                ));
            }
        } else {  // ZOOM
            var now = performance.now();
            var reverseZoom = (mouseWheelDelta * delta < 0);
            if (!env.focusModel.scaleToZoomLevels || (mouseWheelTime < now - 250) || reverseZoom) {
                mouseWheelTime = now;
                mouseWheelDelta = delta;
                
                var zoomFactor = env.focusModel.scaleToZoomLevels? 2: 1.3;
                if (delta < 0) {
                    zoomFactor = 1 / zoomFactor;
                }
                
                var mouseX = mouseEvent.clientX - element.getBoundingClientRect().left;
                var mouseY = mouseEvent.clientY - element.getBoundingClientRect().top;
                
                var worldX = acs.getWorldX(width, mouseX);
                var worldY = acs.getWorldY(height, mouseY);
                var scale = (reverseZoom? acs.scale: cs.scale) * zoomFactor;
                
                var pixXOffset = mouseX - (width / 2);
                var pixYOffset = mouseY - (height / 2);
                
                env.focusModel.zoom(new CenterScale(worldX, worldY, scale), pixXOffset, pixYOffset);
            }
        }
    }
    
    function pressHandler(event) {
        if (panTimer.isRunning()) {  // From 1 to 2 fingers is not a true press anymore.
            return;
        }
        
        event.preventDefault();
        decorateTouchEvent(event, false);
        
        var pressX = event.clientX - element.getBoundingClientRect().left;
        var pressY = event.clientY - element.getBoundingClientRect().top;
        
        var width = env.boundsModel.bounds.width;
        var height = env.boundsModel.bounds.height;
        
        var cs = env.focusModel.animationCenterScale;
        var worldX = cs.getWorldX(width, pressX);
        var worldY = cs.getWorldY(height, pressY);
        
        var pixXOffset = pressX - (width / 2);
        var pixYOffset = pressY - (height / 2);
        
        env.focusModel.grab(worldX, worldY, pixXOffset, pixYOffset);
        
        panTimer.start(event);
        
        if (event.type == "mousedown") {
            document.addEventListener("mouseup", releaseHandler);
        } else {  // touchstart
            document.addEventListener("touchmove", touchMoveHandler);
            document.addEventListener("touchend", releaseHandler);
            document.addEventListener("touchcancel", releaseHandler);
        }
        
        if (env.pressFunction != null) {
            if (scope != null) {
                scope.$apply(env.pressFunction(worldX, worldY));
            } else {
                env.pressFunction(worldX, worldY);
            }
        }
    }
    
    function mouseMoveHandler(mouseEvent) {
        if (!panTimer.isRunning() && (env.mouseMoveFunction == null)) {
            return;
        }
        
        mouseEvent.preventDefault();
        
        var mouseX = mouseEvent.clientX - element.getBoundingClientRect().left;
        var mouseY = mouseEvent.clientY - element.getBoundingClientRect().top;
        
        var width = env.boundsModel.bounds.width;
        var height = env.boundsModel.bounds.height;
        
        if (panTimer.isRunning()) {
            var pixXOffset = mouseX - (width / 2);
            var pixYOffset = mouseY - (height / 2);
            
            env.focusModel.pan(pixXOffset, pixYOffset);
            
            panTimer.push(mouseEvent);
        } else {  // (env.mouseMoveFunction != null)
            var cs = env.focusModel.animationCenterScale;
            var worldX = cs.getWorldX(width, mouseX);
            var worldY = cs.getWorldY(height, mouseY);
            
            if (scope != null) {
                scope.$apply(env.mouseMoveFunction(worldX, worldY));
            } else {
                env.mouseMoveFunction(worldX, worldY);
            }
        }
    }
    
    function touchMoveHandler(touchEvent) {
        touchEvent.preventDefault();
        decorateTouchEvent(touchEvent, false);
        
        var pinchX = touchEvent.clientX - element.getBoundingClientRect().left;
        var pinchY = touchEvent.clientY - element.getBoundingClientRect().top;
        
        var width = env.boundsModel.bounds.width;
        var height = env.boundsModel.bounds.height;
        
        var pixXOffset = pinchX - (width / 2);
        var pixYOffset = pinchY - (height / 2);
        
        var previousEvent = panTimer.panEvents[panTimer.panEvents.length - 1];
        if ((touchEvent.touches.length == 1) && (previousEvent.touches.length == 1)) {
            env.focusModel.pan(pixXOffset, pixYOffset);
        } else {
            var cs = env.focusModel.animationCenterScale;
            var worldX = -1;
            var worldY = -1;
            var scale = cs.scale;
            
            if (touchEvent.touches.length != previousEvent.touches.length) {
                worldX = cs.getWorldX(width, pinchX);
                worldY = cs.getWorldY(height, pinchY);
            } else {
                worldX = env.focusModel.animation.target.centerX;
                worldY = env.focusModel.animation.target.centerY;
                scale = env.focusModel.animation.target.scale / (touchEvent.radius / previousEvent.radius);
            }
            
            env.focusModel.pinchPan(new CenterScale(worldX, worldY, scale), pixXOffset, pixYOffset);
        }
        
        panTimer.push(touchEvent);
    }
    
    function releaseHandler(event) {
        if ((event.touches != null) && (event.touches.length > 0)) {  // From 2 to 1 fingers is not a true release yet.
            return;
        }
        
        decorateTouchEvent(event, false);
        
        var cs = env.focusModel.animationCenterScale;
        
        var tapped = ((panTimer.currentCount < 500) && (panTimer.panEvents.length == 1));
        var speed = panTimer.resetAndGetSpeed(event);
        if ((speed.h != 0) || (speed.v != 0) || (speed.z != 1)) {
            var zoomLevelPolicy = FocusModel.NEVER;  // On touch devices, don't do the zoom level check.
            if (event.type == "mouseup") {
                zoomLevelPolicy = FocusModel.IF_REQUIRED;
            }
            env.focusModel.setCenterScale(new CenterScale(
                cs.centerX - cs.getNumWorldCoords(speed.h) * 250,  // 250 = 1000 / 4 = animationDuration / deceleration
                cs.centerY + cs.getNumWorldCoords(speed.v) * 250,
                cs.scale / Math.pow(speed.z, 250)
            ), zoomLevelPolicy);
        }
        
        if (event.type == "mouseup") {
            document.removeEventListener("mouseup", releaseHandler);
        } else {  // touchend || touchcancel
            document.removeEventListener("touchmove", touchMoveHandler);
            document.removeEventListener("touchend", releaseHandler);
            document.removeEventListener("touchcancel", releaseHandler);
            
            // Stop emulated mouse event. Calling touchEvent.preventDefault() does not prevent mouse emulation in iOS.
            element.removeEventListener("mousedown", pressHandler);
            setTimeout(function() { element.removeEventListener("mousedown", pressHandler); element.addEventListener("mousedown", pressHandler); }, 1000);
        }
        
        if ((env.releaseFunction != null) || ((env.tapFunction != null) && tapped)) {
            var releaseX = event.clientX - element.getBoundingClientRect().left;
            var releaseY = event.clientY - element.getBoundingClientRect().top;
            
            var width = env.boundsModel.bounds.width;
            var height = env.boundsModel.bounds.height;
            
            var worldX = cs.getWorldX(width, releaseX);
            var worldY = cs.getWorldY(height, releaseY);
            
            if (env.releaseFunction != null) {
                if (scope != null) {
                    scope.$apply(env.releaseFunction(worldX, worldY));
                } else {
                    env.releaseFunction(worldX, worldY);
                }
            }
            if ((env.tapFunction != null) && tapped) {
                if (scope != null) {
                    scope.$apply(env.tapFunction(worldX, worldY));
                } else {
                    env.tapFunction(worldX, worldY);
                }
            }
        }
    }
}

