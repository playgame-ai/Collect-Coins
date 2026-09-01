"use strict";


/* =========================================================
   COIN RUSH - VERSION 5
   Original Canvas Game
   No external libraries
   No external images
   No external music
========================================================= */


/* =========================================================
   CANVAS
========================================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let canvasWidth = 0;
let canvasHeight = 0;
let deviceScale = 1;


/* =========================================================
   UI ELEMENTS
========================================================= */

const scoreElement = document.getElementById("score");
const coinsElement = document.getElementById("coins");
const bestElement = document.getElementById("best");

const pauseBtn = document.getElementById("pauseBtn");

const startScreen = document.getElementById("startScreen");
const pauseScreen = document.getElementById("pauseScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const shopScreen = document.getElementById("shopScreen");

const startBtn = document.getElementById("startBtn");
const resumeBtn = document.getElementById("resumeBtn");
const restartBtn = document.getElementById("restartBtn");

const shopBtnStart = document.getElementById("shopBtnStart");
const pauseShopBtn = document.getElementById("pauseShopBtn");
const gameOverShopBtn = document.getElementById("gameOverShopBtn");

const closeShopBtn = document.getElementById("closeShopBtn");

const finalScore = document.getElementById("finalScore");
const finalCoins = document.getElementById("finalCoins");
const finalBest = document.getElementById("finalBest");
const finalCombo = document.getElementById("finalCombo");

const shopCoins = document.getElementById("shopCoins");

const heartsElement = document.getElementById("hearts");

const boostBtn = document.getElementById("boostBtn");
const shieldBtn = document.getElementById("shieldBtn");
const magnetBtn = document.getElementById("magnetBtn");

const boostBar = document.getElementById("boostBar");
const shieldBar = document.getElementById("shieldBar");
const magnetBar = document.getElementById("magnetBar");

const buyBoostUpgrade =
    document.getElementById("buyBoostUpgrade");

const buyMagnetUpgrade =
    document.getElementById("buyMagnetUpgrade");

const buyCoinUpgrade =
    document.getElementById("buyCoinUpgrade");

const boostUpgradeLevel =
    document.getElementById("boostUpgradeLevel");

const magnetUpgradeLevel =
    document.getElementById("magnetUpgradeLevel");

const coinUpgradeLevel =
    document.getElementById("coinUpgradeLevel");

const achievementList =
    document.getElementById("achievementList");


/* =========================================================
   SAVED DATA
========================================================= */

let totalCoins =
    Number(
        localStorage.getItem("coinRushCoinsV5") || 0
    );

let bestScore =
    Number(
        localStorage.getItem("coinRushBestV5") || 0
    );

let selectedSkin =
    localStorage.getItem(
        "coinRushSkinV5"
    ) || "blue";

let ownedSkins =
    JSON.parse(
        localStorage.getItem(
            "coinRushSkinsV5"
        ) || '["blue"]'
    );

let boostUpgrade =
    Number(
        localStorage.getItem(
            "coinRushBoostUpgradeV5"
        ) || 0
    );

let magnetUpgrade =
    Number(
        localStorage.getItem(
            "coinRushMagnetUpgradeV5"
        ) || 0
    );

let coinUpgrade =
    Number(
        localStorage.getItem(
            "coinRushCoinUpgradeV5"
        ) || 0
    );

let achievementData =
    JSON.parse(
        localStorage.getItem(
            "coinRushAchievementsV5"
        ) || "{}"
    );


/* =========================================================
   GAME STATE
========================================================= */

let gameRunning = false;
let gamePaused = false;

let score = 0;
let runCoins = 0;

let lives = 3;

let combo = 0;
let bestCombo = 0;
let comboTimer = 0;

let gameTime = 0;

let spawnTimer = 0;
let obstacleTimer = 0;

let lastTime = 0;


/* =========================================================
   POWER SETTINGS
========================================================= */

const MAX_POWER = 100;

let boostEnergy = 100;
let shieldEnergy = 100;
let magnetEnergy = 100;

let boostActive = false;
let magnetActive = false;


/* =========================================================
   POWER TIMERS
========================================================= */

let boostTimer = 0;
let shieldTimer = 0;
let magnetTimer = 0;


/* =========================================================
   MAGNET SETTINGS
========================================================= */

const BASE_MAGNET_DURATION = 5;

const MAGNET_DURATION_UPGRADE = 1;

const BASE_MAGNET_RADIUS = 150;

const MAGNET_RADIUS_UPGRADE = 35;


function getMagnetDuration() {

    return (
        BASE_MAGNET_DURATION +
        magnetUpgrade *
        MAGNET_DURATION_UPGRADE
    );
}


function getMagnetRadius() {

    return (
        BASE_MAGNET_RADIUS +
        magnetUpgrade *
        MAGNET_RADIUS_UPGRADE
    );
}


/* =========================================================
   PLAYER
========================================================= */

const player = {

    width: 38,

    height: 50,

    x: 0,

    y: 0,

    targetX: 0,

    targetY: 0,

    moveSpeed: 330,

    followSpeed: 12,

    invincibleTimer: 0

};


/* =========================================================
   KEYBOARD
========================================================= */

const keys = {

    left: false,

    right: false,

    forward: false,

    backward: false

};


/* =========================================================
   GAME OBJECTS
========================================================= */

let coins = [];

let obstacles = [];

let particles = [];

let stars = [];


/* =========================================================
   SKINS
========================================================= */

const skins = {

    blue: {
        main: "#38bdf8",
        dark: "#1d4ed8",
        light: "#bae6fd"
    },

    green: {
        main: "#4ade80",
        dark: "#15803d",
        light: "#bbf7d0"
    },

    orange: {
        main: "#fb923c",
        dark: "#ea580c",
        light: "#fed7aa"
    },

    purple: {
        main: "#c084fc",
        dark: "#7e22ce",
        light: "#e9d5ff"
    }

};


/* =========================================================
   ACHIEVEMENTS
========================================================= */

const achievements = [

    {
        id: "firstCoin",
        title: "First Coin",
        description: "Collect your first coin.",
        icon: "🪙"
    },

    {
        id: "coins100",
        title: "Coin Collector",
        description: "Collect 100 coins.",
        icon: "💰"
    },

    {
        id: "score1000",
        title: "Rising Star",
        description: "Reach 1,000 score.",
        icon: "⭐"
    },

    {
        id: "combo10",
        title: "Combo Master",
        description: "Reach a 10x combo.",
        icon: "🔥"
    },

    {
        id: "magnet",
        title: "Magnetic",
        description: "Use the coin magnet.",
        icon: "🧲"
    },

    {
        id: "survivor",
        title: "Survivor",
        description: "Survive for 60 seconds.",
        icon: "🏆"
    }

];


/* =========================================================
   AUDIO
========================================================= */

let audioContext = null;


function initAudio() {

    if (!audioContext) {

        try {

            audioContext =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();

        } catch (error) {

            audioContext = null;

        }

    }

}


function playSound(
    frequency = 440,
    duration = 0.08,
    type = "sine",
    volume = 0.04
) {

    if (!audioContext) return;

    try {

        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();

        oscillator.type = type;

        oscillator.frequency.value =
            frequency;

        gain.gain.value = volume;

        oscillator.connect(gain);

        gain.connect(audioContext.destination);

        oscillator.start();

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + duration
        );

        oscillator.stop(
            audioContext.currentTime + duration
        );

    } catch (error) {

        // Audio is optional.

    }

}


