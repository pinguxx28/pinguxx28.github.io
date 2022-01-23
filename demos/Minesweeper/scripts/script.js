/**
 * Made by pinguxx28
 * 2022 Jan 20 - Jan 23
 * Core structure made in one day
 * 
 * After, added colors, flagging, win and lose, etc..
 */
const tilesRow = 40;    // amount of tiles in 1 row
const tilesColumn = 30; // amount of tiles in 1 column
const totalTiles = tilesRow * tilesColumn; // total amount of tiles

const tilesWidth = 25;  // tile wide (pixels)
const tilesHeight = 25; // tile high (pixels)

const canvasWidth = tilesRow * tilesWidth;   // canvas width
const canvasHeight = tilesColumn * tilesHeight; // canvas height

const canvas = document.querySelector("#minesweeperCanvas");

// set styles
canvas.style["background-color"] = "black";
canvas.style["position"] = "absolute";
canvas.style["left"] = "50%";
canvas.style["top"] = "50%";
canvas.style["transform"] = "translate(-50%, -50%)";


const ctx = canvas.getContext("2d");

canvas.width  = canvasWidth ;
canvas.height = canvasHeight;

const bombDifficulty = 10;

let lastHoverX = 0;
let lastHoverY = 0;
let firstClicked = false;

let killed = false;

let tilesMade = 0;
let tilesCleared = 0;
let bombsMade = 0;	

// make an fill the board
const board = [];
for (let i = 0; i < tilesColumn; i++) {
	board.push([]);
	for (let j = 0; j < tilesRow; j++) {
		board[i][j] = {b: 0, n: 0, r: 0, f: 0}; // bomb = bool, neighboors = int, revealed = bool, flag = bool
		tilesMade++;
	};
};