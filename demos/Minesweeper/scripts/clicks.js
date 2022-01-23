const drawFlag = function(x, y) {
	// if it has a flag
	if (board[y][x].f == 1) {
		// draw the flag
		ctx.beginPath();
		ctx.arc(x * tilesWidth + tilesWidth / 2, y * tilesHeight + tilesHeight / 2, 5, 0, Math.PI * 2, false);
		ctx.fillStyle = "red";
		ctx.fill();
		ctx.closePath();
	};
};

const floodFill = function(x, y) {
	if (!board[y][x].b) { // if not a bomb (because we don't want to flood fill bombs
		tilesCleared++;
		board[y][x].r = 1; // reveal self

		// check that we have no neighbors
		if (board[y][x].n == 0) {
			// check each neighbor and if its not revealed, floodfill it
			if (x < tilesRow - 1 && !board[y][x+1].r) floodFill(x + 1, y);
			if (x < tilesRow - 1 && y > 0 && !board[y-1][x+1].r) floodFill(x + 1, y - 1);
			if (x < tilesRow - 1 && y < tilesColumn - 1 && !board[y+1][x+1].r) floodFill(x + 1, y + 1);

			if (x > 0 && !board[y][x-1].r) floodFill(x - 1, y);
			if (x > 0 && y > 0 && !board[y-1][x-1].r) floodFill(x - 1, y - 1);
			if (x > 0 && y < tilesColumn - 1 && !board[y+1][x-1].r) floodFill(x - 1, y + 1);
			
			if (y < tilesColumn - 1 && !board[y+1][x].r) floodFill(x, y + 1);
			if (y > 0 && !board[y-1][x].r) floodFill(x, y - 1);
		}
	};
};

const makeBoard = function(boardXIndex, boardYIndex) {
	// loop through all of the tiles
	for (let i = 0; i < tilesRow; i++) {
		for (let j = 0; j < tilesColumn; j++) {
			// 20% chance of becoming a bomb
			const bombChance = !Boolean( Math.floor( Math.random() * bombDifficulty ) );
			if (bombChance)
				board[j][i].b = 1;

			// get the distance from the clicked square, and if inside 4 radius, do not set a bomb
			drawingdistance = Math.abs(Math.round(Math.sqrt(
				Math.pow(i - boardXIndex, 2) + Math.pow(j - boardYIndex, 2))));
			if (drawingdistance <= 4) board[j][i].b = 0;
		};
	};

	board[boardYIndex][boardXIndex].b = 0; // clear the square the player clicked

	// loop through all of the tiles
	for (let i = 0; i < tilesRow; i++) {
		for (let j = 0; j < tilesColumn; j++) {
			bombsMade += (board[j][i].b) ? 1 : 0;
			// count each neighbouring bombs and add to tile.n
			if (i > 0) {
				board[j][i].n += board[j][i-1].b;
				if (j > 0) board[j][i].n += board[j-1][i-1].b;
				if (j < tilesColumn-1) board[j][i].n += board[j+1][i-1].b;
			};
			if (i < tilesRow-1) {
				board[j][i].n += board[j][i+1].b;
				if (j > 0) board[j][i].n += board[j-1][i+1].b;
				if (j < tilesColumn-1) board[j][i].n += board[j+1][i+1].b;
			};
			if (j > 0) board[j][i].n += board[j-1][i].b;
			if (j < tilesColumn-1) board[j][i].n += board[j+1][i].b;
		};
	};
};

const getTextColor = function(x, y) {
	ctx.font = "bold 16px Arial";
	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
			

	switch (board[y][x].n) { // check how many neighbours the tile has, and color based on that
		case 0: break;
		case 1: ctx.fillStyle = "#2279d0"; break;
		case 2: ctx.fillStyle = "#3b8f3e"; break;
		case 3: ctx.fillStyle = "#d32f2f"; break;
		case 4: ctx.fillStyle = "#800080"; break;
		case 5: ctx.fillStyle = "#800000"; break;
		case 6: ctx.fillStyle = "#40E0D0"; break;
		case 7: ctx.fillStyle = "#000000"; break;
		case 8: ctx.fillStyle = "#555555"; break;
	};
};