/* =========================================================
   HELPERS
========================================================= */

function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );

}


function random(min, max) {

    return (
        Math.random() *
        (max - min) +
        min
    );

}


function distance(
    x1,
    y1,
    x2,
    y2
) {

    return Math.hypot(
        x2 - x1,
        y2 - y1
    );

}


/* =========================================================
   ROAD
========================================================= */

function getRoadWidth() {

    return Math.min(
        canvasWidth * 0.82,
        620
    );

}


function getRoadHeight() {

    return canvasHeight * 0.92;

}


function getRoadLeft() {

    return (
        canvasWidth / 2 -
        getRoadWidth() / 2
    );

}


function getRoadRight() {

    return (
        canvasWidth / 2 +
        getRoadWidth() / 2
    );

}


function getRoadTop() {

    return (
        canvasHeight -
        getRoadHeight()
    ) / 2;

}


function getRoadBottom() {

    return (
        canvasHeight +
        getRoadHeight()
    ) / 2;

}


/* =========================================================
   RESIZE
========================================================= */

function resizeCanvas() {

    const rect =
        canvas.getBoundingClientRect();

    canvasWidth = rect.width;

    canvasHeight = rect.height;

    deviceScale =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    canvas.width =
        Math.floor(
            canvasWidth *
            deviceScale
        );

    canvas.height =
        Math.floor(
            canvasHeight *
            deviceScale
        );

    ctx.setTransform(
        deviceScale,
        0,
        0,
        deviceScale,
        0,
        0
    );

    if (player.x === 0 && player.y === 0) {

        resetPlayerPosition();

    }

}


window.addEventListener(
    "resize",
    resizeCanvas
);


/* =========================================================
   PLAYER POSITION
========================================================= */

function resetPlayerPosition() {

    player.x =
        canvasWidth / 2 -
        player.width / 2;

    player.y =
        canvasHeight / 2 -
        player.height / 2;

    player.targetX = player.x;

    player.targetY = player.y;

}


/* =========================================================
   RESET GAME
========================================================= */

function resetGame() {

    score = 0;

    runCoins = 0;

    lives = 3;

    combo = 0;

    bestCombo = 0;

    comboTimer = 0;

    gameTime = 0;

    spawnTimer = 0;

    obstacleTimer = 0;

    boostEnergy = 100;

    shieldEnergy = 100;

    magnetEnergy = 100;

    boostActive = false;

    magnetActive = false;

    boostTimer = 0;

    shieldTimer = 0;

    magnetTimer = 0;

    coins = [];

    obstacles = [];

    particles = [];

    createStars();

    resetPlayerPosition();

    updateUI();

}


/* =========================================================
   START GAME
========================================================= */

function startGame() {

    initAudio();

    if (
        audioContext &&
        audioContext.state === "suspended"
    ) {

        audioContext.resume();

    }

    resetGame();

    gameRunning = true;

    gamePaused = false;

    startScreen.classList.add("hidden");

    pauseScreen.classList.add("hidden");

    gameOverScreen.classList.add("hidden");

    shopScreen.classList.add("hidden");

    playSound(
        500,
        0.12,
        "square",
        0.05
    );

    lastTime = performance.now();

}


/* =========================================================
   PAUSE
========================================================= */

function togglePause() {

    if (!gameRunning) return;

    gamePaused = !gamePaused;

    if (gamePaused) {

        pauseScreen.classList.remove(
            "hidden"
        );

    } else {

        pauseScreen.classList.add(
            "hidden"
        );

        lastTime = performance.now();

    }

}


/* =========================================================
   GAME OVER
========================================================= */

