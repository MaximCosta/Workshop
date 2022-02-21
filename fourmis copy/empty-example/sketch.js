
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const ran = (max, val) => [...Array(max).keys()].map(() => (Array.isArray(val) ? rnd(...val) : val));
const rng = (nb) => [...Array(nb).keys()];
const distp = (p1, p2) => p2.map(({ x, y }) => dist(x, y, p1.x, p1.y))
const sleep = (s) => new Promise((resolve) => { setTimeout(resolve, s); })
const sum = (arr) => arr.reduce((a, b) => a + b, 0);


// graphical info
const canvas_size = { x: 800, y: 800 };
const size_node = 20;


// show or not
let searching = false;
let show_most = true; // NUMPAD 2   show green best path
let show_paths = true; // NUMPAD 3 show all path from ant
let show_dist = false;      // NUMPAD 4 show all dist point
let show_ph_dist = false;   // NUMPAD 5 show all path depende en ph
let show_all_dist = false;   // NUMPAD 6 show all path depende en ph and dist
let ant_go = false; // g key

// nodes info
let nodes = [];
let selected = -1;
let user_ant = -1;

// some variables you can change
let nb_nodes = 35;

let dstPower = 4;  // slider
let phPower = 1;   // slider
let nbAnt = 25;  // slider

const initPh = 1;
const phIntensity = 1500;
const eachStep = .3;

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

    canvas_size.x = windowWidth - 20
    canvas_size.y = windowHeight - 25
    createCanvas(canvas_size.x, canvas_size.y);
    background(0);

    // generate random point
    radius = width / 10

    nodes = [];
    for (let i = 0; i < nb_nodes; i++) {
        var angle = Math.random() * Math.PI * 2;
        x = Math.cos(angle) * radius + (width / 2);
        y = Math.sin(angle) * radius + (height / 2);
        nodes.push({ x: x, y: y })
    }
    // nodes.pus({x : width / 2, y : height / 2})

    //nodes = ran(nb_nodes, 0).map(() => ({ x: rnd(0 + size_node, width - size_node), y: rnd(0 + size_node, height - size_node) }))

    // slider
    textSize(15);
    noStroke();

    // create sliders
    nbAnt = createSlider(0, 100, 25);
    nbAnt.position(20, 40);
    dstPower = createSlider(0, 10, 4);
    dstPower.position(20, 70);
    phPower = createSlider(0, 10, 1);
    phPower.position(20, 100);

    show_node = select("#box0").elt;
    show_most = select("#box1").elt;
    show_paths = select("#box2").elt;
    show_dist = select("#box3").elt;
    show_ph_dist = select("#box4").elt;
    show_all_dist = select("#box5").elt;
}

function get_ph_trail(p1, p2) {
    if (!path_ph.hasOwnProperty([p1, p2])) path_ph[[p1, p2]] = initPh;
    return path_ph[[p1, p2]];
}

function ant_next(ant_path, pos) {
    const ant = nodes[pos];
    let distps = distp(ant, nodes)

    distps = distps.map((v, idx) => ant_path.includes(idx) ? 0 : Math.pow(1 / v, dstPower.value()) * Math.pow(get_ph_trail(pos, idx), phPower.value()));
    distps = distps.map(dis => dis / sum(distps))
    let r = Math.random()
    for (let i = 0; i < distps.length; i++) {
        if (r <= distps[i] && distps[i] != 0) return i;
        r -= distps[i]
    }
    return distps[rnd(0, distps.length - 1)];
}

async function ant_algo_2() {
    ants = ran(nbAnt.value(), [0, nodes.length - 1]);
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
        if (path_dist < path_dist_max) { path_dist_max = path_dist; path_max = [...ants_paths[i]] }
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
    if (ant_go && !searching) await ant_algo_2()
}

