// Define HTML elements
const board = document.getElementById("game-board");
const instructionText = document.getElementById("instruction-text");
const logo = document.getElementById("logo");
const score = document.getElementById("score");
const highScoreText = document.getElementById("highScore");
const pauseMessage = document.getElementById("pause-message");
const levelSelection = document.getElementById("level-selection")

const levelList = document.querySelectorAll("#level-list li");

//Audio
const backgroundSound = document.getElementById("background-sound");
const pauseSound = document.getElementById("pause-sound");
const moveSound = document.getElementById("move-sound");
const collisionSound = document.getElementById("collision-sound");
const eatSound = document.getElementById("eat-sound");
const selectLevelSound = document.getElementById("selection-level-sound");

backgroundSound.volume = 0.15;
pauseSound.volume = 0.5;
moveSound.volume = 1;
collisionSound.volume = 0.5;
eatSound.volume = 0.4;

//Game variables
const levels = [
    {
        name: "Easy",
        gameSpeedDelay: 300,
        gridSize: 20,
    },
    {
        name: "Normal",
        gameSpeedDelay: 200,
        gridSize: 20,
    },
    {
        name: "Hard",
        gameSpeedDelay: 150,
        gridSize: 20,
    }
];

let levelSelected = false;
let selectedLevelIndex = 1;

let gameInterval;
let gameSpeedDelay;
let gridSize;

let snake = [{ x: 10, y: 10 }];
let food;
let highScore = 0;
let direction = "right";

let gameStarted = false;
let gameStopped = false;
let canChangeDirection = true; // Check if the direction can canghe (ex. no up -> down)

// Draw game map, snake, food
function draw() {
    board.innerHTML = ""; //Cleans the game area by removing all child elements
    drawSnake();
    drawFood();
    updateScore();
}

// Draw snake
function drawSnake() {
    if (gameStarted) {
        snake.forEach((segment) => {
            const snakeElement = createGameElement("div", "snake"); //Creates an element and gives it "snake" class
            setPosition(snakeElement, segment);
    
            board.appendChild(snakeElement); //The appendChild() method of the Node interface adds a node to the end of the list of children of a specified parent node.
        })
    }
}

//Draw food function
function drawFood() {
    if (gameStarted) {
        const foodElement = createGameElement("div", "food");
        setPosition(foodElement, food)

        board.appendChild(foodElement);
    }
}

// Create a snake or food cube/div
function createGameElement(tag, myClassName) {

    const element = document.createElement(tag); //Creates an instance of the element for the specified tag
    element.className = myClassName;
    return element;
}

// Set the position of snake or food
function setPosition(element, position) {
    element.style.gridColumn = position.x;
    element.style.gridRow = position.y;
}

//Generate food function and check if food is on snake
function generateFood() {

    let x, y;
    let isOnSnake = false;

    do {
        x = Math.floor((Math.random() * gridSize)) + 1;
        y = Math.floor((Math.random() * gridSize)) + 1;

        for (let i = 0; i < snake.length; i++) {
            if ( x === snake[i].x && y === snake[i].y ) {
                isOnSnake = true;
                break;
            }
        }
    } while (isOnSnake);

    return { x, y };
}

//Snake movement
function move() {

    const head = { ...snake[0] }; // spread operator (...) to copy snake values, != snake[0] weird behavior

    switch (direction) {
        case "up":
            head.y--;
            break;
        case "down":
            head.y++;
            break;
        case "right":
            head.x++;
            break;
        case "left":
            head.x--;
            break;
    }

    canChangeDirection = true; // *********** !!! Unlocks direction change ONLY after the snake has moved !!! ***********

    snake.unshift(head); //Inserts new elements at the start of an array, and returns the new length of the array
    //snake.pop(); //Removes the last element from an array and returns it

    if (head.x === food.x && head.y === food.y) {

        eatSound.currentTime = 0;
        eatSound.play();
        food = generateFood(); //New food on the map
        increaseSpeed();
        clearInterval(gameInterval); // Clear past interval, otherwise multiple intervals will stack up, causing the game to speed up uncontrollably
        gameInterval = setInterval(() => {
            move();
            checkCollision();
            draw();
        }, gameSpeedDelay)

    } else {
        snake.pop();
    }
}

//Start game function
function startGame() {
    gameStarted = true; //Keep track of a running game
    backgroundSound.loop = true;
    backgroundSound.play();
    gameInterval = setInterval(() => {
        move(); //move first
        checkCollision(); //check for collision
        draw(); //draw new position
    }, gameSpeedDelay);
}

