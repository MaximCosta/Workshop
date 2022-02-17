const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const ran = (max, val) =>[...Array(max).keys()].map(() => (Array.isArray(val) ? rnd(...val) : val));
const pos = (x, y) => [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
const poss = (x, y) => [[x - 1, y - 1], [x + 1, y + 1], [x + 1, y - 1], [x - 1, y + 1]];
const sleep = (s) => new Promise((resolve) => {setTimeout(resolve, s);})

let cave = [];

async function setup() {
    createCanvas(1900, 950);
    background(0);

    // generate a perfect lab
    generate_board();
    await prims_alog();
    await draw_cave();

    // make caves
    await remove_corner()
    await generate_cave()
    await remove_corner()
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

function generate_board(x = 100, y = 250) {
    cave.push(ran(x + 2, 10));
    for (let i = 0; i < y; i++) {
        cave.push([10, ...ran(x, [0, 9]), 10]);
    }
    cave.push(ran(x + 2, 10));
}

function get_touch(x, y) {
    let counter = 0;

    pos(x, y).forEach(([tx, ty]) => {if (cave[ty][tx] == 11) counter++;});
    return counter;
}

function get_touchs(x, y) {
    let counter = 0;

    poss(x, y).forEach(([tx, ty]) => {if (cave[ty][tx] == 11) counter++;});
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
    if (log) {
        console.log(
            cave
                .map((v) => v.map((x) => (x <= 10 ? "#" : " ")).join(" "))
                .join("\n")
        );
    }
    size = {
        x: (width / cave.length),
        y: (height / cave[0].length),
    };
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
