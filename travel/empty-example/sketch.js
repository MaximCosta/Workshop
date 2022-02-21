const positions = new Array(17).fill(0)

const perm = {
	step_count: 0,
	step_total: null,
	path: null,
	dist: Infinity,
	best: {
		path: null,
		dist: Infinity,
	},
	step() {
		if (this.path === null) {
			this.path = Object.keys(positions).slice()
			this.dist = pathCalculateDistance(this.path)
			this.step_count += 1
		} else if (pathPermute(this.path) === true) {
			this.dist = pathCalculateDistance(this.path)
			this.step_count += 1
		}
		if (this.step_total === null) {
			this.step_total = factorial(this.path.length)
		}

		if (this.best.dist > this.dist) {
			this.best.path = this.path.slice()
			this.best.dist = this.dist
		}
	},
	percent() {
		if (this.step_total === null) {
			return Infinity
		}
		return `${nf(100 - (this.step_count / this.step_total) * 100, 0, 2)}%`
	},
}

const rand = {
	step_count: 0,
	step_total: null,
	path: null,
	dist: Infinity,
	best: {
		path: null,
		dist: Infinity,
	},
	step() {
		if (this.path === null) {
			this.path = Object.keys(positions).slice()
			this.dist = pathCalculateDistance(this.path)
			this.step_count += 1
		} else if (pathShuffle(this.path) === true) {
			this.dist = pathCalculateDistance(this.path)
			this.step_count += 1
		}
		if (this.step_total === null) {
		}

		if (this.best.dist > this.dist) {
			this.best.path = this.path.slice()
			this.best.dist = this.dist
		}
	},
	percent() {
		if (this.step_total === null) {
			return Infinity
		}
		return `${nf(100 - (this.step_count / this.step_total) * 100, 0, 2)}%`
	},
}

const gena = {
	step_count: 0,
	step_total: null,
	path: null,
	dist: Infinity,
	best: {
		path: null,
		dist: Infinity,
	},
	step() {
		if (this.path === null) {
			this.path = Object.keys(positions).slice()
			this.dist = pathCalculateDistance(this.path)
			this.step_count += 1
		} else if (pathGenericSearch(this.path) === true) {
			this.dist = pathCalculateDistance(this.path)
			this.step_count += 1
		}
		if (this.step_total === null) {
		}

		if (this.best.dist > this.dist) {
			this.best.path = this.path.slice()
			this.best.dist = this.dist
		}
	},
	percent() {
		if (this.step_total === null) {
			return Infinity
		}
		return `${nf(100 - (this.step_count / this.step_total) * 100, 0, 2)}%`
	},
}

function setup() {
	createCanvas(1500, 800)

	const border = 50
	for (let i = 0; i < positions.length; i++) {
		const x = random(width / 3 - 2 * border) + border
		const y = random(height / 2 - 2 * border) + border
		positions[i] = createVector(x, y)
	}
}

const LOOPS = 1000

function draw() {
	background(0)

	let b_dist = Infinity
	let b_name = null

	if (true) {
		for (let i = 0; i < LOOPS; i++) perm.step()
		if (b_dist > perm.best.dist) {
			b_dist = perm.best.dist
			b_name = 'perm'
		}

		translate((0 * width) / 3, (0 * height) / 2)

		stroke(127, 127, 255)
		pathDraw(perm.path, perm.dist)

		translate((0 * width) / 3, (1 * height) / 2)

		stroke(255, 127, 127)
		pathDraw(perm.best.path, perm.best.dist)
		text(`Remaining: ${perm.percent()}`, 10, height / 2 - 10)
	}
	if (true) {
		for (let i = 0; i < LOOPS; i++) rand.step()
		if (b_dist > rand.best.dist) {
			b_dist = rand.best.dist
			b_name = 'rand'
		}

		translate((1 * width) / 3, ((0 - 1) * height) / 2)

		stroke(127, 127, 255)
		pathDraw(rand.path, rand.dist)

		translate((0 * width) / 3, (1 * height) / 2)

		stroke(255, 127, 127)
		pathDraw(rand.best.path, rand.best.dist)
		text(`Remaining: ${rand.percent()}`, 10, height / 2 - 10)
	}
	if (true) {
		for (let i = 0; i < 1; i++) gena.step()
		if (b_dist > gena.best.dist) {
			b_dist = gena.best.dist
			b_name = 'gena'
		}

		translate((1 * width) / 3, ((0 - 1) * height) / 2)

		stroke(127, 127, 255)
		pathDraw(gena.path, gena.dist)

		translate((0 * width) / 3, (1 * height) / 2)

		stroke(255, 127, 127)
		pathDraw(gena.best.path, gena.best.dist)
		text(`Remaining: ${gena.percent()}`, 10, height / 2 - 10)
	}

	// align center
	stroke(127, 255, 127)
	textAlign(CENTER)
	translate(((0 - 0.5) * width) / 3, (0 * height) / 2)
	text(b_name, 0, 0)
	translate(((0 + 0.5) * width) / 3, (0 * height) / 2)
	textAlign(LEFT)
}