//Keypress event listener
function handleKeyPress(event) {

    /* Main logic:
        1. No other keys will work other than the space bar: Player must select a level
        2. Player can move with up/down arrows to select a level (default: normal)
        3. Player presses space bar to select a level and start the game
        4. Game is started. Player can move the snake with WASD/ARROWS
        5. Player can press ESC to pause the game 
    */


    if ( !levelSelected && !gameStarted && ((event.code === "Space") || (event.key === " ")) ) {
        instructionText.style.display = "none";
        logo.style.display = "none";
        levelSelection.style.display = "block";
        levelSelected = true;
    } else if (levelSelected && !gameStarted) {
        if (event.key === "ArrowDown") {
            selectedLevelIndex = (selectedLevelIndex + 1) % levelList.length;
            selectLevelSound.currentTime = 0;
            selectLevelSound.play();
        } else if (event.key === "ArrowUp") {
            selectedLevelIndex = (selectedLevelIndex - 1 + levelList.length) % levelList.length;
            selectLevelSound.currentTime = 0;
            selectLevelSound.play();
        }
        updateSelection(); // Update the visual selection after changing index

        if (event.code === "Space" || event.key === " ") {
            setLevel(selectedLevelIndex);
        }
    }

    if (gameStarted) {
        //Stop game
        if (!gameStopped && event.key === "Escape") {
            gameStopped = true;
            clearInterval(gameInterval);
            pauseMessage.style.display = "block";

            backgroundSound.pause();
            pauseSound.currentTime = 0;
            pauseSound.play();

        } else if (gameStopped && event.key === "Escape") {
            gameStopped = false;

            pauseSound.currentTime = 0;
            pauseSound.play();
            backgroundSound.pause();
            
            pauseMessage.style.display = "none";

            startGame();
        }

        //Control snake
        if (canChangeDirection) {
            switch (event.key) {
                case "ArrowUp":
                case "w":
                    if (direction !== "down") {

                        console.log("going up...");
                        direction = "up";
                        moveSound.currentTime = 0;
                        moveSound.play();
                    }
                    break;
                case "ArrowDown":
                case "s":
                    if (direction !== "up") {

                        console.log("going down...");
                        direction = "down";
                        moveSound.currentTime = 0;
                        moveSound.play();
                    }
                    break;
                case "ArrowLeft":
                case "a":
                    if (direction !== "right") {

                        console.log("going left...")
                        direction = "left";
                        moveSound.currentTime = 0;
                        moveSound.play();                        
                    }
                    break;
                case "ArrowRight":
                case "d":
                    if (direction !== "left") {

                        console.log("going right...");
                        direction = "right";
                        moveSound.currentTime = 0;
                        moveSound.play();
                    }
                    break;
            }
            canChangeDirection = false; // Prevent further direction changes until the next movement
        }
    }
}

document.addEventListener('keydown', handleKeyPress);

function increaseSpeed() {
    console.log(gameSpeedDelay);
    if (gameSpeedDelay > 201) {

        gameSpeedDelay -= 5;
    } else if (gameSpeedDelay > 151) {

        gameSpeedDelay -= 4;
    } else if (gameSpeedDelay > 101) {

        gameSpeedDelay -= 3;
    } else if (gameSpeedDelay > 51) {

        gameSpeedDelay -= 2;
    } else if (gameSpeedDelay > 26) {

        gameSpeedDelay -= 1;
    }
}

//Checks for collisions and resets the game
function checkCollision() {

    const head = snake[0];

    if (head.x < 1 || head.x > gridSize || head.y < 1 || head.y > gridSize) {
        eatSound.pause(); 
        collisionSound.currentTime = 0;
        collisionSound.play();
        resetGame();
    }

    //snake bites himself
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            eatSound.pause()
            collisionSound.currentTime = 0;
            collisionSound.play();
            resetGame();
        }
    }
}

function resetGame() {
    updateHighScore();
    stopGame();
    snake = [{ x: 10, y: 10 }];
    direction = "right";
    food = generateFood();
    updateScore();
}

function updateScore() {

    const currentScore = snake.length - 1;
    score.textContent = currentScore.toString().padStart(3, "0"); //To mantain 3 digits
}

function updateHighScore() {

    const currentScore = snake.length - 1;
    if (currentScore > highScore) {

        highScore = currentScore;
        highScoreText.textContent = highScore.toString().padStart(3, "0");
    }
    highScoreText.style.display = "block";
}

function stopGame() {
    clearInterval(gameInterval);
    levelSelected = false;
    gameStarted = false;

    backgroundSound.pause();
    backgroundSound.currentTime = 0;

    instructionText.style.display = "block";
    logo.style.display = "block";
}

// Updates the visual selection of the levels in the menu
function updateSelection() {
    // Remove 'selected' class from all levels
    levelList.forEach(level => level.classList.remove("selected"));
    // Add 'selected' class to the currently selected level
    levelList[selectedLevelIndex].classList.add("selected");
    console.log("Level: " + selectedLevelIndex, levels[selectedLevelIndex].name);
}

function setLevel(index) {

    const level = levels[index];
    console.log(`[setLevel] Function called:
    - Level name: ${level.name}
    - Game speed delay: ${level.gameSpeedDelay} ms
    - Grid size: ${level.gridSize}x${level.gridSize}`);

    levelSelection.style.display = "none";
    gameSpeedDelay = level.gameSpeedDelay;
    gridSize = level.gridSize;
    food = generateFood()

    startGame();
}
