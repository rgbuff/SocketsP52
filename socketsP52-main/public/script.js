//get container for our canvas
const sketchContainer = document.getElementById('sketch-container');

//get socket which only uses websockets as a means of communication
const socket = io({
  transports: ['websocket'],
});

//the p5js sketch
// note: this is using the p5 instance mode
// https://p5js.org/reference/#/p5/p5
// to separate the p5 code from regular javascript
// ... plus, it's cool!

const sketch = (p) => {
  let positions = {};
  //the p5js setup function
  p.setup = () => {
    //to fill up the full container, get the width an height
    const containerPos = sketchContainer.getBoundingClientRect();
    const cnv = p.createCanvas(containerPos.width, containerPos.height); //the canvas!
    p.textAlign(p.CENTER, p.CENTER);
    p.frameRate(30); //set framerate to 30, same as server
    socket.on('positions', (data) => {
      //get the data from the server to continually update the positions
      positions = data;
      console.log(positions);
    });
  };
  let gx = 1,
    gy = 1;
  //the p5js draw function, runs every frame rate
  //(30-60 times / sec)
  p.draw = () => {
    p.background(0); //reset background to black

    for (let i = 1; i < 9; i++) {
      for (let j = 1; j < 9; j++) {
        let xloc = (p.width / 9) * i;
        let yloc = (p.height / 9) * j;
        p.noFill();
        p.stroke(255);
        p.ellipse(xloc, yloc, 35);
      }
    }

    for (const id in positions) {
      const position = positions[id];
      p.fill(255); //sets the fill color of the circle to white
      // draw white dots wherever other players' positions are
      p.ellipse(position.x * (p.width / 9), position.y * (p.height / 9), 20);
      // try to print an id number on each dot - i'm not sure this works
      p.fill(0); //sets the fill color of the text to black
      p.text(
        position.n,
        position.x * (p.width / 9),
        position.y * (p.height / 9)
      );
    }

    let xloc = (p.width / 9) * gx;
    let yloc = (p.height / 9) * gy;
    // the marker the user of the client will see is always red
    p.fill('red');
    p.ellipse(xloc, yloc, 30);
  };
  // user changes positions on grid with arrow keys
  p.keyPressed = () => {
    switch (p.key) {
      case 'ArrowUp':
        gy -= 1;
        break;
      case 'ArrowDown':
        gy += 1;
        break;
      case 'ArrowLeft':
        gx -= 1;
        break;
      case 'ArrowRight':
        gx += 1;
    }
    // boundaries for our little ball on the grid
    if (gy < 1) gy = 1;
    if (gy > 8) gy = 8;
    if (gx < 1) gx = 1;
    if (gx > 8) gx = 8;
    // send this client's updated position back to the server
    socket.emit('updatePosition', {
      x: gx,
      y: gy,
    });
  };
};

//initialize the sketch!
new p5(sketch, sketchContainer);