function pathDraw(path, distance) {
	noFill()
	beginShape()
	for (let i = 0; i <= path.length; i++) {
		const index = path[i % path.length]
		const { x, y } = positions[index]
		if (i > 0) {
			strokeWeight(20)
			point(x, y)
		}
		strokeWeight(4)
		vertex(x, y)
	}
	endShape()

	fill(255)
	textSize(18)
	strokeWeight(2)
	text(`Distance: ${nf(distance, 0, 2)}`, 10, height / 2 - 30)
}

function pathCalculateDistance(path) {
	let distance = 0
	for (let i = 0; i < path.length; i++) {
		const curr_pos = positions[path[(i + 0) % path.length]]
		const next_pos = positions[path[(i + 1) % path.length]]
		distance += curr_pos.dist(next_pos)
	}
	return distance
}

function pathPermute(path) {
	// step 1 : find the largest x such that path[x] < path[x+1]
	let x = -1
	for (let i = path.length - 2; i > 0; i--) {
		if (path[i] < path[i + 1]) {
			x = i
			break
		}
	}
	if (x === -1) {
		return false
	}

	// step 2 : find the largest y such that path[x] < path[y]
	let y = -1
	for (let i = path.length - 1; i > x; i--) {
		if (path[x] < path[i]) {
			y = i
			break
		}
	}

	const swap = (i, j) => {
		const tmp = path[i]
		path[i] = path[j]
		path[j] = tmp
	}

	// step 3 : swap path[x] and path[y]
	swap(x, y)

	// step 4 : reverse the subarray path[x+1, ..., n]
	for (let i = x + 1, j = path.length - 1; i < j; i++, j--) {
		swap(i, j)
	}

	return true
}

function pathShuffle(path) {
	shuffle(path, true)
	return true
}

function factorial(n) {
	let result = 1
	for (let i = n - 1; i > 1; i--) {
		result *= i
	}
	return result
}

function swap(arr, i, j) {
	const tmp = arr[i]
	arr[i] = arr[j]
	arr[j] = tmp
}

function mutate(arr, rate) {
	for (let i = 0; i < arr.length; i++) {
		if (random(1) < rate) {
			var indexA = floor(random(arr.length))
			var indexB = floor(random(arr.length))
			indexB = (indexA + 1) % arr.length
			swap(arr, indexA, indexB)
		}
	}
}

function crossOver(orderA, orderB) {
	var start = floor(random(orderA.length))
	var end = floor(random(start + 1, orderA.length))
	var newOrder = orderA.slice(start, end)
	for (let i = 0; i < orderB.length; i++) {
		const city = orderB[i]
		if (!newOrder.includes(city)) {
			newOrder.push(city)
		}
	}
	return newOrder
}

const ga = {
	population: [],
	fitness: [],
	best: {
		path: null,
		dist: Infinity,
	},
	fitnessUpdateAt(p, i) {
		const dist = pathCalculateDistance(p)
		if (this.best.dist > dist) {
			this.best.dist = dist
			this.best.path = p.slice()
		}
		this.fitness[i] = 1 / sqrt(dist + 1)
	},
	fitnessUpdate(path) {
		this.best.path = null
		this.best.dist = Infinity

		if (this.population.length === 0) {
			for (let i = 0; i < LOOPS; i++) {
				const p = path.slice()
				pathShuffle(p)
				this.population.push(p)
				this.fitnessUpdateAt(p, i)
			}
		} else {
			this.population.forEach((p, i) => {
				this.fitnessUpdateAt(p, i)
			})
		}
	},
	fitnessNormalize() {
		const sum = this.fitness.reduce((a, b) => a + b, 0)
		this.fitness.forEach((n, i) => {
			this.fitness[i] /= sum
		})
	},
	pickOne() {
		var index = 0
		var r = random(1)
		while (r > 0) {
			r = r - this.fitness[index]
			index++
		}
		index--
		return this.population[index].slice()
	},
	nextGeneration() {
		const population = []
		for (let i = 0; i < this.population.length; i++) {
			const r = random(1)
			let order = null
			if (r < 0.2) {
				order = this.population[i].slice()
				pathShuffle(order)
			} else if (r < 0.4) {
				order = this.pickOne()
				mutate(order, 0.1)
			} else {
				const orderA = this.pickOne()
				const orderB = this.pickOne()
				order = crossOver(orderA, orderB)
			}
			population[i] = order
		}
		return population
	},
	update(population, path) {
		population.forEach((p, i) => {
			p.forEach((n, j) => {
				this.population[i][j] = n
			})
		})
		this.best.path.forEach((n, i) => {
			path[i] = n
		})
	},
}

function pathGenericSearch(path) {
	// step 1 : update fitness
	ga.fitnessUpdate(path)

	// step 2 : normalize fitness
	ga.fitnessNormalize()

	// step 3 : next generation
	const population = ga.nextGeneration()

	// step 4 : update population
	ga.update(population, path)

	return true
}
