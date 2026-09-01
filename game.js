const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


// -----------------------------
// UI
// -----------------------------

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const scoreDisplay = document.getElementById("scoreDisplay");
const coinDisplay = document.getElementById("coinDisplay");
const bestDisplay = document.getElementById("bestDisplay");

const livesDisplay = document.getElementById("livesDisplay");
const levelDisplay = document.getElementById("levelDisplay");

const finalScore = document.getElementById("finalScore");
const finalCoins = document.getElementById("finalCoins");
const finalBest = document.getElementById("finalBest");

const powerMessage = document.getElementById("powerMessage");

const shieldStatus = document.getElementById("shieldStatus");
const boostStatus = document.getElementById("boostStatus");

const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");


// -----------------------------
// CANVAS
// -----------------------------

function resizeCanvas() {

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    if (!gameRunning) {
        player.x =
            canvas.width / 2 -
            player.width / 2;

        player.y =
            canvas.height - 120;
    }
}

window.addEventListener("resize", resizeCanvas);


// -----------------------------
// GAME VARIABLES
// -----------------------------

let gameRunning = false;

let score = 0;
let coinsCollected = 0;

let lives = 3;

let level = 1;

let gameSpeed = 4;

let roadOffset = 0;

let coinTimer = 0;
let obstacleTimer = 0;
let powerTimer = 0;

let shieldActive = false;
let boostActive = false;

let shieldTime = 0;
let boostTime = 0;

let particles = [];

let animationId = null;

let bestScore =
    Number(localStorage.getItem("coinRushBest")) || 0;

bestDisplay.textContent = bestScore;


// -----------------------------
// PLAYER
// -----------------------------

const player = {

    width: 45,

    height: 65,

    x: 0,

    y: 0,

    speed: 7,

    movingLeft: false,

    movingRight: false
};


// -----------------------------
// ARRAYS
// -----------------------------

let coins = [];

let obstacles = [];

let powerUps = [];


// -----------------------------
// AUDIO
// -----------------------------

let audioContext = null;


function initAudio() {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();
    }
}


function playSound(
    frequency,
    duration = 0.08,
    type = "sine"
) {

    if (!audioContext) return;

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.type = type;

    oscillator.frequency.value =
        frequency;

    gain.gain.setValueAtTime(
        0.08,
        audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + duration
    );

    oscillator.connect(gain);

    gain.connect(audioContext.destination);

    oscillator.start();

    oscillator.stop(
        audioContext.currentTime + duration
    );
}


// -----------------------------
// START GAME
// -----------------------------

function startGame() {

    initAudio();

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    startScreen.classList.add("hidden");

    gameOverScreen.classList.add("hidden");

    score = 0;

    coinsCollected = 0;

    lives = 3;

    level = 1;

    gameSpeed = 4;

    coinTimer = 0;

    obstacleTimer = 0;

    powerTimer = 0;

    shieldActive = false;

    boostActive = false;

    shieldTime = 0;

    boostTime = 0;

    particles = [];

    coins = [];

    obstacles = [];

    powerUps = [];

    player.x =
        canvas.width / 2 -
        player.width / 2;

    player.y =
        canvas.height - 120;

    updateUI();

    hidePowerStatuses();

    gameRunning = true;

    cancelAnimationFrame(animationId);

    animationId =
        requestAnimationFrame(gameLoop);
}


// -----------------------------
// GAME OVER
// -----------------------------

function endGame() {

    gameRunning = false;

    player.movingLeft = false;

    player.movingRight = false;


    if (score > bestScore) {

        bestScore = score;

        localStorage.setItem(
            "coinRushBest",
            bestScore
        );
    }


    finalScore.textContent = score;

    finalCoins.textContent =
        coinsCollected;

    finalBest.textContent =
        bestScore;

    bestDisplay.textContent =
        bestScore;


    gameOverScreen.classList.remove("hidden");

    playSound(120, 0.4, "sawtooth");
}


// -----------------------------
// UI
// -----------------------------

function updateUI() {

    scoreDisplay.textContent =
        score;

    coinDisplay.textContent =
        coinsCollected;

    bestDisplay.textContent =
        bestScore;

    livesDisplay.textContent =
        lives;

    levelDisplay.textContent =
        level;
}


// -----------------------------
// PLAYER DRAW
// -----------------------------

