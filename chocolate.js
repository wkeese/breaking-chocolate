/**
 * Given a piece of chocolate represented as (for example) [[0,0,1], [0,1,0], [0,0,0]],
 * where each 1 represents a square with raisins, and each 0 a square without,
 * return a String representation like "001\n010\n000" suitable for printing or as a
 * hash key.
 *  @param {number[][]} piece
 *  @returns string
 */
function serializePiece(piece) {
	return piece.map(row => row.join("")).join("\n")
}

/**
 * Given a piece of chocolate represented as (for example) [[0,0,1], [0,1,0], [0,0,0]],
 * where each 1 represents a square with raisins, and each 0 a square without,
 * return list of all ways that chocolate can be split into two pieces.
 * @param {number[][]} piece
 */
function splits(piece) {
	const rows = piece.length, cols = piece[0].length;
	const verticalSplits = rows > 1 ?
		[...Array(rows - 1).keys()].map(idx => [piece.slice(0, idx + 1), piece.slice(idx + 1)]) :
		[];
	const horizontalSplits = cols > 1 ?
		[...Array(cols - 1).keys()].map(idx => [
			piece.map(row => row.slice(0, idx + 1)), piece.map(row => row.slice(idx + 1))]) :
		[];

	return verticalSplits.concat(horizontalSplits);
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
function homogeneous(piece) {
	return piece.every(row => row.every(val => val === piece[0][0]));
}

/**
 * Given a piece of chocolate represented as (for example) [[0,0,1], [0,1,0], [0,0,0]],
 * where each 1 represents a square with raisins, and each 0 a square without,
 * return a tree of an optimal way to break the chocolate so that there are no
 * pieces with both raisin-squares and non-raisin squares.
 * @param {number[][]} piece
 */
function split(piece) {
	return homogeneous(piece) ?
		{
			piece: piece,
			numNodes: 1
		} :
		// Loop through each possible split, and pick the one with the lowest cost.
		// If there's a tie, pick the first one.
		splits(piece).map(([a, b]) => {
			const aSplit = split(a), bSplit = split(b);
			return {
				piece: piece,
				children: [aSplit, bSplit],
				numNodes: aSplit.numNodes + bSplit.numNodes + 1
			};
		}).reduce((bestTree, curTree) => curTree.numNodes < bestTree.numNodes ? curTree : bestTree);
}

/**
 * Print a tree returned by split() to the console.
 * @param node
 * @param prefix
 */
function print(node, prefix) {
	if (prefix) console.log(prefix ? "\nPiece " + prefix + ":" : "Top piece:");
	console.log(serializePiece(node.piece));
	if (node.children) {
		node.children.forEach((childPiece, idx) => print(childPiece, (prefix ? prefix + "." : "") + (idx + 1)));
	}
}

// Spot check that split() works.
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

// Performance test.
const bigBar =  Array.from({ length: 200 }).map(() =>
	Array.from({ length: 300 }).map(() => Math.round(Math.random())));
var start = new Date();
const res = split(bigBar);
var end = new Date();
console.log("ms: ", (end-start));
