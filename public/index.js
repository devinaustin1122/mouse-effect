// wrap everything in a function that accepts configs?

let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");
let particles = [];
let cursor = pair(0, 0);
let length = 20;

// initialize canvas
function init(configs) {
  // cant click buttons
  if (configs.wrapper) {
    let bounds = document
      .getElementById(configs.wrapper)
      .getBoundingClientRect();
    canvas.style.position = "absolute";
    canvas.style.top = `${bounds.top}px`;
    canvas.style.left = `${bounds.left}px`;
    canvas.width = bounds.width;
    canvas.height = bounds.height;
  } else {
    canvas.style.position = "fixed";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  document.body.appendChild(canvas);

  document.addEventListener("mousemove", (e) => {
    cursor = pair(e.clientX, e.clientY);
    console.log("hi");
  });
}

// initialization function for follow effects
function follow(configs) {
  init(configs);
  particles.unshift(particle(configs.image, cursor));
  document.addEventListener("mousemove", (e) => {
    cursor = pair(e.clientX, e.clientY);
  });
  animationLoop(configs.effect);
}

// initialization function for follow effects
function spawn(configs) {
  init(configs);
  document.addEventListener("mousemove", (e) => {
    if (
      particles.length == 0 ||
      magnitude(
        pair(particles[0].x, particles[0].y),
        pair(e.clientX, e.clientY)
      ) > 40
    )
      particles.unshift(particle(configs.image, pair(e.clientX, e.clientY)));
  });
  animationLoop(configs.effect);
}

// animation loop
function animationLoop(effect) {
  translate(1);
  draw();
  requestAnimationFrame(() => animationLoop(effect));
}

function translate(distance) {
  particles.forEach((particle) => {
    particle.y -= distance;
  });
}

// elastic effect
function elastic(configs) {
  return () => {
    particles.forEach((particle) => {
      let spring = subtract(cursor, particle);
      particle.velocity.x =
        particle.velocity.x * 0.9 + (spring.x / length) * 0.2;
      particle.velocity.y =
        particle.velocity.y * 0.9 + (spring.y / length) * 0.2;
      particle.x = particle.x + particle.velocity.x;
      particle.y = particle.y + particle.velocity.y;
    });
  };
}

// trail effect
function trail(configs) {
  return () => {
    particles.forEach((particle) => {
      let velocity = subtract(cursor, particle);
      velocity.x = velocity.x * 0.2;
      velocity.y = velocity.y * 0.2;
      particle.x = particle.x + velocity.x;
      particle.y = particle.y + velocity.y;
    });
  };
}

// float effect
function float(configs) {
  return () => {
    particles.forEach((particle) => {
      particle.y -= 1;
      particle.count++;
      if (particle.count > 100) {
        particles.splice(particles.indexOf(particle));
      }
    });
  };
}

// subtracts two pairs
function subtract(first, second) {
  return pair(first.x - second.x, first.y - second.y);
}

// returns the magnitude of a vector described by two points
function magnitude(start, end) {
  let diff = subtract(end, start);
  return Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2));
}

// draw function
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((particle) => {
    ctx.drawImage(
      particle.image,
      particle.x - parseInt(canvas.style.left, 10),
      particle.y - parseInt(canvas.style.top, 10),
      particle.image.width * particle.scale,
      particle.image.height * particle.scale
    );
  });
}

// prerenders the image. improves performance.
function render(src) {
  let canvasOS = document.createElement("canvas");
  canvasOS.width = 100;
  canvasOS.height = 100;
  let ctxOS = canvasOS.getContext("2d");
  const image = new Image();
  image.src = src;
  image.onload = () => ctxOS.drawImage(image, 0, 0);
  return canvasOS;
}

// factory function for a pair
function pair(x, y) {
  return {
    x,
    y,
  };
}

// factory function for particles
function particle(src, coordinates) {
  return {
    image: render(src),
    opacity: 1,
    velocity: pair(0, 0),
    scale: 1,
    count: 0,
    ...coordinates,
  };
}