function drawPlayer() {

    ctx.save();


    // Shield

    if (shieldActive) {

        ctx.beginPath();

        ctx.arc(
            player.x + player.width / 2,
            player.y + player.height / 2,
            45,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            "rgba(56, 189, 248, 0.9)";

        ctx.lineWidth = 4;

        ctx.shadowBlur = 20;

        ctx.shadowColor =
            "#38bdf8";

        ctx.stroke();
    }


    // Body

    ctx.fillStyle = "#3b82f6";

    ctx.fillRect(
        player.x,
        player.y,
        player.width,
        player.height
    );


    // Shirt detail

    ctx.fillStyle = "#1d4ed8";

    ctx.fillRect(
        player.x + 8,
        player.y + 8,
        player.width - 16,
        10
    );


    // Head

    ctx.fillStyle = "#f5cfa0";

    ctx.beginPath();

    ctx.arc(
        player.x + player.width / 2,
        player.y - 5,
        20,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Hair

    ctx.fillStyle = "#3f2d20";

    ctx.beginPath();

    ctx.arc(
        player.x + player.width / 2,
        player.y - 15,
        18,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();


    // Eyes

    ctx.fillStyle = "#111827";

    ctx.beginPath();

    ctx.arc(
        player.x + 17,
        player.y - 8,
        3,
        0,
        Math.PI * 2
    );

    ctx.arc(
        player.x + 28,
        player.y - 8,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Boost flame

    if (boostActive) {

        ctx.fillStyle = "#f97316";

        ctx.beginPath();

        ctx.moveTo(
            player.x + 10,
            player.y + player.height
        );

        ctx.lineTo(
            player.x + 18,
            player.y + player.height + 25
        );

        ctx.lineTo(
            player.x + 23,
            player.y + player.height
        );

        ctx.fill();


        ctx.fillStyle = "#facc15";

        ctx.beginPath();

        ctx.moveTo(
            player.x + 24,
            player.y + player.height
        );

        ctx.lineTo(
            player.x + 30,
            player.y + player.height + 18
        );

        ctx.lineTo(
            player.x + 35,
            player.y + player.height
        );

        ctx.fill();
    }


    ctx.restore();
}


// -----------------------------
// CREATE COIN
// -----------------------------

function createCoin() {

    const radius = 13;

    coins.push({

        x:
            Math.random() *
            (canvas.width - radius * 2) +
            radius,

        y: -30,

        radius: radius,

        speed:
            gameSpeed + 1,

        rotation: 0
    });
}


// -----------------------------
// DRAW COINS
// -----------------------------

function drawCoins() {

    coins.forEach(coin => {

        ctx.save();

        coin.rotation += 0.12;

        const scale =
            Math.abs(
                Math.cos(coin.rotation)
            );

        ctx.translate(
            coin.x,
            coin.y
        );

        ctx.scale(
            Math.max(scale, 0.15),
            1
        );


        ctx.fillStyle = "#facc15";

        ctx.shadowBlur = 12;

        ctx.shadowColor = "#facc15";

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            coin.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.shadowBlur = 0;

        ctx.fillStyle = "#92400e";

        ctx.font =
            "bold 14px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(
            "$",
            0,
            0
        );


        ctx.restore();
    });
}


// -----------------------------
// CREATE OBSTACLE
// -----------------------------

function createObstacle() {

    const width =
        35 + Math.random() * 35;

    const height =
        35 + Math.random() * 35;

    obstacles.push({

        x:
            Math.random() *
            (canvas.width - width),

        y:
            -height,

        width:
            width,

        height:
            height,

        speed:
            gameSpeed +
            Math.random() * 1.5,

        rotation:
            Math.random() * Math.PI
    });
}


// -----------------------------
// DRAW OBSTACLES
// -----------------------------

function drawObstacles() {

    obstacles.forEach(obstacle => {

        ctx.save();

        const centerX =
            obstacle.x +
            obstacle.width / 2;

        const centerY =
            obstacle.y +
            obstacle.height / 2;

        ctx.translate(
            centerX,
            centerY
        );

        ctx.rotate(
            obstacle.rotation
        );

        ctx.fillStyle =
            "#ef4444";

        ctx.shadowBlur = 8;

        ctx.shadowColor =
            "#ef4444";

        ctx.fillRect(
            -obstacle.width / 2,
            -obstacle.height / 2,
            obstacle.width,
            obstacle.height
        );

        ctx.shadowBlur = 0;

        ctx.fillStyle =
            "#7f1d1d";

        ctx.fillRect(
            -obstacle.width / 2 + 8,
            -obstacle.height / 2 + 8,
            obstacle.width - 16,
            obstacle.height - 16
        );

        ctx.restore();
    });
}


// -----------------------------
// CREATE POWER-UP
// -----------------------------

function createPowerUp() {

    const types =
        ["shield", "boost"];

    const type =
        types[
            Math.floor(
                Math.random() *
                types.length
            )
        ];


    powerUps.push({

        x:
            Math.random() *
            (canvas.width - 40) +
            20,

        y: -40,

        radius: 17,

        type: type,

        speed:
            gameSpeed + 0.5,

        rotation: 0
    });
}


// -----------------------------
// DRAW POWER-UPS
// -----------------------------

function drawPowerUps() {

    powerUps.forEach(power => {

        ctx.save();

        power.rotation += 0.06;

        ctx.translate(
            power.x,
            power.y
        );

        ctx.rotate(
            power.rotation
        );


        if (power.type === "shield") {

            ctx.fillStyle =
                "#38bdf8";

            ctx.shadowBlur = 15;

            ctx.shadowColor =
                "#38bdf8";

            ctx.beginPath();

            ctx.moveTo(0, -18);

            ctx.lineTo(15, -10);

            ctx.lineTo(11, 10);

            ctx.lineTo(0, 18);

            ctx.lineTo(-11, 10);

            ctx.lineTo(-15, -10);

            ctx.closePath();

            ctx.fill();

            ctx.shadowBlur = 0;

            ctx.fillStyle = "white";

            ctx.font =
                "bold 18px Arial";

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";

            ctx.fillText(
                "S",
                0,
                1
            );

        } else {

            ctx.fillStyle =
                "#f97316";

            ctx.shadowBlur = 15;

            ctx.shadowColor =
                "#f97316";

            ctx.beginPath();

            ctx.arc(
                0,
                0,
                17,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.shadowBlur = 0;

            ctx.fillStyle =
                "white";

            ctx.font =
                "bold 18px Arial";

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";

            ctx.fillText(
                "⚡",
                0,
                1
            );
        }

        ctx.restore();
    });
}


// -----------------------------
// COLLISION
// -----------------------------

function isColliding(a, b) {

    return (

        a.x <
        b.x + b.width &&

        a.x + a.width >
        b.x &&

        a.y <
        b.y + b.height &&

        a.y + a.height >
        b.y
    );
}


// -----------------------------
// COIN COLLECTION
// -----------------------------

function collectCoins() {

    for (
        let i = coins.length - 1;
        i >= 0;
        i--
    ) {

        const coin =
            coins[i];


        const distanceX =
            player.x +
            player.width / 2 -
            coin.x;

        const distanceY =
            player.y +
            player.height / 2 -
            coin.y;

        const distance =
            Math.sqrt(
                distanceX * distanceX +
                distanceY * distanceY
            );


        if (
            distance <
            coin.radius +
            player.width / 2
        ) {

            coins.splice(i, 1);

            coinsCollected++;

            score += 10;

            createParticles(
                coin.x,
                coin.y,
                12
            );

            playSound(
                700,
                0.08,
                "square"
            );

            updateUI();
        }
    }
}


// -----------------------------
// POWER-UP COLLECTION
// -----------------------------

function collectPowerUps() {

    for (
        let i = powerUps.length - 1;
        i >= 0;
        i--
    ) {

        const power =
            powerUps[i];


        const dx =
            player.x +
            player.width / 2 -
            power.x;

        const dy =
            player.y +
            player.height / 2 -
            power.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance <
            power.radius +
            player.width / 2
        ) {

            powerUps.splice(i, 1);


            if (power.type === "shield") {

                shieldActive = true;

                shieldTime = 600;

                showPowerMessage(
                    "🛡️ SHIELD ACTIVATED!"
                );

                playSound(
                    500,
                    0.2,
                    "sine"
                );

            } else {

                boostActive = true;

                boostTime = 480;

                showPowerMessage(
                    "⚡ SPEED BOOST!"
                );

                playSound(
                    900,
                    0.2,
                    "square"
                );
            }

            updatePowerStatus();
        }
    }
}


// -----------------------------
// OBSTACLE COLLISION
// -----------------------------

function checkObstacleCollision() {

    for (
        let i = obstacles.length - 1;
        i >= 0;
        i--
    ) {

        const obstacle =
            obstacles[i];


        if (
            isColliding(
                player,
                obstacle
            )
        ) {

            obstacles.splice(i, 1);


            if (shieldActive) {

                shieldActive = false;

                shieldTime = 0;

                createParticles(
                    player.x +
                    player.width / 2,

                    player.y +
                    player.height / 2,

                    25
                );

                showPowerMessage(
                    "🛡️ SHIELD SAVED YOU!"
                );

                playSound(
                    350,
                    0.15,
                    "square"
                );

                updatePowerStatus();

                return;
            }


            lives--;

            createParticles(
                player.x +
                player.width / 2,

                player.y +
                player.height / 2,

                20
            );

            playSound(
                150,
                0.2,
                "sawtooth"
            );

            updateUI();


            if (lives <= 0) {

                endGame();

                return;
            }


            // Push player away after hit

            player.x +=
                player.x <
                canvas.width / 2
                    ? 40
                    : -40;

            player.x =
                Math.max(
                    0,
                    Math.min(
                        canvas.width -
                        player.width,

                        player.x
                    )
                );

            return;
        }
    }
}


// -----------------------------
// UPDATE PLAYER
// -----------------------------

function updatePlayer() {

    let currentSpeed =
        player.speed;

    if (boostActive) {

        currentSpeed *= 1.8;
    }


    if (player.movingLeft) {

        player.x -=
            currentSpeed;
    }


    if (player.movingRight) {

        player.x +=
            currentSpeed;
    }


    if (player.x < 0) {

        player.x = 0;
    }


    if (
        player.x +
        player.width >
        canvas.width
    ) {

        player.x =
            canvas.width -
            player.width;
    }
}


// -----------------------------
// UPDATE COINS
// -----------------------------

function updateCoins() {

    coins.forEach(coin => {

        coin.y +=
            coin.speed;
    });


    coins =
        coins.filter(
            coin =>
                coin.y <
                canvas.height + 50
        );
}


// -----------------------------
// UPDATE OBSTACLES
// -----------------------------

function updateObstacles() {

    obstacles.forEach(obstacle => {

        obstacle.y +=
            obstacle.speed;

        obstacle.rotation +=
            0.015;
    });


    obstacles =
        obstacles.filter(
            obstacle =>
                obstacle.y <
                canvas.height + 100
        );
}


// -----------------------------
// UPDATE POWER-UPS
// -----------------------------

function updatePowerUps() {

    powerUps.forEach(power => {

        power.y +=
            power.speed;
    });


    powerUps =
        powerUps.filter(
            power =>
                power.y <
                canvas.height + 60
        );
}


// -----------------------------
// POWER TIMERS
// -----------------------------

function updatePowerTimers() {

    if (shieldActive) {

        shieldTime--;

        if (shieldTime <= 0) {

            shieldActive = false;

            showPowerMessage(
                "🛡️ SHIELD ENDED"
            );
        }
    }


    if (boostActive) {

        boostTime--;

        if (boostTime <= 0) {

            boostActive = false;

            showPowerMessage(
                "⚡ BOOST ENDED"
            );
        }
    }


    updatePowerStatus();
}


// -----------------------------
// POWER STATUS UI
// -----------------------------

function updatePowerStatus() {

    shieldStatus.classList.toggle(
        "hidden",
        !shieldActive
    );

    boostStatus.classList.toggle(
        "hidden",
        !boostActive
    );
}


function hidePowerStatuses() {

    shieldStatus.classList.add(
        "hidden"
    );

    boostStatus.classList.add(
        "hidden"
    );
}


// -----------------------------
// POWER MESSAGE
// -----------------------------

let powerMessageTimer = null;


function showPowerMessage(message) {

    powerMessage.textContent =
        message;

    powerMessage.classList.add(
        "show"
    );


    clearTimeout(
        powerMessageTimer
    );


    powerMessageTimer =
        setTimeout(() => {

            powerMessage.classList.remove(
                "show"
            );

        }, 1200);
}


// -----------------------------
// PARTICLES
// -----------------------------

function createParticles(
    x,
    y,
    amount
) {

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        particles.push({

            x: x,

            y: y,

            vx:
                (Math.random() - 0.5) *
                6,

            vy:
                (Math.random() - 0.5) *
                6,

            life: 30 +
                Math.random() * 20,

            size:
                2 +
                Math.random() * 4
        });
    }
}


function updateParticles() {

    particles.forEach(particle => {

        particle.x +=
            particle.vx;

        particle.y +=
            particle.vy;

        particle.vy +=
            0.08;

        particle.life--;
    });


    particles =
        particles.filter(
            particle =>
                particle.life > 0
        );
}


function drawParticles() {

    particles.forEach(particle => {

        ctx.globalAlpha =
            particle.life / 50;

        ctx.fillStyle =
            "#facc15";

        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    });


    ctx.globalAlpha = 1;
}


// -----------------------------
// BACKGROUND
// -----------------------------

function drawBackground() {

    ctx.fillStyle =
        "#374151";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Road movement

    roadOffset +=
        gameSpeed;

    if (roadOffset > 50) {

        roadOffset = 0;
    }


    // Center road lines

    ctx.fillStyle =
        "#9ca3af";


    for (
        let y =
            -50 + roadOffset;

        y <
        canvas.height;

        y += 100
    ) {

        ctx.fillRect(

            canvas.width / 2 - 5,

            y,

            10,

            50
        );
    }


    // Side lines

    ctx.fillStyle =
        "#facc15";


    ctx.fillRect(
        10,
        0,
        5,
        canvas.height
    );


    ctx.fillRect(
        canvas.width - 15,
        0,
        5,
        canvas.height
    );
}


// -----------------------------
// SCORE + LEVEL
// -----------------------------

function updateScore() {

    score++;

    scoreDisplay.textContent =
        score;


    const newLevel =
        Math.floor(score / 500) + 1;


    if (
        newLevel !== level
    ) {

        level =
            newLevel;

        gameSpeed =
            4 +
            (level - 1) *
            0.5;

        showPowerMessage(
            "🔥 LEVEL " +
            level
        );

        playSound(
            600,
            0.2,
            "triangle"
        );

        updateUI();
    }
}


// -----------------------------
// GAME LOOP
// -----------------------------

function gameLoop() {

    if (!gameRunning) {

        return;
    }


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Background

    drawBackground();


    // Player

    updatePlayer();

    drawPlayer();


    // Coins

    coinTimer++;


    const coinSpawnRate =
        Math.max(
            28,
            60 -
            level * 2
        );


    if (
        coinTimer >
        coinSpawnRate
    ) {

        createCoin();

        coinTimer = 0;
    }


    updateCoins();

    drawCoins();

    collectCoins();


    // Obstacles

    obstacleTimer++;


    const obstacleSpawnRate =
        Math.max(
            45,
            90 -
            level * 3
        );


    if (
        obstacleTimer >
        obstacleSpawnRate
    ) {

        createObstacle();

        obstacleTimer = 0;
    }


    updateObstacles();

    drawObstacles();

    checkObstacleCollision();


    // Power-ups

    powerTimer++;


    if (
        powerTimer >
        700
    ) {

        createPowerUp();

        powerTimer = 0;
    }


    updatePowerUps();

    drawPowerUps();

    collectPowerUps();


    // Particles

    updateParticles();

    drawParticles();


    // Timers

    updatePowerTimers();


    // Score

    updateScore();


    animationId =
        requestAnimationFrame(
            gameLoop
        );
}


// -----------------------------
// KEYBOARD CONTROLS
// -----------------------------

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "ArrowLeft" ||
            event.key.toLowerCase() === "a"
        ) {

            event.preventDefault();

            player.movingLeft =
                true;
        }


        if (
            event.key === "ArrowRight" ||
            event.key.toLowerCase() === "d"
        ) {

            event.preventDefault();

            player.movingRight =
                true;
        }
    }
);


