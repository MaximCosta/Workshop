class Vehicle {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector(1, 0);
        this.acc = createVector(0, 0);
        this.maxSpeed = 4;
        this.maxForce = 0.2;
        this.r = 16;

        this.wanderTheta = PI / 2;

        this.currentPath = [];
        this.paths = [this.currentPath];
    }

    wander() {
        let wanderPoint, wanderRadius, theta, x, y, steer, displaceRange;

        wanderPoint = this.vel.copy();
        wanderPoint.setMag(slider1.value());
        wanderPoint.add(this.pos);
        fill(255, 0, 0);
        noStroke();

        //renderred red dot
        // circle(wanderPoint.x, wanderPoint.y, 8);

        wanderRadius = slider2.value();
        noFill();

        //rener circle and vector to center of circle
        // stroke(255, 200);
        // circle(wanderPoint.x, wanderPoint.y, wanderRadius * 2);
        // line(this.pos.x, this.pos.y, wanderPoint.x, wanderPoint.y);

        theta = this.wanderTheta + this.vel.heading();

        x = wanderRadius * cos(theta);
        y = wanderRadius * sin(theta);
        wanderPoint.add(x, y);

        //render vector to center of circle target and target
        // fill(0, 255, 0);
        // noStroke();
        // circle(wanderPoint.x, wanderPoint.y, slider3.value() * 100);

        // stroke(255, 150);
        // line(this.pos.x, this.pos.y, wanderPoint.x, wanderPoint.y);

        steer = wanderPoint.sub(this.pos);
        steer.setMag(this.maxForce);
        this.applyForce(steer);

        displaceRange = slider3.value();
        if (!pause) this.wanderTheta += random(-displaceRange, displaceRange);
    }

    // evade(vehicle) {
    //     let pursuit = this.pursue(vehicle);
    //     pursuit.mult(-1);
    //     return pursuit;
    // }

    // pursue(vehicle) {
    //     let target = vehicle.pos.copy();
    //     let prediction = vehicle.vel.copy();
    //     prediction.mult(10);
    //     target.add(prediction);
    //     fill(0, 255, 0);
    //     circle(target.x, target.y, 16);
    //     return this.seek(target);
    // }

    // arrive(target) {
    //     return this.seek(target, true);
    // }

    // flee(target) {
    //     return this.seek(target).mult(-1);
    // }

    // seek(target, arrival = false) {
    //     let force = p5.Vector.sub(target, this.pos);
    //     let desiredSpeed = this.maxSpeed;
    //     if (arrival) {
    //         let slowRadius = 100;
    //         let distance = force.mag();
    //         if (distance < slowRadius) {
    //             desiredSpeed = map(distance, 0, slowRadius, 0, this.maxSpeed);
    //         }
    //     }
    //     force.setMag(desiredSpeed);
    //     force.sub(this.vel);
    //     force.limit(this.maxForce);
    //     return force;
    //}

    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.set(0, 0);

        this.currentPath.push(this.pos.copy());

        let total = 0;
        for (let path of this.paths) {
            total += path.length;
        }

        if (total > 100) {
            this.paths[0].shift();
            if (this.paths[0].length === 0) {
                this.paths.shift();
            }
        }
    }

    show() {
        stroke(255);
        strokeWeight(2);
        fill(255);
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);
        pop();

        //render path
        for (let path of this.paths) {
            beginShape();
            noFill();
            for (let v of path) {
                vertex(v.x, v.y);
            }
            endShape();
        }
    }

    edges() {
        let hitEdge = false;
        if (this.pos.x > width + this.r) {
            this.pos.x = -this.r;
            hitEdge = true;
        } else if (this.pos.x < -this.r) {
            this.pos.x = width + this.r;
            hitEdge = true;
        }
        if (this.pos.y > height + this.r) {
            this.pos.y = -this.r;
            hitEdge = true;
        } else if (this.pos.y < -this.r) {
            this.pos.y = height + this.r;
            hitEdge = true;
        }

        if (hitEdge) {
            this.currentPath = [];
            this.paths.push(this.currentPath);
        }
    }
}

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
let nb_vechicles = 50;
let vehicles = [];
let slider1, slider2, slider3;
let pause = false;

function setup() {
    createCanvas(windowWidth, windowHeight - 25);

    for (let i = 0; i < nb_vechicles; i++) { vehicles.push(new Vehicle(rnd(0, width), rnd(0, height))); }
    slider1 = createSlider(100, 250, 150);
    slider2 = createSlider(50, 100, 50);
    slider3 = createSlider(0.1, 0.5, 0.25, 0.01);
}

function draw() {
    background(0);

    for (const vehicle of vehicles) {
        vehicle.wander();
        vehicle.update();
        vehicle.show();
        vehicle.edges();
    }

}