function endGame() {

    gameRunning = false;

    gamePaused = false;

    boostActive = false;

    magnetActive = false;

    if (score > bestScore) {

        bestScore = Math.floor(score);

        localStorage.setItem(
            "coinRushBestV5",
            bestScore
        );

    }

    finalScore.textContent =
        Math.floor(score);

    finalCoins.textContent =
        runCoins;

    finalBest.textContent =
        bestScore;

    finalCombo.textContent =
        bestCombo;

    gameOverScreen.classList.remove(
        "hidden"
    );

    updateUI();

    playSound(
        120,
        0.4,
        "sawtooth",
        0.06
    );

}


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

function updatePlayer(dt) {

    let horizontal = 0;

    let vertical = 0;


    if (keys.left) {

        horizontal -= 1;

    }


    if (keys.right) {

        horizontal += 1;

    }


    if (keys.forward) {

        vertical -= 1;

    }


    if (keys.backward) {

        vertical += 1;

    }


    if (
        horizontal !== 0 ||
        vertical !== 0
    ) {

        const length =
            Math.hypot(
                horizontal,
                vertical
            );

        horizontal /= length;

        vertical /= length;


        const movementSpeed =
            player.moveSpeed *
            (
                boostActive
                    ? 1.45
                    : 1
            );


        player.targetX +=
            horizontal *
            movementSpeed *
            dt;


        player.targetY +=
            vertical *
            movementSpeed *
            dt;

    }


    player.targetX =
        clamp(
            player.targetX,

            getRoadLeft() + 10,

            getRoadRight() -
            player.width -
            10
        );


    player.targetY =
        clamp(
            player.targetY,

            getRoadTop() + 10,

            getRoadBottom() -
            player.height -
            10
        );


    const smoothing =
        1 -
        Math.exp(
            -player.followSpeed * dt
        );


    player.x +=
        (
            player.targetX -
            player.x
        ) *
        smoothing;


    player.y +=
        (
            player.targetY -
            player.y
        ) *
        smoothing;

}


/* =========================================================
   COINS
========================================================= */

function spawnCoin() {

    const margin = 25;

    coins.push({

        x: random(
            getRoadLeft() + margin,
            getRoadRight() - margin
        ),

        y: random(
            getRoadTop() + margin,
            getRoadBottom() - margin
        ),

        radius: 9,

        rotation: random(
            0,
            Math.PI * 2
        ),

        pulse: random(
            0,
            Math.PI * 2
        )

    });

}


function updateCoins(dt) {

    const px =
        player.x +
        player.width / 2;

    const py =
        player.y +
        player.height / 2;


    for (
        let i = coins.length - 1;
        i >= 0;
        i--
    ) {

        const coin = coins[i];


        coin.rotation +=
            dt * 4;

        coin.pulse +=
            dt * 5;


        /* MAGNET */

        if (magnetActive) {

            const dx =
                px - coin.x;

            const dy =
                py - coin.y;

            const dist =
                Math.hypot(
                    dx,
                    dy
                );

            const radius =
                getMagnetRadius();


            if (
                dist > 0.01 &&
                dist < radius
            ) {

                const strength =
                    650 +
                    (
                        1 -
                        dist / radius
                    ) *
                    900;


                coin.x +=
                    (
                        dx / dist
                    ) *
                    strength *
                    dt;


                coin.y +=
                    (
                        dy / dist
                    ) *
                    strength *
                    dt;

            }

        }


        /* COLLECT COIN */

        const hitDistance =
            distance(
                px,
                py,
                coin.x,
                coin.y
            );


        if (
            hitDistance <
            coin.radius + 22
        ) {

            collectCoin(i);

        }

    }

}


function collectCoin(index) {

    const coin =
        coins[index];

    coins.splice(index, 1);


    runCoins +=
        1 +
        coinUpgrade;


    totalCoins +=
        1 +
        coinUpgrade;


    combo += 1;

    comboTimer = 2.5;


    if (combo > bestCombo) {

        bestCombo = combo;

    }


    const multiplier =
        Math.min(
            combo,
            10
        );


    score +=
        10 *
        multiplier;


    createBurst(
        coin.x,
        coin.y,
        "#facc15",
        10
    );


    playSound(
        700 + combo * 25,
        0.06,
        "sine",
        0.035
    );


    checkAchievements();


    saveProgress();

    updateUI();

}


/* =========================================================
   OBSTACLES
========================================================= */

function spawnObstacle() {

    const size =
        random(
            28,
            45
        );


    const obstacle = {

        x: random(
            getRoadLeft() + size,
            getRoadRight() - size
        ),

        y: random(
            getRoadTop() + size,
            getRoadBottom() - size
        ),

        width: size,

        height: size,

        vx: random(
            -45,
            45
        ),

        vy: random(
            -45,
            45
        ),

        rotation: random(
            0,
            Math.PI * 2
        ),

        rotationSpeed: random(
            -1,
            1
        )

    };


    obstacles.push(
        obstacle
    );

}


function updateObstacles(dt) {

    for (
        const obstacle of obstacles
    ) {

        obstacle.x +=
            obstacle.vx *
            dt;

        obstacle.y +=
            obstacle.vy *
            dt;

        obstacle.rotation +=
            obstacle.rotationSpeed *
            dt;


        const left =
            getRoadLeft();

        const right =
            getRoadRight();

        const top =
            getRoadTop();

        const bottom =
            getRoadBottom();


        if (
            obstacle.x <
            left
        ) {

            obstacle.x =
                left;

            obstacle.vx =
                Math.abs(
                    obstacle.vx
                );

        }


        if (
            obstacle.x +
            obstacle.width >
            right
        ) {

            obstacle.x =
                right -
                obstacle.width;

            obstacle.vx =
                -Math.abs(
                    obstacle.vx
                );

        }


        if (
            obstacle.y <
            top
        ) {

            obstacle.y =
                top;

            obstacle.vy =
                Math.abs(
                    obstacle.vy
                );

        }


        if (
            obstacle.y +
            obstacle.height >
            bottom
        ) {

            obstacle.y =
                bottom -
                obstacle.height;

            obstacle.vy =
                -Math.abs(
                    obstacle.vy
                );

        }

    }


    checkObstacleCollision();

}