const kill = function() {
	let bombs = [];
	for (let i = 0; i < tilesRow; i++)
		for (let j = 0; j < tilesColumn; j++)
			if (board[j][i].b)
				bombs.push({x: i, y: j});
	
	const colors = [
		"#2279d0",
		"#3b8f3e",
		"#d32f2f",
		"#800080",
		"#800000",
		"#40E0D0",
		"#000000",
		"#555555",
	];

	while (bombs.length > 0) {
		const bombIndex = Math.floor(Math.random() * bombs.length); // get a random bomb
		const colorIndex = Math.floor(Math.random() * colors.length); // get a random color

		const currBomb = bombs[bombIndex];

		setTimeout(() => {
			ctx.fillStyle = `${colors[colorIndex]}22`;
			ctx.fillRect(currBomb.x * tilesWidth, currBomb.y * tilesHeight, tilesWidth, tilesHeight);

			ctx.beginPath();
			ctx.arc(currBomb.x * tilesWidth + tilesWidth / 2, currBomb.y * tilesHeight + tilesHeight / 2, 7, 0, Math.PI * 2, false);
			ctx.fillStyle = colors[colorIndex]; // set the fillstyle
			ctx.fill();
			ctx.closePath();

			ctx.font = "bold 64px Arial";
			ctx.fillStyle = "black";
			ctx.fillText("Game Over!", canvasWidth / 2, canvasHeight / 2);

		}, bombs.length * 25);

		bombs.splice(bombIndex, 1);
	};
};

const boardClicked = function(boardXIndex, boardYIndex) {
	if (!firstClicked) { // if first click
		makeBoard(boardXIndex, boardYIndex); // make the board
		floodFill(boardXIndex, boardYIndex); // and start the floodfill from the clicked square
		firstClicked = true;
	} else {
		// else check if it was a bomb
		if (board[boardYIndex][boardXIndex].f == 1) return;
		
		if (board[boardYIndex][boardXIndex].b) {
			kill();
			killed = true;
		} else {
			// else reveal, and if it was an empty square start floodfill
			if (board[boardYIndex][boardXIndex].n == 0) floodFill(boardXIndex, boardYIndex);
			else {
				tilesCleared++;
				board[boardYIndex][boardXIndex].r = 1;
			};
		};
	};
};

const drawBoard = function() {
	ctx.clearRect(0, 0, canvasWidth, canvasHeight); // clear the canvas

	for (let i = 0; i < tilesRow; i++) {
		for (let j = 0; j < tilesColumn; j++) {

			// set every other grass color
			if ((i + j) % 2 == 0) ctx.fillStyle = "#aad751";
			else ctx.fillStyle = "#a2d149";
			ctx.fillRect(i * tilesWidth, j * tilesHeight, tilesWidth, tilesHeight); // and draw

			drawFlag(i, j); // draw the flag
			if (board[j][i].r == 0) continue; // if this square has not been revealed continue with the loop

			// set every other ground color
			if ((i + j) % 2 == 0) ctx.fillStyle = "#e5c29f";
			else ctx.fillStyle = "#d7b898";
			ctx.fillRect(i * tilesWidth, j * tilesHeight, tilesWidth, tilesHeight); // and draw

			getTextColor(i, j); // set font color
			if (board[j][i].n > 0 && !board[j][i].b) ctx.fillText(board[j][i].n, i * tilesWidth + tilesWidth / 2, j * tilesHeight + tilesHeight / 2); // draw the text
		};
	};
};

