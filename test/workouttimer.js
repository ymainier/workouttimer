var WorkoutTimer = require("../lib/workouttimer");
var chai = require("chai")
var expect = chai.expect;
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
chai.use(sinonChai);

describe("Workout Timer", function () {
	it("should be able to add exercise and rest", function () {
		var timer = new WorkoutTimer();
		timer.addExercise("Abs", 60);
		timer.addRestPeriod(30);
		timer.addExercise("Squat", 120);
		expect(timer.elements).to.eql([
			{name: "Abs", duration: 60},
			{name: WorkoutTimer.RESTNAME, duration: 30},
			{name: "Squat", duration: 120}
		]);
	});

	describe("start", function () {
		beforeEach(function () {
			this.clock = sinon.useFakeTimers();
		});

		afterEach(function () {
			this.clock.restore();
		});

		it("should emit a start, tick every second and finally emit a end", function () {
			var timer = new WorkoutTimer();
			var spies = {
				start: sinon.spy(),
				tick: sinon.spy(),
				end: sinon.spy()
			};

			timer.on("start", spies.start);
			timer.on("tick", spies.tick);
			timer.on("end", spies.end);
			timer.addExercise("Abs", 2000);
			timer.addExercise("Squat", 1000);

			timer.start();
			expect(spies.start).to.have.been.called;
			expect(spies.tick.callCount).to.equal(0);
			this.clock.tick(1000);
			expect(spies.tick).to.have.been.calledWith({
				time: {
					elapsed: { element: 1000, total: 1000 },
					remaining: { element: 1000, total: 2000 }
				},
				currentElement: timer.elements[0]
			});
			expect(spies.end).not.to.have.been.called;
			this.clock.tick(1000);
			expect(spies.tick).to.have.been.calledWith({
				time: {
					elapsed: { element: 2000, total: 2000 },
					remaining: { element: 0, total: 1000 }
				},
				currentElement: timer.elements[0]
			});
			expect(spies.end).not.to.have.been.called;
			this.clock.tick(1000);
			expect(spies.tick).to.have.been.calledWith({
				time: {
					elapsed: { element: 1000, total: 3000 },
					remaining: { element: 0, total: 0 }
				},
				currentElement: timer.elements[1]
			});
			expect(spies.end).to.have.been.called;
		});
	});

	describe("calculateTotalDuration", function () {
		it("should be 0 when there is no workout element", function () {
			var timer = new WorkoutTimer();
			expect(timer.calculateTotalDuration()).to.equal(0);
		});

		it("should add the duration of workout element", function () {
			var timer = new WorkoutTimer();
			timer.addExercise("Abs", 60);
			timer.addRestPeriod(30);
			timer.addExercise("Squat", 120);

			expect(timer.calculateTotalDuration()).to.equal(210);
		});
	});
});