/* =========================================================
   COLLISION
========================================================= */

function checkObstacleCollision() {

    if (
        player.invincibleTimer >
        0
    ) {

        return;

    }


    const px =
        player.x +
        player.width / 2;

    const py =
        player.y +
        player.height / 2;


    for (
        const obstacle of obstacles
    ) {

        const ox =
            obstacle.x +
            obstacle.width / 2;

        const oy =
            obstacle.y +
            obstacle.height / 2;


        const dist =
            distance(
                px,
                py,
                ox,
                oy
            );


        if (
            dist <
            30 +
            obstacle.width / 2
        ) {

            if (
                shieldTimer > 0
            ) {

                createBurst(
                    ox,
                    oy,
                    "#60a5fa",
                    15
                );

                playSound(
                    900,
                    0.1,
                    "triangle",
                    0.04
                );

                obstacle.x +=
                    obstacle.vx *
                    0.2;

                obstacle.y +=
                    obstacle.vy *
                    0.2;

                return;

            }


            hitPlayer();

            return;

        }

    }

}


/* =========================================================
   PLAYER HIT
========================================================= */

function hitPlayer() {

    lives -= 1;

    player.invincibleTimer =
        2;

    combo = 0;

    comboTimer = 0;


    createBurst(
        player.x +
        player.width / 2,

        player.y +
        player.height / 2,

        "#ef4444",

        25
    );


    playSound(
        100,
        0.25,
        "sawtooth",
        0.07
    );


    updateUI();


    if (lives <= 0) {

        endGame();

    }

}


/* =========================================================
   PARTICLES
========================================================= */

function createBurst(
    x,
    y,
    color,
    count = 10
) {

    for (
        let i = 0;
        i < count;
        i++
    ) {

        if (particles.length >= 220) {

            particles.shift();

        }


        particles.push({

            x: x,

            y: y,

            vx: random(
                -150,
                150
            ),

            vy: random(
                -150,
                150
            ),

            life: random(
                0.3,
                0.8
            ),

            maxLife: random(
                0.3,
                0.8
            ),

            size: random(
                2,
                5
            ),

            color: color

        });

    }

}


function updateParticles(dt) {

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const particle =
            particles[i];


        particle.x +=
            particle.vx *
            dt;


        particle.y +=
            particle.vy *
            dt;


        particle.vx *=
            Math.pow(
                0.03,
                dt
            );


        particle.vy *=
            Math.pow(
                0.03,
                dt
            );


        particle.life -=
            dt;


        if (
            particle.life <= 0
        ) {

            particles.splice(
                i,
                1
            );

        }

    }

}


/* =========================================================
   STARS
========================================================= */

function createStars() {

    stars = [];

    const amount =
        Math.min(
            100,
            Math.floor(
                canvasWidth *
                canvasHeight /
                7000
            )
        );


    for (
        let i = 0;
        i < amount;
        i++
    ) {

        stars.push({

            x: random(
                0,
                canvasWidth
            ),

            y: random(
                0,
                canvasHeight
            ),

            size: random(
                1,
                2.5
            ),

            alpha: random(
                0.2,
                0.8
            )

        });

    }

}


/* =========================================================
   UPDATE GAME
========================================================= */

function update(dt) {

    gameTime += dt;


    if (
        player.invincibleTimer >
        0
    ) {

        player.invincibleTimer -=
            dt;

    }


    /* SCORE */

    score +=
        dt *
        10;


    /* PLAYER */

    updatePlayer(dt);


    /* COINS */

    spawnTimer -= dt;


    if (
        spawnTimer <= 0
    ) {

        spawnCoin();

        spawnTimer =
            Math.max(
                0.25,
                0.8 -
                gameTime * 0.002
            );

    }


    updateCoins(dt);


    /* OBSTACLES */

    obstacleTimer -= dt;


    if (
        obstacleTimer <= 0
    ) {

        spawnObstacle();

        obstacleTimer =
            Math.max(
                0.7,
                2.2 -
                gameTime * 0.015
            );

    }


    updateObstacles(dt);


    /* PARTICLES */

    updateParticles(dt);


    /* COMBO */

    if (comboTimer > 0) {

        comboTimer -= dt;

    } else {

        combo = 0;

    }


    /* BOOST */

    if (boostActive) {

        boostTimer -= dt;

        boostEnergy -=
            dt * 20;


        if (
            boostTimer <= 0 ||
            boostEnergy <= 0
        ) {

            boostActive = false;

        }

    } else {

        boostEnergy +=
            dt * 12;

    }


    /* SHIELD */

    if (shieldTimer > 0) {

        shieldTimer -= dt;

    } else {

        shieldEnergy +=
            dt * 8;

    }


    /* MAGNET */

    if (magnetActive) {

        magnetTimer -= dt;

        magnetEnergy -=
            dt *
            (
                100 /
                getMagnetDuration()
            );


        if (
            magnetTimer <= 0 ||
            magnetEnergy <= 0
        ) {

            magnetActive = false;

        }

    } else {

        magnetEnergy +=
            dt * 10;

    }


    boostEnergy =
        clamp(
            boostEnergy,
            0,
            MAX_POWER
        );


    shieldEnergy =
        clamp(
            shieldEnergy,
            0,
            MAX_POWER
        );


    magnetEnergy =
        clamp(
            magnetEnergy,
            0,
            MAX_POWER
        );


    if (
        gameTime >= 60
    ) {

        achievementData.survivor =
            true;

    }


    checkAchievements();

    updateUI();

}


