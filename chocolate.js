const mathjs = require("mathjs");


/**
 * Given a piece of chocolate represented as (for example) [[0,0,1], [0,1,0], [0,0,0]],
 * where each 1 represents a square with raisins, and each 0 a square without,
 * return list of all ways that chocolate can be split into two pieces.
 * @param {number[][]} piece
 */
function splits (piece) {
	const rows = piece.length, cols = piece[0].length;

	if (rows <= 1 && cols <= 1) {
		throw new TypeError("Piece indivisible");
	}

	// Convert scalar into double array.  Reverts mathjs.subset() behavior
	// of returning a scalar when you select a 1x1 subset of a matrix.
	// See https://www.gitmemory.com/issue/josdejong/mathjs/1484/487436038.
	function wrap (piece) {
		return typeof piece === "number" ? [[piece]] : piece;
	}

	let results = [];

	if (rows > 1) {
		const verticalSplits = mathjs.range(1, rows).map(idx => [
			// top
			wrap(mathjs.subset(piece, mathjs.index(mathjs.range(0, idx), mathjs.range(0, cols)))),

			// bottom
			wrap(mathjs.subset(piece, mathjs.index(mathjs.range(idx, rows), mathjs.range(0, cols))))
		]);
		results = results.concat(verticalSplits._data)
	}

	if (cols > 1) {
		const horizontalSplits = mathjs.range(1, cols).map(idx => [
			// left
			wrap(mathjs.subset(piece, mathjs.index(mathjs.range(0, rows), mathjs.range(0, idx)))),

			// right
			wrap(mathjs.subset(piece, mathjs.index(mathjs.range(0, rows), mathjs.range(idx, cols))))
		]);
		results = results.concat(horizontalSplits._data)
	}

	return results;
}

// Test data for splits() method.
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
 * Returns true iff specified piece is all ones or all zeros.
 */
function isPure (piece) {
	return piece.every(row => row.every(val => val === piece[0][0]));
}

/**
 * Given a piece of chocolate represented as (for example) [[0,0,1], [0,1,0], [0,0,0]],
 * where each 1 represents a square with raisins, and each 0 a square without,
 * return a tree of an optimal way to break the chocolate so that there are no
 * pieces with both raisin-squares and non-raisin squares.
 * @param {number[][]} piece
 */
function split (piece) {
	if (isPure(piece)) {
		return {
			piece: piece,
			numNodes: 1
		};
	} else {
		// Loop through each possible split, and pick the one with the lowest cost.
		// If there's a tie, pick the first one.
		return splits(piece).reduce((bestSoFar, [a, b]) => {
			const aSplit = split(a), bSplit = split(b), cost = aSplit.numNodes + bSplit.numNodes;
			if (!bestSoFar || bestSoFar.numNodes > cost) {
				return {
					piece: piece,
					children: [aSplit, bSplit],
					numNodes: aSplit.numNodes + bSplit.numNodes + 1
				};
			} else {
				return bestSoFar;
			}
		}, null);
	}
}

// Spot check that split() works.
function print (node, prefix) {
	if (prefix) console.log(prefix ? "\nPiece " + prefix + ":" : "Top piece:");
	console.log(node.piece.map(row => row.join("")).join("\n"));
	if (node.children) {
		node.children.forEach((childPiece, idx) => print(childPiece, (prefix ? prefix + "." : "") + (idx + 1)));
	}
}
const examplePiece = [
	[1, 1, 0, 1],
	[0, 0, 0, 1],
	[0, 0, 0, 1],
	[0, 0, 0, 1],
	[0, 0, 1, 1],
	[0, 0, 1, 1]
];
const exampleSplit = split(examplePiece);
print(exampleSplit);