canvas.addEventListener("click", evt => {
	if (killed) return;
	// get mouse  positions
	const mouseX = evt.x - canvas.getBoundingClientRect().x;
	const mouseY = evt.y - canvas.getBoundingClientRect().y;

	// mouse inside the canvas
	if (mouseX > 0 && mouseX < canvasWidth && mouseY > 0 && mouseY < canvasHeight) {
		const boardXIndex = Math.floor(mouseX / tilesWidth);
		const boardYIndex = Math.floor(mouseY / tilesHeight);

		boardClicked(boardXIndex, boardYIndex);
		if (!killed) drawBoard(); // update the board

		if (tilesCleared == tilesMade - bombsMade) {
			ctx.font = "bold 64px Arial";
			ctx.fillStyle = "black";
			ctx.fillText("You win!", canvasWidth / 2, canvasHeight / 2);
				killed = true;
		};
	};
});

canvas.onmouseover = () => canvas.style["cursor"] = "pointer";
canvas.oncontextmenu = () => false; // disable default right click on canvas

canvas.addEventListener("contextmenu", evt => {
	if (killed) return;
	// get mouse  positions
	const mouseX = evt.x - canvas.getBoundingClientRect().x;
	const mouseY = evt.y - canvas.getBoundingClientRect().y;

	// mouse inside the canvas
	if (mouseX > 0 && mouseX < canvasWidth &&
		mouseY > 0 && mouseY < canvasHeight) {
		
		const boardXIndex = Math.floor(mouseX / tilesWidth);
		const boardYIndex = Math.floor(mouseY / tilesHeight);

		board[boardYIndex][boardXIndex].f = Math.abs(board[boardYIndex][boardXIndex].f - 1);
		drawBoard();
	};
});

canvas.addEventListener("mousemove", evt => {
	if (killed) return;
	// get mouse  positions
	const mouseX = evt.x - canvas.getBoundingClientRect().x;
	const mouseY = evt.y - canvas.getBoundingClientRect().y;

	// mouse inside the canvas
	if (mouseX > 0 && mouseX < canvasWidth &&
		mouseY > 0 && mouseY < canvasHeight) {
		
		const boardXIndex = Math.floor(mouseX / tilesWidth);
		const boardYIndex = Math.floor(mouseY / tilesHeight);

		if (board[lastHoverY][lastHoverX].r == 0) {
			// reset hover grass
			if ((lastHoverX + lastHoverY) % 2 == 0) ctx.fillStyle = "#aad751";
			else ctx.fillStyle = "#a2d149";
			ctx.fillRect(lastHoverX * tilesWidth, lastHoverY * tilesHeight, tilesWidth, tilesHeight); // and draw
			drawFlag(lastHoverX, lastHoverY); // draw flag if exists
		} else {
			// reset hover dirt
			if ((lastHoverX + lastHoverY) % 2 == 0) ctx.fillStyle = "#e5c29f";
			else ctx.fillStyle = "#d7b898";
			ctx.fillRect(lastHoverX * tilesWidth, lastHoverY * tilesHeight, tilesWidth, tilesHeight);

			// draw text
			getTextColor(lastHoverX, lastHoverY);
			if (board[lastHoverY][lastHoverX].n > 0) ctx.fillText(board[lastHoverY][lastHoverX].n, lastHoverX * tilesWidth + tilesWidth / 2, lastHoverY * tilesHeight + tilesHeight / 2);
		};

		if (board[boardYIndex][boardXIndex].r && board[boardYIndex][boardXIndex].n > 0) {
			// draw dirt
			ctx.fillStyle = "#e5c29f";
			ctx.fillRect(boardXIndex * tilesWidth, boardYIndex * tilesHeight, tilesWidth, tilesHeight);

			getTextColor(boardXIndex, boardYIndex); // get the fillstyle
			ctx.fillText(board[boardYIndex][boardXIndex].n, boardXIndex * tilesWidth + tilesWidth / 2, boardYIndex * tilesHeight + tilesHeight / 2); // draw the text
		} else if (board[boardYIndex][boardXIndex].r == 0) {
			// draw grass
			ctx.fillStyle = "#b9dd77";
			ctx.fillRect(boardXIndex * tilesWidth, boardYIndex * tilesHeight, tilesWidth, tilesHeight);

			drawFlag(boardXIndex, boardYIndex);
		};
		lastHoverX = boardXIndex;
		lastHoverY = boardYIndex;
	};
});



drawBoard(); // draw first
