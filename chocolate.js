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

// Test data for splits() Iterator.
const splitsTestData = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15]];
const expectedSplits = [
	[[[1, 2, 3, 4, 5]], [[6, 7, 8, 9, 10], [11, 12, 13, 14, 15]]],
	[[[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]], [[11, 12, 13, 14, 15]]],
	[[[1], [6], [11]], [[2, 3, 4, 5], [7, 8, 9, 10], [12, 13, 14, 15]]],
	[[[1, 2], [6, 7], [11, 12]], [[3, 4, 5], [8, 9, 10], [13, 14, 15]]],
	[[[1, 2, 3], [6, 7, 8], [11, 12, 13]], [[4, 5], [9, 10], [14, 15]]],
	[[[1, 2, 3, 4], [6, 7, 8, 9], [11, 12, 13, 14]], [[5], [10], [15]]]
];

/**
 * Given a bar of chocolate represented as (for example) [[0,0,1], [0,1,0], [0,0,0]],
 * where each 1 represents a square with raisins, and each 0 a square without,
 * return a tree of an optimal way to break the chocolate so that there are no
 * pieces with both raisin-squares and non-raisin squares.
 * @param {number[][]} bar
 */
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
	function splitHelper({x, y, width, height}) {
		const hash = x + " " + y + " " + width + " " + height;
		if (memo[hash]) {
			return memo[hash];
		}

		if (homogeneous({x, y, width, height})) {
			return memo[hash] = {
				piece: {x, y, width, height},
				numNodes: 1
			};
		} else {
			let best;

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

			return memo[hash] = best;
		}
	}

	return splitHelper({x: 0, y: 0, width: bar[0].length, height: bar.length});
}

/**
 * Print the tree returned by split() to the console.
 */
function print(bar) {
	// Return string representation of specified slice of the chocolate bar.
	function stringifyPiece({x, y, width, height}) {
		let str = "";
		for (let row = y; row < y + height; row++) {
			for (let col = x; col < x + width; col++) {
				str = str + bar[row][col];
			}
			str = str + "\n";
		}
		return str;
	}

	// Recursive function
	function printHelper(node, prefix) {
		if (prefix) console.log(prefix ? "\nPiece " + prefix + ":" : "Top piece:");
		console.log(stringifyPiece(node.piece));

		if (node.children) {
			node.children.forEach((childPiece, idx) => printHelper(childPiece, (prefix ? prefix + "." : "") + (idx + 1)));
		}
	}

	const root = split(bar);
	printHelper(root);
}

// Example from homework.
print([
	[1, 1, 0, 1],
	[0, 0, 0, 1],
	[0, 0, 0, 1],
	[0, 0, 0, 1],
	[0, 0, 1, 1],
	[0, 0, 1, 1]
]);

// Performance test.
const perfTestBar =  Array.from({ length: 20 }).map(() =>
	Array.from({ length: 30 }).map(() => Math.round(Math.random())));
const start = new Date();
const exampleSplit = split(perfTestBar);
const end = new Date();
console.log(`Performance test ${perfTestBar[0].length}x${perfTestBar.length}: ${end - start}ms`);
