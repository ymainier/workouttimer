var util = require("util");
var EventEmitter = require("events").EventEmitter;

var RESTNAME = "Rest";

var WorkoutTimer = function () {
	EventEmitter.call(this);
	this.elements = [];
};

util.inherits(WorkoutTimer, EventEmitter);

WorkoutTimer.prototype.addExercise = function (name, durationInSecond) {
	this.elements.push({name: name, duration: durationInSecond});
};

WorkoutTimer.prototype.addRestPeriod = function (durationInSecond) {
	this.elements.push({name: RESTNAME, duration: durationInSecond});
};

WorkoutTimer.prototype.start = function () {
	if (this.startTime) {
		return;
	}

	this.startTime = Date.now();
	this.totalDuration = this.calculateTotalDuration() * 1000;
	this.emit("start");
	this.tickingInterval = setInterval(this.performEachSecond.bind(this), 1000);
};

WorkoutTimer.prototype.performEachSecond = function () {
	var elapsedTime = Date.now() - this.startTime;
	this.emit("tick", {totalElapsedTime: elapsedTime});
	if (elapsedTime >= this.totalDuration) {
		clearInterval(this.tickingInterval);
		this.emit("end");
		return;
	}
};

WorkoutTimer.prototype.calculateTotalDuration = function () {
	return this.elements.reduce(function (durationSoFar, element) {
		return durationSoFar + element.duration;
	}, 0, this);
};

module.exports = WorkoutTimer;
module.exports.RESTNAME = RESTNAME;
