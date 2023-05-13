class Player {
    constructor(x, y, r) {
        const options = {
            restitution: 0,
            density: 1,
            friction: 0.05,
            frictionAir: 0.05
        };
        this.body = Matter.Bodies.circle(x, y, r, options);
        this.sight = 500;
    }

    display() {
        const { position: { x, y }, circleRadius: r, angle } = this.body;
        strokeWeight(4);
        stroke("green");
        fill("yellow");
        ellipse(x, y, r * 2);

        stroke(255)
        line(x, y, x - cos(angle) * r, y - sin(angle) * r)
    }

    castRays() {
        let res = [];
        for (let angle = -Math.PI / 4 + this.body.angle; angle <= Math.PI / 4 + this.body.angle; angle += Math.PI/250) {
            collisions = raycast(engine.world.bodies, 
                                      {x: this.body.position.x,
                                       y: this.body.position.y},
                                      {x: this.body.position.x - Math.cos(angle) * this.sight,
                                       y: this.body.position.y - Math.sin(angle) * this.sight},
                                     );
            if (collisions[1]) res.push(collisions[1]);
            else res.push({point: {x: Infinity, y: Infinity}})
        }
        return res;
    }

    moveForward() {
        Matter.Body.applyForce(this.body, 
                               this.body.position, 
                               {x: Math.cos(this.body.angle) * -0.03, 
                                y: Math.sin(this.body.angle) * -0.03});
    }

    turnLeft() {
        Matter.Body.rotate(this.body, -0.03);
        Matter.Body.setAngularVelocity(player.body, 0);
    }

    turnRight() {
        Matter.Body.rotate(this.body, 0.03);
        Matter.Body.setAngularVelocity(player.body, 0);
    }
}

let walls = [];
let bumpers = [];
let player;
let engine;
let collisions;

function show2D() {
    strokeWeight(1)
    for (const e of walls) {
        fill(255, 0, 255);
        noStroke();
        beginShape();
        e.vertices.forEach(({ x, y }) => vertex(x, y));
        endShape();
    }

    player.display();
}

function setup() {
    createCanvas(900, 600);
    engine = Matter.Engine.create();
    engine.gravity.y = 0;

    walls.push(
        Matter.Bodies.rectangle( // rectangle(x, y, w, h, options)
            width / 2, 0, width, 30, { isStatic: true } // ceiling
        ),
        Matter.Bodies.rectangle( // left wall
            0, height / 2, 30, height, { isStatic: true } 
        ),
        Matter.Bodies.rectangle( // right wall
            width, height / 2, 30, height, { isStatic: true } 
        ),
        Matter.Bodies.rectangle( // left ramp
            30, height - 90, width / 2, 30, { isStatic: true, angle: 0.5 } 
        ),
        Matter.Bodies.rectangle( // right ramp
            width - 30, height - 90, width / 2, 30, { isStatic: true, angle: -0.5 } 
        ),
        Matter.Bodies.rectangle( // chute wall
            width - 60, height / 2 + 30, 15, 2 / 3 * height, { isStatic: true } 
        ),
        Matter.Bodies.rectangle( // left topper
            30, 20, 200, 30, { isStatic: true, angle: -0.5 }
        ),
        Matter.Bodies.rectangle( // right topper
            width-30, 20, 200, 30, { isStatic: true, angle: 0.5 }
        ),
    );
    Matter.Composite.add(engine.world, walls);

    player = new Player(width - 15, height / 2, 5);
    Matter.Composite.add(engine.world, player.body);
    player.body.label = "player";
}

function draw() {
    background(30);
    noStroke();
    strokeWeight(1);

    fill(0, 128, 50);
    rect(0, height/2, width, height/2)

    fill(50, 50, 200);
    rect(0, 0, width, height/2)
    
    let collisions = player.castRays();
    for (let i = 0; i < collisions.length; i++) {
        let d = dist(player.body.position.x, player.body.position.y, collisions[i].point.x, collisions[i].point.y)
        let sliceHeight = 900 / (d*0.1);
        fill(255 / (d*0.02))
        rect(i*width/collisions.length, height/2 - sliceHeight/2, width/collisions.length, sliceHeight)
    }
    // show2D();

    if (keyIsDown(UP_ARROW)) {
        player.moveForward();
    }
    if (keyIsDown(LEFT_ARROW)) {
        player.turnLeft();
    } else if (keyIsDown(RIGHT_ARROW)) {
        player.turnRight();
    } 
    Matter.Engine.update(engine);
}


// // Import some stuff from matter.js
// const { Engine, World, Bodies, Body, Vector, SAT } = Matter;

// // Our world and engine
// let world, engine;

// // An array of all bodies
// let bodies = [];

// // A class for all bodies displayed in p5.js
// class _Body {
//   constructor(body){
//     this.body = body;

//     // Add the body to the world
//     World.add(world, this.body);
//   }
//   draw(){
//     // Draw the body by its vertices
//     fill(100);
//     stroke(0);
//     let pos = this.body.position;
//     let angle = this.body.angle;
//     beginShape();
//     for(var i = 0; i < this.body.vertices.length; i++){
//       vertex(this.body.vertices[i].x, this.body.vertices[i].y);
//     }
//     endShape();
//   }
// }

// function setup(){
//   // Setting up our p5.js environment
//   createCanvas(800, 400);
//   angleMode(RADIANS);
//   rectMode(CENTER);
//   noStroke();

//   // Configuring and creating our matter world and engine
//   engine = Engine.create({
//     gravity: {
//       y: 2.5
//     }
//   });
//   world = engine.world;
//   Matter.Runner.run(engine);

//   // This is the floor.  Any bodies with the isStatic property means something unmoving, like a solid wall
//   bodies.push(new _Body(Bodies.rectangle(width/2, height - 15, width, 30, {isStatic: true})));
// }


// function draw(){
//   background(200);

//   if(frameCount % 10 === 0){ // Every ten frames, add a new body.
//     bodies.push(new _Body(Bodies.rectangle(random(0, width), 50, random(10, 50), random(10, 50))))
//   }

//   bodies.forEach(body => body.draw()); // Draw every body
// }