/* =========================================================
   DRAW BACKGROUND
========================================================= */

function drawBackground() {

    ctx.clearRect(
        0,
        0,
        canvasWidth,
        canvasHeight
    );


    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvasHeight
        );


    gradient.addColorStop(
        0,
        "#020617"
    );

    gradient.addColorStop(
        1,
        "#111827"
    );


    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        canvasWidth,
        canvasHeight
    );


    /* STARS */

    for (
        const star of stars
    ) {

        ctx.globalAlpha =
            star.alpha;

        ctx.fillStyle =
            "#ffffff";

        ctx.beginPath();

        ctx.arc(
            star.x,
            star.y,
            star.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    ctx.globalAlpha = 1;


    /* ROAD */

    const roadLeft =
        getRoadLeft();

    const roadTop =
        getRoadTop();

    const roadWidth =
        getRoadWidth();

    const roadHeight =
        getRoadHeight();


    ctx.fillStyle =
        "#1e293b";

    ctx.fillRect(
        roadLeft,
        roadTop,
        roadWidth,
        roadHeight
    );


    /* ROAD BORDER */

    ctx.strokeStyle =
        "#475569";

    ctx.lineWidth = 3;

    ctx.strokeRect(
        roadLeft,
        roadTop,
        roadWidth,
        roadHeight
    );


    /* GRID */

    ctx.strokeStyle =
        "rgba(148,163,184,0.10)";

    ctx.lineWidth = 1;


    const gridSize = 45;


    for (
        let x = roadLeft;
        x <= roadLeft + roadWidth;
        x += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            roadTop
        );

        ctx.lineTo(
            x,
            roadTop + roadHeight
        );

        ctx.stroke();

    }


    for (
        let y = roadTop;
        y <= roadTop + roadHeight;
        y += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(
            roadLeft,
            y
        );

        ctx.lineTo(
            roadLeft + roadWidth,
            y
        );

        ctx.stroke();

    }


    /* ROAD EDGE */

    ctx.strokeStyle =
        "rgba(250,204,21,0.25)";

    ctx.lineWidth = 5;

    ctx.strokeRect(
        roadLeft + 5,
        roadTop + 5,
        roadWidth - 10,
        roadHeight - 10
    );

}


/* =========================================================
   DRAW COINS
========================================================= */