function draw() {
    background(0);
    fill(255);
    noStroke();
    lunch_ant()

    // slider
    text(`nb Ant    : ${nbAnt.value()}`, nbAnt.x * 2 + nbAnt.width, 35);
    text(`ph Power  : ${dstPower.value()}`, dstPower.x * 2 + dstPower.width, 65);
    text(`dst Power : ${phPower.value()}`, phPower.x * 2 + phPower.width, 95);

    // write all path with alpha
    if (show_paths.checked) {
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
    if (show_most.checked && path_max.length) {
        for (let i = 0; i < nodes.length; i++) {
            let p1 = nodes[path_max[i]];
            let p2 = nodes[path_max[(i + 1) % nodes.length]];
            if (p2 == 'NaN' || p1 == 'NaN') continue;
            stroke(88, 168, 50);
            strokeWeight(2);
            line(p1.x, p1.y, p2.x, p2.y);
        }
    }
    noStroke();

    // write dist to user ant by dist
    if (show_dist.checked && user_ant != -1) {
        let p1 = nodes[user_ant];
        let dist_all = nodes.map((p2, idx) => user_ant != idx ? Math.pow(1 / dist(p1.x, p1.y, p2.x, p2.y), dstPower.value()) : Infinity);
        for (let i = 0; i < nodes.length; i++) {
            if (i == user_ant) continue;
            let p2 = nodes[i];
            stroke(255, 255, 255, dist_all[i] / Math.min(...dist_all));
            strokeWeight(2);
            line(p1.x, p1.y, p2.x, p2.y);
        }
    }
    noStroke();

    // write dist to user ant by ph
    if (show_ph_dist.checked && user_ant != -1) {
        let p1 = nodes[user_ant];
        for (let i = 0; i < nodes.length; i++) {
            if (i == user_ant) continue;
            let p2 = nodes[i];
            stroke(255, 255, 255, Math.pow(get_ph_trail(user_ant, i), phPower.value()));
            strokeWeight(2);
            line(p1.x, p1.y, p2.x, p2.y);
        }
    }
    noStroke();

    // write dist to user ant by all
    if (show_all_dist.checked && user_ant != -1) {
        let p1 = nodes[user_ant];
        let dist_all = nodes.map((p2, idx) => user_ant != idx ? Math.pow(1 / dist(p1.x, p1.y, p2.x, p2.y), dstPower.value()) : Infinity);
        for (let i = 0; i < nodes.length; i++) {
            if (i == user_ant) continue;
            let p2 = nodes[i];
            stroke(255, 255, 255, (dist_all[i] / Math.min(...dist_all)) * Math.pow(get_ph_trail(user_ant, i), phPower.value()));
            strokeWeight(2);
            line(p1.x, p1.y, p2.x, p2.y);
        }
    }
    noStroke();

    // write nodes to canvas
    if (show_node.checked) {
        for (let i = 0; i < nodes.length; i++) {
        let { x, y } = nodes[i];

        fill(255, 0, 0)
        if (selected == i) {
            fill(255, 255, 0);
            nodes[i].x = mouseX;
            nodes[i].y = mouseY;
        }

        if (ants.includes(i) && searching) fill(75, 224, 29);
        if (user_ant == i) fill(11, 103, 217)
        ellipse(x, y, size_node)
    }}

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
    if (event.button == 2) {
        user_ant = -1;
        for (let i = 0; i < nodes.length; i++) {
            let { x, y } = nodes[i];
            if (dist(x, y, mouseX, mouseY) < size_node / 2) {
                user_ant = i;
            }
        }
    }
}

function keyPressed() {
    if (keyCode == 97) show_node.checked = !show_node.checked;
    if (keyCode == 98) show_most.checked = !show_most.checked;
    if (keyCode == 99) show_paths.checked = !show_paths.checked;

    if (keyCode == 100) show_dist.checked = !show_dist.checked;
    if (keyCode == 101) show_ph_dist.checked = !show_ph_dist.checked;
    if (keyCode == 102) show_all_dist.checked = !show_all_dist.checked;

    if (keyCode == 71) ant_go = !ant_go;
    return false;
}