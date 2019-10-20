let total=0, hits=0;
const memo = new Map();

/**
 * A piece of chocolate.
 */
class Grid {
	/**
	 * Construct grid as subset of specified array of strings.
	 * @param {String[]} data
	 * @param {number} startX
	 * @param {number} startY
	 * @param {number} endX
	 * @param {number} endY
	 */
	constructor(data, startX, startY, endX, endY) {
		this.bar = data;
		this.startX = startX || 0;
		this.startY = startY || 0;
		this.endX = endX || data[0].length;
		this.endY = endY || data.length
	}

	/**
	 * 	Returns true if all ones or all zeros.
	 */
	homogeneous() {
		const expected = this.bar[this.startY][this.startX];

		for (let row = this.startY; row < this.endY; row++) {
			for (let col = this.startX; col < this.endX; col++) {
				if (this.bar[row][col] !== expected )
					return false;
			}
		}

		return true;
	}

	toString() {
		return this.bar.slice(this.startY, this.endY).map(row => row.substring(this.startX, this.endX)).join("\n");
	}

	// Return Iterator of all useful slices
	*splits() {
		// Horizontal splits
		for (let y = this.startY + 1; y < this.endY; y++) {
			// If these two rows don't have any cells that differ from each other, then skip.
			for (let x = this.startX; x < this.endX; x++) {
				if (this.bar[y - 1][x] !== this.bar[y][x]) {
					yield [
						new Grid(this.bar, this.startX, this.startY, this.endX, y),
						new Grid(this.bar, this.startX, y, this.endX, this.endY)
					];
					break;
				}
			}
		}

		// Vertical splits
		for (let x = this.startX + 1; x < this.endX; x++) {
			// If these two columns don't have any cells that differ from each other, then skip.
			for (let y = this.startY; y < this.endY; y++) {
				if (this.bar[y][x - 1] !== this.bar[y][x]) {
					yield [
						new Grid(this.bar, this.startX, this.startY, x, this.endY),
						new Grid(this.bar, x, this.startY, this.endX, this.endY)
					];
					break;
				}
			}
		}
	}

	hash (){
		return this.startX + " " + this.startY + " " + this.endX + " " + this.endY;
	}

	/**
	 * Return a tree of an optimal way to break the chocolate so that there are no
	 * pieces with both raisin-squares and non-raisin squares.
	 * @returns Tree
	 */
	split() {
		total++;

		const hash = this.hash();
		const cached = memo.get(hash);
		if (cached) {
			hits++;
			return cached;
		}

		let best;
		if (this.homogeneous()) {
			best = new Tree(this);
		} else {
			// Loop through each possible split, and pick the one with the lowest cost.
			// If there's a tie, pick the first one.
			for(let [a,b] of this.splits()) {
				const aSplit = a.split(), bSplit = b.split();
				const cost = aSplit.numNodes + bSplit.numNodes + 1;
				if (!best || best.numNodes > cost) {
					best = new Tree(this, [aSplit, bSplit]);
				}
			}
		}

		memo.set(hash, best);
		return best;
	}
}

/**
 * A tree of Grids showing how to split them into homogeneous pieces.
 */
class Tree {
	constructor(piece, children) {
		this.piece = piece;
		this.children = children;
		this.numNodes = children ? children[0].numNodes + children[1].numNodes + 1 : 1
	}

	print(prefix) {
		console.log(prefix ? "\nPiece " + prefix + ":" : "Top piece:");
		console.log(this.piece.toString());

		if (this.children) {
			this.children.forEach((childPiece, idx) => childPiece.print((prefix ? prefix + "." : "") + (idx + 1)));
		}
	}
}

/**
 * Rotate a matrix 90 degrees to the right.
 * @param {String[]} - matrix
 * @returns {String[]}
 */
function rotate (matrix) {
	const width = matrix[0].length;
	const ret = [];
	for (let col = 0; col < width; col++) {
		ret.push(matrix.map(row => row.substring(col, col + 1)).reverse().join(""))
	}
	return ret;
}

/*
// Memoization functions to do maximum possible matches.
function memoize (startX, startY, width, height, res) {
	// Adds 4 entries to hash, one for each of the four rotations.
	let piece = slice(bar, [startX, startY, width, height]);
	for (let i = 0; i < 4; i++) {
		memo[piece.join(",")] = res;
		piece = rotate(piece);
	}
}

function lookup (startX, startY, width, height) {
	return memo[slice(bar, [startX, startY, width, height]).join(",")];
}
*/

// Test example from homework.
console.log("Homework example (and result):");
const homeworkGrid = new Grid([
	"1101",
	"0001",
	"0001",
	"0001",
	"0011",
	"0011"
]);
const homeworkTree = homeworkGrid.split();
homeworkTree.print();

// Performance test.
const perfTestBar =  Array.from({ length: 50 }).map(() =>
	Array.from({ length: 50 }).map(() => Math.round(Math.random())).join(""));


console.log(`\n\nPerformance test on ${perfTestBar[0].length}x${perfTestBar.length} bar:`);
console.log(perfTestBar.join("\n"));

const start = new Date();
const bar = new Grid(perfTestBar);
const exampleSplit = bar.split();
const end = new Date();
console.log(`${end - start}ms`);

// Sparse bar (not many raisins).
function raisin (x, y) {
	return [[3, 4], [3, 5], [7, 6], [8, 6], [9, 6], [100, 101], [101, 101], [100, 102], [101, 102], [234, 345]].some(([x1, y1]) => x1 === x && y1 === y) ? "1" : "0";
}
const sparseTestBar =  Array.from({ length: 300 }).map((val, y) =>
	Array.from({ length: 400 }).map((val, x) => raisin(x, y)).join(""));


// Print stats on memoization.
console.log(hits, " cache hits out of ", total, "split() calls", total - hits, "misses");