function drawCoins() {

    for (
        const coin of coins
    ) {

        const scale =
            1 +
            Math.sin(
                coin.pulse
            ) *
            0.08;


        ctx.save();

        ctx.translate(
            coin.x,
            coin.y
        );

        ctx.rotate(
            coin.rotation
        );

        ctx.scale(
            scale,
            scale
        );


        ctx.fillStyle =
            "#facc15";


        ctx.strokeStyle =
            "#a16207";


        ctx.lineWidth = 2;


        ctx.beginPath();

        ctx.arc(
            0,
            0,
            coin.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.stroke();


        ctx.fillStyle =
            "#fef08a";


        ctx.font =
            "bold 11px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";


        ctx.fillText(
            "$",
            0,
            1
        );


        ctx.restore();

    }

}


/* =========================================================
   DRAW OBSTACLES
========================================================= */

function drawObstacles() {

    for (
        const obstacle of obstacles
    ) {

        ctx.save();


        ctx.translate(
            obstacle.x +
            obstacle.width / 2,

            obstacle.y +
            obstacle.height / 2
        );


        ctx.rotate(
            obstacle.rotation
        );


        ctx.fillStyle =
            "#ef4444";


        ctx.strokeStyle =
            "#7f1d1d";


        ctx.lineWidth = 3;


        ctx.fillRect(
            -obstacle.width / 2,
            -obstacle.height / 2,
            obstacle.width,
            obstacle.height
        );


        ctx.strokeRect(
            -obstacle.width / 2,
            -obstacle.height / 2,
            obstacle.width,
            obstacle.height
        );


        ctx.fillStyle =
            "#fecaca";


        ctx.fillRect(
            -5,
            -obstacle.height / 2 + 7,
            10,
            obstacle.height - 14
        );


        ctx.restore();

    }

}


/* =========================================================
   DRAW MAGNET
========================================================= */

function drawMagnetEffect() {

    if (!magnetActive) return;


    const px =
        player.x +
        player.width / 2;

    const py =
        player.y +
        player.height / 2;


    const radius =
        getMagnetRadius();


    ctx.save();


    ctx.globalAlpha = 0.10;

    ctx.fillStyle =
        "#f472b6";

    ctx.beginPath();

    ctx.arc(
        px,
        py,
        radius,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.globalAlpha = 0.4;

    ctx.strokeStyle =
        "#f472b6";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.arc(
        px,
        py,
        radius,
        0,
        Math.PI * 2
    );

    ctx.stroke();


    ctx.globalAlpha = 0.7;

    ctx.strokeStyle =
        "#f9a8d4";

    ctx.lineWidth = 1;


    for (
        const coin of coins
    ) {

        const d =
            distance(
                px,
                py,
                coin.x,
                coin.y
            );


        if (d < radius) {

            ctx.beginPath();

            ctx.moveTo(
                coin.x,
                coin.y
            );

            ctx.lineTo(
                px,
                py
            );

            ctx.stroke();

        }

    }


    ctx.restore();

}


/* =========================================================
   DRAW PLAYER
========================================================= */

function drawPlayer() {

    if (
        player.invincibleTimer > 0 &&
        Math.floor(
            player.invincibleTimer * 10
        ) % 2 === 0
    ) {

        return;

    }


    const skin =
        skins[selectedSkin] ||
        skins.blue;


    const centerX =
        player.x +
        player.width / 2;

    const centerY =
        player.y +
        player.height / 2;


    /* SHIELD */

    if (
        shieldTimer > 0
    ) {

        ctx.save();

        ctx.globalAlpha = 0.25;

        ctx.fillStyle =
            "#60a5fa";

        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            38,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.globalAlpha = 0.8;

        ctx.strokeStyle =
            "#93c5fd";

        ctx.lineWidth = 2;

        ctx.stroke();


        ctx.restore();

    }


    /* CAR */

    ctx.save();


    ctx.translate(
        centerX,
        centerY
    );


    /* BODY */

    ctx.fillStyle =
        skin.main;

    ctx.strokeStyle =
        skin.dark;

    ctx.lineWidth = 3;


    ctx.beginPath();

    ctx.roundRect(
        -player.width / 2,
        -player.height / 2,
        player.width,
        player.height,
        10
    );

    ctx.fill();

    ctx.stroke();


    /* WINDOW */

    ctx.fillStyle =
        skin.light;

    ctx.beginPath();

    ctx.roundRect(
        -12,
        -17,
        24,
        15,
        5
    );

    ctx.fill();


    /* CENTER STRIPE */

    ctx.fillStyle =
        skin.dark;

    ctx.fillRect(
        -3,
        -player.height / 2,
        6,
        player.height
    );


    /* WHEELS */

    ctx.fillStyle =
        "#020617";


    ctx.fillRect(
        -player.width / 2 - 5,
        -15,
        6,
        14
    );


    ctx.fillRect(
        player.width / 2 - 1,
        -15,
        6,
        14
    );


    ctx.fillRect(
        -player.width / 2 - 5,
        8,
        6,
        14
    );


    ctx.fillRect(
        player.width / 2 - 1,
        8,
        6,
        14
    );


    /* BOOST FLAME */

    if (boostActive) {

        ctx.fillStyle =
            "#facc15";

        ctx.beginPath();

        ctx.moveTo(
            -7,
            player.height / 2
        );

        ctx.lineTo(
            0,
            player.height / 2 + 20
        );

        ctx.lineTo(
            7,
            player.height / 2
        );

        ctx.closePath();

        ctx.fill();

    }


    /* MAGNET ICON */

    if (magnetActive) {

        ctx.font =
            "20px Arial";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "🧲",
            0,
            -40
        );

    }


    ctx.restore();

}


/* =========================================================
   DRAW PARTICLES
========================================================= */

function drawParticles() {

    for (
        const particle of particles
    ) {

        const alpha =
            clamp(
                particle.life /
                particle.maxLife,
                0,
                1
            );


        ctx.globalAlpha =
            alpha;

        ctx.fillStyle =
            particle.color;


        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    ctx.globalAlpha = 1;

}


/* =========================================================
   DRAW COMBO
========================================================= */

function drawCombo() {

    if (
        combo < 2 ||
        comboTimer <= 0
    ) {

        return;

    }


    ctx.save();

    ctx.textAlign =
        "center";


    ctx.font =
        "bold 22px Arial";


    ctx.fillStyle =
        "#facc15";


    ctx.fillText(
        combo + "x COMBO",
        canvasWidth / 2,
        40
    );


    ctx.restore();

}


/* =========================================================
   DRAW
========================================================= */

function draw() {

    drawBackground();

    drawMagnetEffect();

    drawCoins();

    drawObstacles();

    drawPlayer();

    drawParticles();

    drawCombo();

}


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop(timestamp) {

    if (!lastTime) {

        lastTime = timestamp;

    }


    let dt =
        (timestamp - lastTime) /
        1000;


    lastTime = timestamp;


    dt =
        Math.min(
            dt,
            0.033
        );


    if (
        gameRunning &&
        !gamePaused
    ) {

        update(dt);

    }


    draw();


    requestAnimationFrame(
        gameLoop
    );

}


/* =========================================================
   POWER: BOOST
========================================================= */

function activateBoost() {

    if (
        !gameRunning ||
        gamePaused
    ) {

        return;

    }


    if (
        boostActive
    ) {

        return;

    }


    if (
        boostEnergy < 25
    ) {

        return;

    }


    boostActive = true;

    boostTimer =
        3 +
        boostUpgrade *
        0.5;


    boostEnergy -= 25;


    createBurst(
        player.x +
        player.width / 2,

        player.y +
        player.height / 2,

        "#facc15",

        12
    );


    playSound(
        800,
        0.15,
        "square",
        0.05
    );

}


/* =========================================================
   POWER: SHIELD
========================================================= */

function activateShield() {

    if (
        !gameRunning ||
        gamePaused
    ) {

        return;

    }


    if (
        shieldTimer > 0
    ) {

        return;

    }


    if (
        shieldEnergy < 30
    ) {

        return;

    }


    shieldTimer =
        4;


    shieldEnergy -= 30;


    playSound(
        500,
        0.15,
        "triangle",
        0.05
    );

}


/* =========================================================
   POWER: MAGNET
========================================================= */

function activateMagnet() {

    if (
        !gameRunning ||
        gamePaused
    ) {

        return;

    }


    if (
        magnetActive
    ) {

        return;

    }


    if (
        magnetEnergy < 100
    ) {

        return;

    }


    magnetActive = true;

    magnetTimer =
        getMagnetDuration();


    magnetEnergy = 0;


    achievementData.magnet =
        true;


    createBurst(
        player.x +
        player.width / 2,

        player.y +
        player.height / 2,

        "#f472b6",

        18
    );


    playSound(
        600,
        0.18,
        "sine",
        0.05
    );


    saveProgress();

}


/* =========================================================
   UI
========================================================= */

function updateUI() {

    scoreElement.textContent =
        Math.floor(score);


    coinsElement.textContent =
        totalCoins;


    bestElement.textContent =
        bestScore;


    shopCoins.textContent =
        totalCoins;


    boostBar.style.width =
        boostEnergy + "%";


    shieldBar.style.width =
        shieldEnergy + "%";


    magnetBar.style.width =
        magnetEnergy + "%";


    if (boostActive) {

        boostBtn.classList.add(
            "active"
        );

    } else {

        boostBtn.classList.remove(
            "active"
        );

    }


    if (shieldTimer > 0) {

        shieldBtn.classList.add(
            "active"
        );

    } else {

        shieldBtn.classList.remove(
            "active"
        );

    }


    if (magnetActive) {

        magnetBtn.classList.add(
            "active"
        );

    } else {

        magnetBtn.classList.remove(
            "active"
        );

    }


    heartsElement.textContent =
        "❤️ ".repeat(
            Math.max(
                lives,
                0
            )
        );


    if (lives <= 0) {

        heartsElement.textContent =
            "💔";

    }


    boostUpgradeLevel.textContent =
        boostUpgrade;


    magnetUpgradeLevel.textContent =
        magnetUpgrade;


    coinUpgradeLevel.textContent =
        coinUpgrade;


    buyBoostUpgrade.disabled =
        boostUpgrade >= 3 ||
        totalCoins < 200;


    buyMagnetUpgrade.disabled =
        magnetUpgrade >= 3 ||
        totalCoins < 200;


    buyCoinUpgrade.disabled =
        coinUpgrade >= 3 ||
        totalCoins < 200;

}


/* =========================================================
   SAVE
========================================================= */

function saveProgress() {

    localStorage.setItem(
        "coinRushCoinsV5",
        totalCoins
    );


    localStorage.setItem(
        "coinRushBestV5",
        bestScore
    );


    localStorage.setItem(
        "coinRushSkinV5",
        selectedSkin
    );


    localStorage.setItem(
        "coinRushSkinsV5",
        JSON.stringify(
            ownedSkins
        )
    );


    localStorage.setItem(
        "coinRushBoostUpgradeV5",
        boostUpgrade
    );


    localStorage.setItem(
        "coinRushMagnetUpgradeV5",
        magnetUpgrade
    );


    localStorage.setItem(
        "coinRushCoinUpgradeV5",
        coinUpgrade
    );


    localStorage.setItem(
        "coinRushAchievementsV5",
        JSON.stringify(
            achievementData
        )
    );

}


/* =========================================================
   ACHIEVEMENTS
========================================================= */

function checkAchievements() {

    if (
        totalCoins >= 1
    ) {

        achievementData.firstCoin =
            true;

    }


    if (
        totalCoins >= 100
    ) {

        achievementData.coins100 =
            true;

    }


    if (
        score >= 1000
    ) {

        achievementData.score1000 =
            true;

    }


    if (
        bestCombo >= 10
    ) {

        achievementData.combo10 =
            true;

    }


    if (
        gameTime >= 60
    ) {

        achievementData.survivor =
            true;

    }


    saveProgress();

    renderAchievements();

}


function renderAchievements() {

    achievementList.innerHTML = "";


    for (
        const achievement of achievements
    ) {

        const unlocked =
            achievementData[
                achievement.id
            ] === true;


        const div =
            document.createElement(
                "div"
            );


        div.className =
            "achievement " +
            (
                unlocked
                    ? "unlocked"
                    : ""
            );


        div.innerHTML = `

            <div class="achievement-icon">
                ${achievement.icon}
            </div>

            <div class="achievement-title">
                ${achievement.title}
            </div>

            <div class="achievement-description">
                ${achievement.description}
            </div>

        `;


        achievementList.appendChild(
            div
        );

    }

}


/* =========================================================
   SHOP
========================================================= */

function openShop() {

    shopScreen.classList.remove(
        "hidden"
    );

    renderShop();

}


function closeShop() {

    shopScreen.classList.add(
        "hidden"
    );

}


function renderShop() {

    shopCoins.textContent =
        totalCoins;


    document
        .querySelectorAll(
            ".skin-card"
        )
        .forEach(card => {

            const skin =
                card.dataset.skin;


            card.classList.toggle(
                "selected",
                skin === selectedSkin
            );

        });


    updateUI();

}


/* =========================================================
   BUY / SELECT SKIN
========================================================= */

document
    .querySelectorAll(
        ".skin-card"
    )
    .forEach(card => {

        card.addEventListener(
            "click",
            () => {

                const skin =
                    card.dataset.skin;


                const prices = {

                    blue: 0,

                    green: 100,

                    orange: 200,

                    purple: 300

                };


                const price =
                    prices[skin];


                if (
                    ownedSkins.includes(
                        skin
                    )
                ) {

                    selectedSkin =
                        skin;

                    saveProgress();

                    renderShop();

                    return;

                }


                if (
                    totalCoins >= price
                ) {

                    totalCoins -=
                        price;


                    ownedSkins.push(
                        skin
                    );


                    selectedSkin =
                        skin;


                    saveProgress();

                    renderShop();

                    playSound(
                        900,
                        0.15,
                        "triangle",
                        0.04
                    );

                }

            }
        );

    });


/* =========================================================
   BOOST UPGRADE
========================================================= */

buyBoostUpgrade.addEventListener(
    "click",
    () => {

        if (
            boostUpgrade >= 3
        ) {

            return;

        }


        if (
            totalCoins < 200
        ) {

            return;

        }


        totalCoins -= 200;

        boostUpgrade += 1;


        saveProgress();

        updateUI();

        playSound(
            700,
            0.12,
            "triangle",
            0.04
        );

    }
);


/* =========================================================
   MAGNET UPGRADE
========================================================= */

buyMagnetUpgrade.addEventListener(
    "click",
    () => {

        if (
            magnetUpgrade >= 3
        ) {

            return;

        }


        if (
            totalCoins < 200
        ) {

            return;

        }


        totalCoins -= 200;

        magnetUpgrade += 1;


        saveProgress();

        updateUI();

        playSound(
            700,
            0.12,
            "triangle",
            0.04
        );

    }
);


/* =========================================================
   COIN UPGRADE
========================================================= */

buyCoinUpgrade.addEventListener(
    "click",
    () => {

        if (
            coinUpgrade >= 3
        ) {

            return;

        }


        if (
            totalCoins < 200
        ) {

            return;

        }


        totalCoins -= 200;

        coinUpgrade += 1;


        saveProgress();

        updateUI();

        playSound(
            700,
            0.12,
            "triangle",
            0.04
        );

    }
);


/* =========================================================
   BUTTON EVENTS
========================================================= */

startBtn.addEventListener(
    "click",
    startGame
);


restartBtn.addEventListener(
    "click",
    startGame
);


pauseBtn.addEventListener(
    "click",
    togglePause
);


resumeBtn.addEventListener(
    "click",
    togglePause
);


shopBtnStart.addEventListener(
    "click",
    openShop
);


pauseShopBtn.addEventListener(
    "click",
    openShop
);


gameOverShopBtn.addEventListener(
    "click",
    openShop
);


closeShopBtn.addEventListener(
    "click",
    closeShop
);


boostBtn.addEventListener(
    "click",
    activateBoost
);


shieldBtn.addEventListener(
    "click",
    activateShield
);


magnetBtn.addEventListener(
    "click",
    activateMagnet
);


/* =========================================================
   KEYBOARD CONTROLS
========================================================= */

window.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();


        if (
            [
                "arrowleft",
                "arrowright",
                "arrowup",
                "arrowdown",
                " "
            ].includes(key)
        ) {

            event.preventDefault();

        }


        /* LEFT */

        if (
            key === "arrowleft" ||
            key === "a"
        ) {

            keys.left = true;

        }


        /* RIGHT */

        if (
            key === "arrowright" ||
            key === "d"
        ) {

            keys.right = true;

        }


        /* FORWARD */

        if (
            key === "arrowup" ||
            key === "w"
        ) {

            keys.forward = true;

        }


        /* BACKWARD */

        if (
            key === "arrowdown" ||
            key === "s"
        ) {

            keys.backward = true;

        }


        /* BOOST */

        if (
            key === "b" &&
            !event.repeat
        ) {

            activateBoost();

        }


        /* SHIELD */

        if (
            key === "q" &&
            !event.repeat
        ) {

            activateShield();

        }


        /* MAGNET */

        if (
            key === "m" &&
            !event.repeat
        ) {

            activateMagnet();

        }


        /* PAUSE */

        if (
            (
                key === "p" ||
                key === " "
            ) &&
            !event.repeat
        ) {

            togglePause();

        }

    }
);


