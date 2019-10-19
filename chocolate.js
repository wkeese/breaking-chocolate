
// Return a subset of the specified piece (ex: ["0001", "0100"]) based on specified dimensions.
function slice(bar, [x, y, width, height]) {
	return bar.slice(y, y + height).map(row => row.substring(x, x + width));
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


/**
 * Given a bar of chocolate represented as (for example) ["001", "010", "000"],
 * where each 1 represents a square with raisins, and each 0 a square without,
 * return a tree of an optimal way to break the chocolate so that there are no
 * pieces with both raisin-squares and non-raisin squares.
 * @param {number[][]} bar
 */
let total=0, hits=0;
function split (bar) {
	const barNestedArray = bar.map(str => Array.from(str));

	// Returns true iff specified slice is all ones or all zeros.
	function homogeneous(x, y, width, height) {
		const expected = bar[y][x];
		for (let row = y; row < y + height; row++) {
			for (let col = x; col < x + width; col++) {
				if (bar[row][col] !== expected )
					return false;
			}
		}

		return true;
	}

	// Return Iterator of all useful sub-slices of the specified slice.
	function *splits(x, y, width, height) {
		// Horizontal splits
		for (let yDelta = 1; yDelta < height; yDelta++) {
			// If these two rows don't have any cells that differ from each other, then skip.
			for (let x1 = x; x1 < x + width; x1++) {
				if (bar[y + yDelta - 1][x1] !== bar[y + yDelta][x1]) {
					yield [
						[x, y, width, yDelta],
						[x, y + yDelta, width, height - yDelta]
					];
					break;
				}
			}
		}

		// Vertical splits
		for (let xDelta = 1; xDelta < width; xDelta++) {
			// If these two columns don't have any cells that differ from each other, then skip.
			for (let y1 = y; y1 < y + height; y1++) {
				if (bar[y1][x + xDelta - 1] !== bar[y1][x + xDelta]) {
					yield [
						[x, y, xDelta, height],
						[x + xDelta, y, width - xDelta, height]
					];
					break;
				}
			}
		}
	}

	const memo = new Map();

/*
	// Memoization functions to do maximum possible matches.
	function memoize (x, y, width, height, res) {
		// Adds 4 entries to hash, one for each of the four rotations.
		let piece = slice(bar, [x, y, width, height]);
		for (let i = 0; i < 4; i++) {
			memo[piece.join(",")] = res;
			piece = rotate(piece);
		}
	}

	function lookup (x, y, width, height) {
		return memo[slice(bar, [x, y, width, height]).join(",")];
	}
*/

	function splitHelper(x, y, width, height) {
		total++;
		const hash = x + " " + y + " " + width + " " + height;
		const cached = memo.get(hash);
		if (cached) {
			hits++;
			return cached;
		}

		let best;
		if (homogeneous(x, y, width, height)) {
			best = {
				piece: [x, y, width, height],
				numNodes: 1
			};
		} else {
			// Loop through each possible split, and pick the one with the lowest cost.
			// If there's a tie, pick the first one.
			for(let [a,b] of splits(x, y, width, height)) {
				const aSplit = splitHelper(...a), bSplit = splitHelper(...b);
				const cost = aSplit.numNodes + bSplit.numNodes + 1;
				if (!best || best.numNodes > cost) {
					best = {
						piece: [x, y, width, height],
						children: [aSplit, bSplit],
						numNodes: cost
					};
				}
			}
		}

		memo.set(hash, best);
		return best;
	}

	return splitHelper(0, 0, bar[0].length, bar.length);
}

/**
 * Print the tree returned by split() to the console.
 */
function print(bar) {
	// Recursive function
	function printHelper(node, prefix) {
		if (prefix) console.log(prefix ? "\nPiece " + prefix + ":" : "Top piece:");
		console.log(slice(bar, node.piece).join("\n"));

		if (node.children) {
			node.children.forEach((childPiece, idx) => printHelper(childPiece, (prefix ? prefix + "." : "") + (idx + 1)));
		}
	}

	const root = split(bar);
	printHelper(root);
}

// Test example from homework.
console.log("Homework example (and result):");
print([
	"1101",
	"0001",
	"0001",
	"0001",
	"0011",
	"0011"
]);

// Performance test.
function raisin (x, y) {
	return [[3, 4], [3, 5], [7, 6], [8, 6], [9, 6], [100, 101], [101, 101], [100, 102], [101, 102], [234, 345]].some(([x1, y1]) => x1 === x && y1 === y) ? "1" : "0";
}
const perfTestBar =  Array.from({ length: 300 }).map((val, y) =>
	Array.from({ length: 400 }).map((val, x) => raisin(x, y)).join(""));

console.log(`\n\nPerformance test on ${perfTestBar[0].length}x${perfTestBar.length} bar:`);
console.log(perfTestBar.join("\n"));

const start = new Date();
const exampleSplit = split(perfTestBar);
const end = new Date();
console.log(`${end - start}ms`);

// Print stats on memoization.
console.log(hits, " cache hits out of ", total, "split() calls", total - hits, "misses");
