
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const ran = (max, val) => [...Array(max).keys()].map(() => (Array.isArray(val) ? rnd(...val) : val));
const rng = (nb) => [...Array(nb).keys()];
const distp = (p1, p2) => p2.map(({ x, y }) => dist(x, y, p1.x, p1.y))
const sleep = (s) => new Promise((resolve) => { setTimeout(resolve, s); })
const sum = (arr) => arr.reduce((a, b) => a + b, 0);

const canvas_size = { x: 800, y: 800 };
const size_node = 20;
const nb_nodes = 25;
let nodes = [];

let selected = -1;

let ant_paths = []
let ant_sizes = []

let nb_ant = 1;

// show or not
let searching = false;
let show_dist = false; // NUMPAD 1
let show_most = true; // NUMPAD 2
let show_paths = true; // NUMPAD 3


// some variables you can change
const dstPower = 4;
const phPower = 1;
const initPh = 1;
const phIntensity = 1000;
const eachStep = .3;
const nbAnt = 20;

// path ph
let ants = [];
let path_ph = {}
let ants_paths = [];

// some stats
let path_dist_max = Infinity;
let path_max = [];

function setup() {
    console.log("*************************************************************************************************************************")
    for (let element of document.getElementsByClassName("p5Canvas")) {
        element.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    canvas_size.x = windowWidth
    canvas_size.y = windowHeight
    createCanvas(canvas_size.x, canvas_size.y);
    background(0);

    // generate random point
    nodes = ran(nb_nodes, 0).map(() => ({ x: rnd(0 + size_node, width - size_node), y: rnd(0 + size_node, height - size_node) }))
    ant_paths.push(rng(nb_nodes));
    ant_sizes.push(0);
    for (let i = 0; i < nodes.length; i++) {
        p1 = nodes[i]
        p2 = nodes[(i + 1) % nodes.length];
        ant_sizes[0] += dist(p1.x, p1.y, p2.x, p2.y)
    }
}

function get_ph_trail(p1, p2) {
    if (!path_ph.hasOwnProperty([p1, p2])) path_ph[[p1, p2]] = initPh;
    return path_ph[[p1, p2]];
}

function ant_next(ant_path, pos) {
    const ant = nodes[pos];
    let distps = distp(ant, nodes)

    distps = distps.map((v, idx) => ant_path.includes(idx) ? 0 : Math.pow(1 / v, dstPower) * Math.pow(get_ph_trail(pos, idx), phPower));
    distps = distps.map(dis => dis / sum(distps))
    let r = Math.random()
    for (let i = 0; i < distps.length; i++) {
        if (r <= distps[i] && distps[i] != 0) return i;
        r -= distps[i]
    }
    return distps[rnd(0, distps.length - 1)];
}

async function ant_algo_2() {
    ants = ran(nbAnt, [0, nodes.length - 1]);
    ants_paths = ants.map((val, idx) => [val]);
    searching = true;
    for (let i = 0; i < nodes.length; i++) {
        // select the next pose of ant
        for (let a = 0; a < ants.length; a++) {
            ant = nodes[ants[a]];
            next = ant_next(ants_paths[a], ants[a])
            ants_paths[a].push(next)
            ants[a] = next
        }
        // step finish evaporate some ph
        Object.keys(path_ph).map((v) => path_ph[v] -= Math.max(path_ph[v] - eachStep, 0))

    }
    // await 1s

    // set path ph to tail
    for (let i = 0; i < ants_paths.length; i++) {
        path_dist = 0;
        for (let j = 0; j < nodes.length; j++) {
            let p1 = ants_paths[i][j];
            let p2 = ants_paths[i][(j + 1) % nodes.length]
            path_dist += dist(nodes[p1].x, nodes[p1].y, nodes[p2].x, nodes[p2].y);
        }
        if (path_dist < path_dist_max) {path_dist_max = path_dist; path_max = [...ants_paths[i]]}
        path_dist = phIntensity / path_dist / nodes.length;
        for (let j = 0; j < ants_paths[i].length; j++) {
            let p1 = ants_paths[i][j];
            let p2 = ants_paths[i][(j + 1) % ants_paths[i].length]
            path_ph[[p1, p2]] += path_dist * phIntensity;
        }
    }

    await sleep(1)
    searching = false;
}

async function lunch_ant() {
    console.log("lunch")
    for (let i = 0; i < 10000; i++) {
        await ant_algo_2()
    }
    console.log("finish")
}

function draw() {
    background(0);
    fill(255);
    noStroke();

    // write all path with alpha
    if (show_paths) {
        for (const [p, ph] of Object.entries(path_ph)) {
            const [p1, p2] = p.split(',');
            if (p2 == 'NaN' || p1 == 'NaN') continue;
            stroke(235, 52, 222, ph);
            strokeWeight(3);
            line(nodes[parseInt(p1)].x, nodes[parseInt(p1)].y, nodes[parseInt(p2)].x, nodes[parseInt(p2)].y);
        }
    }
    noStroke();

    //write best path in green
    if (show_paths && path_max.length) {
        for (let i = 0; i < nodes.length; i++) {
            let p1 = nodes[path_max[i]];
            let p2 = nodes[path_max[(i + 1) % nodes.length]];
            console.log(path_max)
            if (p2 == 'NaN' || p1 == 'NaN') continue;
            stroke(88, 168, 50);
            strokeWeight(2);
            line(p1.x, p1.y, p2.x, p2.y);
        }
    }
    noStroke();

    // write nodes to canvas
    for (let i = 0; i < nodes.length; i++) {
        let { x, y } = nodes[i];

        fill(255, 0, 0)
        if (selected == i) {
            fill(255, 255, 0);
            nodes[i].x = mouseX;
            nodes[i].y = mouseY;
        }

        if (ants.includes(i) && searching) fill(75, 224, 29);
        ellipse(x, y, size_node)
    }

    // draw mouse cursor
    fill(255, 0, 0)
    circle(mouseX, mouseY, 5)
}

function mouseReleased() {
    selected = -1;
};

function mousePressed(event) {

    if (event.button == 0) {
        for (let i = 0; i < nodes.length; i++) {
            let { x, y } = nodes[i];
            if (dist(x, y, mouseX, mouseY) < size_node / 2) {
                selected = i;
            }
        }
    }
}

function keyPressed() {
    if (keyCode == 97) show_dist = !show_dist;
    if (keyCode == 98) show_most = !show_most;
    if (keyCode == 99) show_paths = !show_paths;
    if (keyCode == 71) lunch_ant();
    return false;
}