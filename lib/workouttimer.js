var util = require("util");
var EventEmitter = require("events").EventEmitter;

var RESTNAME = "Rest";

var WorkoutTimer = function () {
	EventEmitter.call(this);
	this.elements = [];
};

util.inherits(WorkoutTimer, EventEmitter);

WorkoutTimer.prototype.addExercise = function (name, duration) {
	this.elements.push({name: name, duration: duration});
};

WorkoutTimer.prototype.addRestPeriod = function (duration) {
	this.elements.push({name: RESTNAME, duration: duration});
};

WorkoutTimer.prototype.start = function () {
	if (this.startTime) {
		return;
	}

	this.startTime = Date.now();
	this.addStartAndStopDurationToElements();
	this.totalDuration = this.calculateTotalDuration();
	this.emit("start");
	this.tickingInterval = setInterval(this.tick.bind(this), this.tickingDelay);
	this.endTimeout = setTimeout(this.endAfterTotalDuration.bind(this), this.totalDuration);
};

WorkoutTimer.prototype.tickingDelay = 100;

WorkoutTimer.prototype.tick = function () {
	var elapsedTime = Date.now() - this.startTime;
	if (elapsedTime > this.totalDuration) {
		clearInterval(this.tickingInterval);
		return;
	}

	var currentElement = this.getElementAfter(elapsedTime);
	var info = {
		currentElement : currentElement,
		time: {
			elapsed : {
				total: elapsedTime,
				element: elapsedTime - currentElement.startAt
			},
			remaining : {
				total: this.totalDuration - elapsedTime, 
				element: currentElement.stopAt - elapsedTime
			},
		}
	};
	this.emit("tick", info);
};

WorkoutTimer.prototype.getElementAfter = function (elapsedTime) {
	var candidates = this.elements.filter(function (element) {
		return elapsedTime >= element.startAt && elapsedTime <= element.stopAt;
	});
	return candidates[0];
};

WorkoutTimer.prototype.addStartAndStopDurationToElements = function () {
	var duration = 0;
	this.elements.forEach(function (element) {
		element.startAt = duration;
		duration += element.duration;
		element.stopAt = duration;
	});
};

WorkoutTimer.prototype.endAfterTotalDuration = function () {
	clearTimeout(this.endTimeout);
	this.emit("end");
};

WorkoutTimer.prototype.calculateTotalDuration = function () {
	return this.elements.reduce(function (durationSoFar, element) {
		return durationSoFar + element.duration;
	}, 0, this);
};

module.exports = WorkoutTimer;
module.exports.RESTNAME = RESTNAME;