/* =========================================================
   KEYBOARD RELEASE
========================================================= */

window.addEventListener(
    "keyup",
    event => {

        const key =
            event.key.toLowerCase();


        if (
            key === "arrowleft" ||
            key === "a"
        ) {

            keys.left = false;

        }


        if (
            key === "arrowright" ||
            key === "d"
        ) {

            keys.right = false;

        }


        if (
            key === "arrowup" ||
            key === "w"
        ) {

            keys.forward = false;

        }


        if (
            key === "arrowdown" ||
            key === "s"
        ) {

            keys.backward = false;

        }

    }
);


/* =========================================================
   MOUSE / TOUCH MOVEMENT
========================================================= */

let pointerActive = false;


function movePlayerToPointer(event) {

    const rect =
        canvas.getBoundingClientRect();


    const x =
        event.clientX -
        rect.left;


    const y =
        event.clientY -
        rect.top;


    player.targetX =
        clamp(
            x -
            player.width / 2,

            getRoadLeft() + 10,

            getRoadRight() -
            player.width -
            10
        );


    player.targetY =
        clamp(
            y -
            player.height / 2,

            getRoadTop() + 10,

            getRoadBottom() -
            player.height -
            10
        );

}


canvas.addEventListener(
    "pointerdown",
    event => {

        pointerActive = true;

        movePlayerToPointer(
            event
        );

    }
);


canvas.addEventListener(
    "pointermove",
    event => {

        if (
            pointerActive
        ) {

            movePlayerToPointer(
                event
            );

        }

    }
);


canvas.addEventListener(
    "pointerup",
    () => {

        pointerActive = false;

    }
);


canvas.addEventListener(
    "pointercancel",
    () => {

        pointerActive = false;

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

resizeCanvas();

createStars();

renderAchievements();

updateUI();

requestAnimationFrame(
    gameLoop
);
