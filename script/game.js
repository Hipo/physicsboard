let invertCoordinates = false;
let [globalWidth, globalHeight] = [640, 480]
if (invertCoordinates) {
    [globalWidth, globalHeight] = [globalHeight, globalWidth];
}
let isFinished = false;



/* ====================== Color Tracker ====================== */
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
/* ====================== Color Tracker end ====================== */


let Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Events = Matter.Events,
  Vertices = Matter.Vertices,
  Composites = Matter.Composites,
  Common = Matter.Common;

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




/* ============= Ground =================== */

// Bodies references
let bricks = [];
let ground = Bodies.rectangle(0, globalHeight + 100, globalWidth * 2, 100, { isStatic: true, label: 'Ground' });

World.add(engine.world, ground);
/* ============ Ground end ================ */



/* ======================  Target Bucket ====================== */
const PI = 3.14;
const targetBucket = [];

let target = Bodies.rectangle(
  64,
  globalHeight - 20,
  35,
  5,
  {
    isStatic: true,
    label: 'target',
    render: {
      fillStyle: 'white'
    }
  }
);
targetBucket.push(target);

let targetLeftHand = Bodies.rectangle(
  38,
  globalHeight - 45,
  57,
  5,
  {
    isStatic: true,
    chamfer: { radius: 2 },
    render: {
      fillStyle: 'white'
    }
  }
);
Matter.Body.rotate(targetLeftHand, PI / 2.6);
targetBucket.push(targetLeftHand);

let targetRightHand = Bodies.rectangle(
  89,
  globalHeight - 45,
  57,
  5,
  {
    isStatic: true,
    chamfer: { radius: 2 },
    render: {
      fillStyle: 'white'
    }
  }
);
Matter.Body.rotate(targetRightHand, (-1) * PI / 2.6);
targetBucket.push(targetRightHand);

World.add(engine.world, targetBucket);
/* ====================== Target Bucket end ====================== */



/* ================ Obstacles ===================== */
const obstacles = [];

const curve1 = Bodies.rectangle(80, 150, 200, 5, {
  isStatic: true,
  render: {
    fillStyle: 'white'
  }
});
Matter.Body.rotate(curve1, PI / 9);
obstacles.push(curve1);

const curve2 = Bodies.rectangle(360, 300, 250, 5, {
  isStatic: true,
  render: {
    fillStyle: 'white'
  }
});
Matter.Body.rotate(curve2, -PI / 9);
obstacles.push(curve2);

World.add(engine.world, obstacles);

/* ====================== Obstacles end ====================== */



Engine.run(engine);
Render.run(render);



/* ====================== Ball ====================== */
createBall();
/* ====================== Ball end ====================== */


/* ====================== Events ====================== */

Events.on(engine, 'collisionEnd', function(event) {
  var pairs = event.pairs;

  for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i];

      if (pair.bodyA.label === 'target' || pair.bodyB.label === 'target') {
        finishGame('success');
      }
  }
});


Events.on(engine, 'collisionStart', (event) => {
  for (let pair of event.pairs) {
      const {bodyA, bodyB} = pair;
      let isRemoved = false;

      if (bodyA.label == 'Circle Body' && bodyB.label == 'Ground') {
          World.remove(engine.world, bodyA);
          isRemoved = true;
      }
      if (bodyB.label == 'Circle Body' && bodyA.label == 'Ground') {
         World.remove(engine.world, bodyB);
         isRemoved = true;
      }

      if (isRemoved) {
        createBall();
      }
  }
});

/* ====================== Events end ====================== */



/* ===================== Helpers ======================== */
function finishGame(type) {
  if (!isFinished) {
    var template,
      className = 'game-end-message ';

    if (type === 'fail') {
      template = `
        <img src="./../images/fail-icon.svg" alt="">
        <button type="button" class="retry-button">retry</button>
      `;

      className += 'fail-wrapper';
    } else {
      template = `
        <img src="./../images/success-icon.svg" alt="">
        <p class="success-message">Hooray!</p>
      `;

      className += 'success-wrapper';
    }

    const videoWrapperElem = document.querySelector('.video-wrapper');
    videoWrapperElem.parentElement.removeChild(videoWrapperElem);

    var gameEndMessageElem = document.createElement('div');
    gameEndMessageElem.className = className;
    gameEndMessageElem.style.width = globalWidth + 'px';
    gameEndMessageElem.style.height = globalHeight + 'px';
    gameEndMessageElem.innerHTML = template;
    document.body.appendChild(gameEndMessageElem);
    isFinished = true;

    if (type === 'fail') {
      document.querySelector('.retry-button').addEventListener('click', handleRetryEvent);
    } else {
      let newLevel = +window.location.pathname.match(/[1-9]+/)[0] + 1;

      if (newLevel < 2) {
        // next level
        setTimeout(function() {
          window.location.href = '/levels/' + newlevel;        
        }, 1000);        
      } else {
        window.location.href = '/';
      }
    }
  }
}

function handleRetryEvent(event) {
  event.preventDefault();
  event.stopPropagation();

  window.location.href = window.location.pathname;
}

function drawBrick (rect) {
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
}

function getDistance (pos1, pos2) {
  return Math.sqrt(Math.pow((pos1.x - pos2.x), 2) + Math.pow((pos1.y - pos2.y), 2));
}

function eraseBrick(rect) {
  const threshold = 50;
  for (let brick of bricks) {
      let distance = getDistance(rect, brick.position)
      if (distance <= threshold) {
          World.remove(engine.world, brick);
      }
  }
}

function createBall() {
  let randX = Math.floor(Math.random() * globalWidth);
  let ball = Bodies.circle(
    randX,
    0,
    10,
    {
      render: { fillStyle: 'white' },
      restitution: 1
    }
  );

  World.add(engine.world, [ball]);
}

/* =================== Helpers end ==================== */
