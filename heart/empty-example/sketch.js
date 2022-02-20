let phase = 0;
let zoff = 0;
let slider;

function setup() {
    createCanvas(windowWidth, windowHeight);
    slider = createSlider(0, 1, 0, 0.01);
}

function draw() {
    background(0);
    translate(width / 2, height / 2);
    stroke(255);
    strokeWeight(2);
    noFill();
    beginShape();
    let noiseMax = slider.value();
    for (let a = 0; a < TWO_PI; a += radians(5)) {
        let xoff = map(cos(a + phase), -1, 1, 0, noiseMax);
        let yoff = map(sin(a + phase), -1, 1, 0, noiseMax);
        let r = map(noise(xoff, yoff, zoff), 0, 1, 100, height / 2);
        let x = 16 * pow(sin(r), 3) * 40;
        let y = -(13 * cos(r) - 5 * cos(2 * r) - 2 * cos(3 * r) - cos(4 * r)) * 40;
        vertex(x, y);
    }
    endShape(CLOSE);
    phase += 0.003;
    zoff += 0.01;
}