// General setup

let invertCoordinates = false;
let [globalWidth, globalHeight] = [640, 480]
if (invertCoordinates) {
    [globalWidth, globalHeight] = [globalHeight, globalWidth];
}

// Tracking setup

let colors = new tracking.ColorTracker(['magenta', 'cyan']);

colors.on('track', function (event) {
    if (event.data.length === 0) {
        // No colors were detected in this frame.
    } else {
        event.data.forEach(function (rect) {
            if (rect.color === 'magenta') {
                drawBrick(rect);
            }
            if (rect.color === 'cyan') {
                eraseBrick(rect);
            }
        });
    }
});

tracking.track('#myVideo', colors, { camera: true });

// Matter setup

let Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Events = Matter.Events;
    
// Bodies references
let bricks = [];
let ground = Bodies.rectangle(0, globalHeight, globalWidth * 2, 100, { isStatic: true, label: 'Ground' });

// Prepare world
let engine = Engine.create();
let render = Render.create({
    element: document.querySelector('#world'),
    engine: engine,
    options: {
        width: globalWidth,
        height: globalHeight,
        wireframes: false,
        background: "black"
    }
});

World.add(engine.world, [ground]);
Engine.run(engine);
Render.run(render);

// Shit that runs this thing
setInterval(() => {
    let randX = Math.floor(Math.random() * globalWidth);
    let ball = Bodies.circle(randX, 0, 10, { render: { fillStyle: 'white' }, restitution: 0.5 });
    World.add(engine.world, [ball]);
    Events.on(engine, 'collisionStart', (event) => {
        for (let pair of event.pairs) {
            const {bodyA, bodyB} = pair;
            if (bodyA.label == 'Circle Body' && bodyB.label == 'Ground') {
                World.remove(engine.world, bodyA);
            }
            if (bodyB.label == 'Circle Body' && bodyA.label == 'Ground') {
                World.remove(engine.world, bodyB);
            }
        }
        
    });
}, 1000);

let drawBrick = (rect) => {
    // let [newY, newX] = [(rect.x + rect.width / 2) + 170, globalHeight - (rect.y + rect.height / 2) - 50]
    let [newX, newY] = [(rect.x + rect.width / 2), (rect.y + rect.height / 2)]
    let options = {
        render: {
            fillStyle: 'white'
        },
        isStatic: true
    };
    let brick = Bodies.rectangle(newX, newY, 10, 5, options);
    bricks.push(brick);
    World.add(engine.world, [brick]);
};

let getDistance = (pos1, pos2) => {
    return Math.sqrt(Math.pow((pos1.x - pos2.x), 2) + Math.pow((pos1.y - pos2.y), 2));
};

let eraseBrick = (rect) => {
    const threshold = 50;
    for (let brick of bricks) {
        let distance = getDistance(rect, brick.position)
        if (distance <= threshold) {
            World.remove(engine.world, brick);
        }
    }
};
