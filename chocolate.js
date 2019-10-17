/**
 * Return Iterator of all possible sub-slices of the specified slice.
 */
function *splits({x, y, width, height}) {
	// Vertical splits
	for (let idx = 1; idx < height; idx++) {
		yield [
			{ x: x, y: y, width: width, height: idx },
			{ x: x, y: y + idx, width: width, height: height - idx},
		];
	}

	// Horizontal splits
	for (let idx = 1; idx < width; idx++) {
		yield [
			{ x: x, y: y, width: idx, height: height },
			{ x: x + idx, y: y, width: width - idx, height: height },
		];
	}
}

// Return a subset of the specified piece (ex: ["0001", "0100"]) based on specified dimensions.
function slice(bar, {x, y, width, height}) {
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
 * Given a bar of chocolate represented as (for example) [[0,0,1], [0,1,0], [0,0,0]],
 * where each 1 represents a square with raisins, and each 0 a square without,
 * return a tree of an optimal way to break the chocolate so that there are no
 * pieces with both raisin-squares and non-raisin squares.
 * @param {number[][]} bar
 */
let total=0, hits=0;
function split (bar) {
	// Returns true iff specified slice is all ones or all zeros.
	function homogeneous({x, y, width, height}) {
		var expected = bar[y][x];
		for (let row = y; row < y + height; row++) {
			for (let col = x; col < x + width; col++) {
				if (bar[row][col] !== expected )
					return false;
			}
		}

		return true;
	}

	const memo = {};

/*
	// Save a result.
	function memoize ({x, y, width, height}, res) {
		// Add entry for this exact slice of the bar.
		memo[x + " " + y + " " + width + " " + height] = res;

		// Adds 4 entries to hash for each of the four possible rotations.
		let piece = slice(bar, {x, y, width, height});
		for (let i = 0; i < 4; i++) {
			memo[piece.join(",")] = res;
			piece = rotate(piece);
		}
	}

	// Return saved result for the piece at the specified position,
	// or another identical piece from a different position.
	function lookup ({x, y, width, height}) {
		return memo[x + " " + y + " " + width + " " + height] ||
			memo[slice(bar, {x, y, width, height}).join(",")];
	}
*/

	function splitHelper({x, y, width, height}) {
		total++;
		const hash = x + " " + y + " " + width + " " + height;
		if (memo[hash]) {
			hits++;
			return memo[hash];
		}

		let best;
		if (homogeneous({x, y, width, height})) {
			best = {
				piece: {x, y, width, height},
				numNodes: 1
			};
		} else {
			// Loop through each possible split, and pick the one with the lowest cost.
			// If there's a tie, pick the first one.
			for(let [a,b] of splits({x, y, width, height})) {
				const aSplit = splitHelper(a), bSplit = splitHelper(b);
				const cost = aSplit.numNodes + bSplit.numNodes + 1;
				if (!best || best.numNodes > cost) {
					best = {
						piece: {x, y, width, height},
						children: [aSplit, bSplit],
						numNodes: cost
					};
				}
			}
		}

		return memo[hash] = best;
	}

	return splitHelper({x: 0, y: 0, width: bar[0].length, height: bar.length});
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

// Example from homework.
print([
	"1101",
	"0001",
	"0001",
	"0001",
	"0011",
	"0011"
]);

// Performance test.
const perfTestBar =  Array.from({ length: 20 }).map(() =>
	Array.from({ length: 30 }).map(() => Math.round(Math.random())).join(""));
const start = new Date();
const exampleSplit = split(perfTestBar);
const end = new Date();
console.log(`Performance test ${perfTestBar[0].length}x${perfTestBar.length}: ${end - start}ms`);
console.log(hits, " cache hits out of ", total, "split() calls", total - hits, "misses")
