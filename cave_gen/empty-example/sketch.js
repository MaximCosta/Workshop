const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const ran = (max, val) => [...Array(max).keys()].map(() => (Array.isArray(val) ? rnd(...val) : val));
const pos = (x, y) => [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
const poss = (x, y) => [[x - 1, y - 1], [x + 1, y + 1], [x + 1, y - 1], [x - 1, y + 1]];
const sleep = (s) => new Promise((resolve) => { setTimeout(resolve, s); })

let cave = [];

const show_print = true;
const make_cave = true;
const cave_size = { x: 100, y: 250 };
const canvas_size = { x: 1900, y: 950 };

function download_cave(filename) {
    let text = ""

    for (let idy = 1; idy < cave.length - 1; idy++) {
        for (let idx = 1; idx < cave[idy].length; idx++) {
            text += `${cave[idy][idx]}`
        }
        text += "\n"
    }

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

async function setup() {
    createCanvas(canvas_size.x, canvas_size.y);
    background(0);

    // generate a perfect lab
    generate_board(); // size of board
    await prims_alog(); // where start the lab x, y
    await draw_cave();  // show log, time beetween to print

    // make caves
    if (make_cave) {
        await remove_corner() // param time beetween to print
        await generate_cave() // param time beetween to print
        await remove_corner() // param time beetween to print
    }

    // save to filename
    download_cave('cave.txt', cave.map((v) => v.map((x) => (x <= 10 ? "#" : " ")).join("")).join("\n"))
}

async function generate_cave(t = rnd(3, 6)) {
    let ncave = cave.map(arr => arr.slice());

    for (let i = 0; i < t; i++) {
        for (let idy = 1; idy < cave.length - 1; idy++) {
            for (let idx = 1; idx < cave[idy].length; idx++) {
                if (cave[idy][idx] == 10) {
                    let g1 = get_touch(idx, idy);
                    let g2 = get_touchs(idx, idy);
                    if (g1 + g2 >= 4 && g1 >= 1) {
                        ncave[idy][idx] = 11;
                    }
                }
            }
        }
        cave = ncave.map(arr => arr.slice());
        await draw_cave();
    }
}

async function remove_corner(t = rnd(3, 6)) {
    for (let i = 0; i < t; i++) {
        for (let idy = 1; idy < cave.length; idy++) {
            for (let idx = 1; idx < cave[idy].length; idx++) {
                if (cave[idy][idx] == 11) {
                    if (get_touch(idx, idy) <= 1) {
                        cave[idy][idx] = 10
                    }
                }
            }
        }
        await draw_cave();
    }
}

function draw() {
    // put drawing code here
}

function generate_board(x = cave_size.x, y = cave_size.y) {
    cave.push(ran(x + 2, 10));
    for (let i = 0; i < y; i++) {
        cave.push([10, ...ran(x, [0, 9]), 10]);
    }
    cave.push(ran(x + 2, 10));
}

function get_touch(x, y) {
    let counter = 0;

    pos(x, y).forEach(([tx, ty]) => { if (cave[ty][tx] == 11) counter++; });
    return counter;
}

function get_touchs(x, y) {
    let counter = 0;

    poss(x, y).forEach(([tx, ty]) => { if (cave[ty][tx] == 11) counter++; });
    return counter;
}

function clear_cave() {
    // set to wall other nodes not set
    cave.forEach((cavy, idy) => {
        cavy.forEach((x, idx) => {
            if (cave[idy][idx] < 10) {
                cave[idy][idx] = 10
            }
        })
    })
    draw_cave();
}

async function prims_alog(nx = 1, ny = 1) {
    // 10 wall, 11 path
    let nodes = [[nx, ny]];
    let clock = 0

    while (nodes.length > 0) {
        let select = [];

        // select one
        for (const [x, y] of nodes) {
            select.push(cave[y][x]);
        }

        // set it to path and remove it from the array
        const idx = select.indexOf(Math.max(...select));
        const [x, y] = nodes[idx];
        nodes.splice(idx, 1);
        cave[y][x] = 11;

        // get the new path and set wall
        pos(x, y).forEach(([tx, ty]) => {
            if (cave[ty][tx] < 10) {
                if (get_touch(tx, ty) == 1) nodes.push([tx, ty]);
                else cave[ty][tx] = 10;
            }
        });

        // remove wall from nodes
        nodes = nodes.filter(([x, y]) => cave[y][x] < 10)
        if (clock % 5000 == 0) {
            await draw_cave();
        }
        clock++
    }

    clear_cave()
}

async function draw_cave(log = false, time = 1) {
    await sleep(time)
    if (log) { console.log(cave.map((v) => v.map((x) => (x <= 10 ? "#" : " ")).join(" ")).join("\n")); }
    if (!show_print) return;
    size = { x: (width / cave.length), y: (height / cave[0].length), };
    cave.forEach((cavy, idy) => {
        cavy.forEach((x, idx) => {
            if (x == 11) {
                fill(255);
                rect(idy * size.x, idx * size.y, size.x, size.y);
            }
            if (x == 10) {
                fill(55);
                rect(idy * size.x, idx * size.y, size.x, size.y);
            }
        });
    });
}