document.addEventListener(
    "keyup",
    function(event) {

        if (
            event.key === "ArrowLeft" ||
            event.key.toLowerCase() === "a"
        ) {

            player.movingLeft =
                false;
        }


        if (
            event.key === "ArrowRight" ||
            event.key.toLowerCase() === "d"
        ) {

            player.movingRight =
                false;
        }
    }
);


// -----------------------------
// MOBILE CONTROLS
// -----------------------------

function startMovingLeft(event) {

    event.preventDefault();

    player.movingLeft = true;
}


function stopMovingLeft(event) {

    event.preventDefault();

    player.movingLeft = false;
}


function startMovingRight(event) {

    event.preventDefault();

    player.movingRight = true;
}


function stopMovingRight(event) {

    event.preventDefault();

    player.movingRight = false;
}


leftButton.addEventListener(
    "pointerdown",
    startMovingLeft
);

leftButton.addEventListener(
    "pointerup",
    stopMovingLeft
);

leftButton.addEventListener(
    "pointercancel",
    stopMovingLeft
);

leftButton.addEventListener(
    "pointerleave",
    stopMovingLeft
);


rightButton.addEventListener(
    "pointerdown",
    startMovingRight
);

rightButton.addEventListener(
    "pointerup",
    stopMovingRight
);

rightButton.addEventListener(
    "pointercancel",
    stopMovingRight
);

rightButton.addEventListener(
    "pointerleave",
    stopMovingRight
);


// -----------------------------
// BUTTONS
// -----------------------------

startButton.addEventListener(
    "click",
    startGame
);


restartButton.addEventListener(
    "click",
    startGame
);


// -----------------------------
// INITIALIZE
// -----------------------------

resizeCanvas();

updateUI();