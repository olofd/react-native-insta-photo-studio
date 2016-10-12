export const swipeUpDetector = (newNativeEvent, oldNativeEvent) =>
    newNativeEvent.pageY <
    oldNativeEvent.pageY;
export const swipeDownDetector = (newNativeEvent, oldNativeEvent) =>
    newNativeEvent.pageY >
    oldNativeEvent.pageY;
export const swipeUpOrDownDetector = (newNativeEvent, oldNativeEvent) =>
    newNativeEvent.pageY !==
    oldNativeEvent.pageY;

export class BaseDelegator {

    constructor(detector, events) {
        this.detector = detector;
        this.events = events;
    }

    onTouchStart(newNativeEvent) {
        this.swipeStartPoint = undefined;
    }

    willStartAnimating() {
      this.events.willStartAnimating();
    }

    delegate(newNativeEvent, oldNativeEvent) {
        if (newNativeEvent.pageY !== this.swipeStartPoint) {
            const move = this.swipeStartPoint - newNativeEvent.pageY;
            const fixedValue = this.events.getAnimationValue(move);
            if (fixedValue !== undefined) {
              this.hasAnimated = true;
              this.animate(move, fixedValue, newNativeEvent, oldNativeEvent);
            }
        }
        return true;
    }

    acceptEvent() {
      return false;
    }

    onTouchMove(newNativeEvent, oldNativeEvent, lastStartEvent) {
        if (oldNativeEvent) {
            if (this.swipeStartPoint !== undefined) {
                return this.delegate(newNativeEvent);
            }
            const acceptEvent = this.detector(newNativeEvent,
                oldNativeEvent);
            if (acceptEvent && this.acceptEvent(newNativeEvent, oldNativeEvent, lastStartEvent)) {
                if (!this.swipeStartPoint) {
                    this.events.willStartAnimating();
                    this.swipeStartPoint = newNativeEvent.pageY;
                }
                return this.delegate(newNativeEvent, oldNativeEvent);
            }
        }
        return false;
    }

    onTouchEnd(newNativeEvent, lastMoveEvent, lastStartEvent) {
        if (lastMoveEvent && this.hasAnimated) {
            const distanceTraveled = (this.swipeStartPoint - lastMoveEvent.pageY);
            if (distanceTraveled > -50 && distanceTraveled < 50) {
                this.events.resetAnimation();
                return;
            }
            this.events.finnishAnimation(distanceTraveled > 0);
        }
        this.hasAnimated = false;
    }
}

export class ContentOffsetDelegator extends BaseDelegator {

  constructor(detector, events, controlScrollViewEvents) {
    super(detector, events);
    this.controlScrollViewEvents = controlScrollViewEvents;
    this.bounces = true;
    this.delegateMoveEvent = false;
  }

  onScroll(newNativeEvent) {
    this.delegateMoveEvent = newNativeEvent.contentOffset.y <= 0;
    return this.delegateMoveEvent;
  }

  acceptEvent() {
    return this.delegateMoveEvent;
  }

  animate(move, fixedValue) {
    if (this.bounces) {
        this.bounces = false;
        this.controlScrollViewEvents.setBounce(this.bounces);
    }
    this.events.animate(move, fixedValue);
  }

  onTouchEnd(newNativeEvent, lastMoveEvent, lastStartEvent) {
      this.bounces = true;
      this.controlScrollViewEvents.setBounce(this.bounces);
      super.onTouchEnd(newNativeEvent, lastMoveEvent, lastStartEvent);
  }
}

export class BoundarySwipeDelgator extends BaseDelegator {

  constructor(detector, boundary, events, controlScrollViewEvents) {
    super(detector, events);
    this.scrollEnabled = true;
    this.boundary = boundary;
    this.delegateMoveEvent = false;
    this.controlScrollViewEvents = controlScrollViewEvents || {};
  }

  acceptEvent(newNativeEvent) {
    return newNativeEvent.pageY < this.boundary;
  }

  animate(move, fixedValue) {
    if (this.scrollEnabled) {
        this.scrollEnabled = false;
        this.controlScrollViewEvents.setScrollEnabled && this.controlScrollViewEvents.setScrollEnabled(this.scrollEnabled);
    }
    this.events.animate(move, fixedValue);
  }

  onTouchEnd(newNativeEvent, lastMoveEvent, lastStartEvent) {
      this.scrollEnabled = true;
      this.controlScrollViewEvents.setScrollEnabled && this.controlScrollViewEvents.setScrollEnabled(this.scrollEnabled);
      super.onTouchEnd(newNativeEvent, lastMoveEvent, lastStartEvent);
  }
}

export class ScrollViewPanDelegator {

    constructor(delegators) {
        this.delegators = delegators;
        this.lastMoveEvent = null;
        this.lastScrollEvent = null;
    }

    onScroll(e) {
        this.delegateEvent('onScroll', e.nativeEvent);
        this.lastScrollEvent = e.nativeEvent;
    }

    resetState() {
        this.currentDelegator = null;
        this.lastMoveEvent = null;
        this.lastStartEvent = null;
    }

    onTouchStart(e) {
        this.resetState();
        this.delegateEvent('onTouchStart', e.nativeEvent);
        this.lastStartEvent = e.nativeEvent;
    }

    onTouchMove(e) {
        this.delegateEvent('onTouchMove', e.nativeEvent, this.lastMoveEvent,
            this.lastStartEvent);
        this.lastMoveEvent = e.nativeEvent;
    }

    onTouchEnd(e) {
        this.delegateEvent('onTouchEnd', e.nativeEvent, this.lastMoveEvent,
            this.lastStartEvent);
    }

    delegateEvent(event, ...args) {
        if (this.currentDelegator) {
            this.currentDelegator[event] && this.currentDelegator[event](...args);
            return;
        }
        for (var i = 0; i < this.delegators.length; i++) {
            const delegator = this.delegators[i];
            const acceptsEvent = delegator[event] && delegator[event](...args);
            if (acceptsEvent) {
                this.currentDelegator = delegator;
                break;
            }
        }
    }
}
