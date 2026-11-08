
import {
    createGameState,
    getNodeById,
    getConnectedEdges,
    getOtherNode,
    getNextEdge,
    getTrainPosition,
    toggleSwitch,
    toggleSignal,
    checkCollisions,
    addEvent
} from "./state.js";

import { renderGame } from "./render.js";

const canvas = document.querySelector("#game-canvas");
const context = canvas?.getContext("2d");

const menuScreen = document.querySelector('[data-screen="menu"]');
const gameScreen = document.querySelector('[data-screen="game"]');
const resultModal = document.querySelector('[data-role="result-modal"]');

const menuMessage = document.querySelector('[data-role="menu-message"]');
const playerInput = document.querySelector("#player-name");
const difficultySelect = document.querySelector("#difficulty");
const infoModal = document.querySelector('[data-role="info-modal"]');
const pauseModal = document.querySelector('[data-role="pause-modal"]');

let gameState = null;
let animationId = null;
let previousFrameTime = 0;
let lastResultShown = false;

const SAVE_KEY = "railway-simulator-save";
const LEADERBOARD_KEY = "railway-simulator-leaderboard";

if (!canvas || !context) {
    throw new Error("A játék Canvas eleme nem található!");
}


/* ==========================================
   1. KÉPERNYŐK KEZELÉSE
========================================== */

function showScreen(screenName) {
    menuScreen.hidden = screenName !== "menu";
    gameScreen.hidden = screenName !== "game";
}

function showMenuMessage(message, type = "info") {
    menuMessage.textContent = message;
    menuMessage.dataset.type = type;
}

function addLog(message, type = "info") {
    if (!gameState) {
        return;
    }

    addEvent(gameState, message, type);
}


/* ==========================================
   2. JÁTÉK INDÍTÁSA
========================================== */

function startGame(levelId, playerName) {
    try {
        stopGameLoop();

        gameState = createGameState(
            Number(levelId),
            playerName
        );

        gameState.isRunning = true;
        gameState.isPaused = false;
        pauseModal.hidden = true;

        const pauseButton = document.querySelector(
            '[data-action="pause"]'
        );

        pauseButton.textContent = "⏸";

        lastResultShown = false;
        resultModal.hidden = true;

        addLog(
            `${gameState.playerName} megkezdte a forgalomirányítást.`,
            "success"
        );

        showScreen("game");

        previousFrameTime = 0;
        animationId = requestAnimationFrame(gameLoop);

    } catch (error) {
        console.error("Indítási hiba:", error);
        showMenuMessage(error.message, "error");
    }
}


/* ==========================================
   3. JÁTÉKHUROK
========================================== */

function gameLoop(timestamp) {
    if (!gameState) {
        return;
    }

    if (previousFrameTime === 0) {
        previousFrameTime = timestamp;
    }

    const deltaTime = Math.min(
        (timestamp - previousFrameTime) / 1000,
        0.05
    );

    previousFrameTime = timestamp;

    if (gameState.isRunning &&!gameState.isPaused &&infoModal.hidden) {
        updateGame(deltaTime);
    }

    renderGame(gameState, canvas, gameState.elapsedTime);

    if (gameState.gameOver || gameState.won) {
        showResult();
        return;
    }

    animationId = requestAnimationFrame(gameLoop);
}

function stopGameLoop() {
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    previousFrameTime = 0;
}


/* ==========================================
   4. JÁTÉKÁLLAPOT FRISSÍTÉSE
========================================== */

function updateGame(deltaTime) {
    gameState.elapsedTime += deltaTime;

    spawnScheduledTrains();

    for (const train of gameState.trains) {
        if (train.status !== "running" || train.brake) {
            continue;
        }

        moveTrain(train, deltaTime);
    }

    checkCollisions(gameState);

    if (gameState.collision || gameState.gameOver) {
        gameState.isRunning = false;
        return;
    }

    const allTrainsFinished =
        gameState.trains.length > 0 &&
        gameState.trains.every(train =>
            train.status === "arrived" ||
            train.status === "derailed"
        );

    if (allTrainsFinished) {
        gameState.won = gameState.trains.every(
            train => train.status === "arrived"
        );

        gameState.gameOver = !gameState.won;
        gameState.isRunning = false;
    }
}


/* ==========================================
   5. VONATOK BELÉPTETÉSE
========================================== */

function spawnScheduledTrains() {
    for (const train of gameState.trains) {
        if (
            train.status !== "scheduled" ||
            gameState.elapsedTime < train.spawnAt
        ) {
            continue;
        }

        const connectedEdges = getConnectedEdges(
            gameState,
            train.origin
        );

        if (connectedEdges.length === 0) {
            derailTrain(train, "A vonat nem tudott belépni a pályára.");
            continue;
        }

        const firstEdge = connectedEdges[0];

        train.edgeId = firstEdge.id;
        train.fromNodeId = train.origin;
        train.toNodeId = getOtherNode(firstEdge, train.origin);
        train.progress = 0;
        train.status = "running";

        addLog(
            `${train.name} belépett a pályára.`,
            "info"
        );
    }
}


/* ==========================================
   6. VONAT MOZGATÁSA
========================================== */

function moveTrain(train, deltaTime) {
    const fromNode = getNodeById(
        gameState,
        train.fromNodeId
    );

    const toNode = getNodeById(
        gameState,
        train.toNodeId
    );

    if (!fromNode || !toNode) {
        derailTrain(train, `${train.name}: hibás pályakapcsolat.`);
        return;
    }

    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) {
        derailTrain(train, `${train.name}: nulla hosszúságú vágány.`);
        return;
    }

    const targetSignal = gameState.signals.find(
        signal => signal.nodeId === train.toNodeId
    );

    const nextProgress =
        train.progress +
        (train.speed / 100) * deltaTime / (distance / 100);

    if (targetSignal && !targetSignal.green && nextProgress >= 0.96) {
        train.progress = 0.96;
        return;
    }

    train.progress = Math.min(nextProgress, 1);

    if (train.progress >= 1) {
        reachNode(train);
    }
}


/* ==========================================
   7. CSOMÓPONT ELÉRÉSE
========================================== */

function reachNode(train) {
    const reachedNode = getNodeById(
        gameState,
        train.toNodeId
    );

    if (!reachedNode) {
        derailTrain(train, `${train.name}: ismeretlen csomópont.`);
        return;
    }

    if (reachedNode.type === "platform") {
        if (reachedNode.id === train.destination) {
            arriveTrain(train);
        } else {
            derailTrain(
                train,
                `${train.name} rossz peronra érkezett!`
            );
        }

        return;
    }

    const nextEdge = getNextEdge(
        gameState,
        train,
        train.toNodeId
    );

    if (!nextEdge) {
        derailTrain(
            train,
            `${train.name} elérte a vágány végét!`
        );
        return;
    }

    const nextNodeId = getOtherNode(
        nextEdge,
        train.toNodeId
    );

    if (!nextNodeId) {
        derailTrain(train, `${train.name}: hibás vágány.`);
        return;
    }

    train.edgeId = nextEdge.id;
    train.fromNodeId = train.toNodeId;
    train.toNodeId = nextNodeId;
    train.progress = 0;
}


/* ==========================================
   8. CÉLBA ÉRKEZÉS ÉS KISIKLÁS
========================================== */

function arriveTrain(train) {
    train.status = "arrived";
    train.arrived = true;
    train.progress = 1;

    gameState.arrivedCount += 1;

    addLog(
        `${train.name} sikeresen megérkezett a célállomásra!`,
        "success"
    );
}

function derailTrain(train, message) {
    train.status = "derailed";
    train.derailed = true;

    gameState.errorCount += 1;

    addLog(message, "error");
}


/* ==========================================
   9. CANVAS KATTINTÁSOK
========================================== */

function getCanvasCoordinates(event) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: (event.clientX - rect.left) *
            (canvas.width / rect.width),

        y: (event.clientY - rect.top) *
            (canvas.height / rect.height)
    };
}

function findClickedNode(position) {
    return gameState.nodes.find(node => {
        const dx = node.x - position.x;
        const dy = node.y - position.y;

        return Math.sqrt(dx * dx + dy * dy) < 25;
    });
}

canvas.addEventListener("click", event => {
    if (
        !gameState ||
        !gameState.isRunning ||
        gameState.isPaused ||
        !infoModal.hidden
    ) {
        return;
    }

    const position = getCanvasCoordinates(event);

    const clickedSignal = gameState.signals.find(signal => {
        const node = getNodeById(gameState, signal.nodeId);

        if (!node) {
            return false;
        }

        const signalX = node.x;
        const signalY = node.y - 29;

        const dx = position.x - signalX;
        const dy = position.y - signalY;

        return Math.sqrt(dx * dx + dy * dy) <= 17;
    });

    if (clickedSignal) {
        const newState = toggleSignal(
            gameState,
            clickedSignal.id
        );

        addLog(
            `${clickedSignal.id}: ${newState ? "ZÖLD" : "PIROS"} jelzés.`,
            newState ? "success" : "warning"
        );

        return;
    }

    const clickedSwitch = gameState.switches.find(railwaySwitch => {
        const node = getNodeById(gameState, railwaySwitch.id);

        if (!node) {
            return false;
        }

        const dx = node.x - position.x;
        const dy = node.y - position.y;

        return Math.sqrt(dx * dx + dy * dy) <= 17;
    });

    if (clickedSwitch) {
        toggleSwitch(gameState, clickedSwitch.id);

        addLog(
            `${clickedSwitch.id} váltó átállítva.`,
            "info"
        );
    }
});


/* ==========================================
   10. JOBB KATTINTÁS - VÉSZFÉK
========================================== */

canvas.addEventListener("contextmenu", event => {
    event.preventDefault();

    if (
        !gameState ||
        !gameState.isRunning ||
        gameState.isPaused
    ) {
        return;
    }

    const position = getCanvasCoordinates(event);

    const clickedTrain = gameState.trains.find(train => {
        if (train.status !== "running") {
            return false;
        }

        const trainPosition = getTrainPosition(
            gameState,
            train
        );

        if (!trainPosition) {
            return false;
        }

        const dx = trainPosition.x - position.x;
        const dy = trainPosition.y - position.y;

        return Math.sqrt(dx * dx + dy * dy) < 28;
    });

    if (!clickedTrain) {
        return;
    }

    clickedTrain.brake = !clickedTrain.brake;

    addLog(
        `${clickedTrain.name}: ${
            clickedTrain.brake
                ? "vészfék bekapcsolva."
                : "vészfék feloldva."
        }`,
        clickedTrain.brake ? "warning" : "info"
    );
});


/* ==========================================
   11. SZÜNET ÉS FOLYTATÁS
========================================== */

function togglePause() {
    if (!gameState || !gameState.isRunning) {
        return;
    }

    gameState.isPaused = !gameState.isPaused;
    pauseModal.hidden = !gameState.isPaused;


    addLog(
        gameState.isPaused
            ? "A szimuláció szünetel."
            : "A szimuláció folytatódik.",
        "info"
    );

    previousFrameTime = 0;
}


/* ==========================================
   12. JÁTÉK MENTÉSE ÉS BETÖLTÉSE
========================================== */

function saveGame() {
    if (!gameState) {
        return;
    }

    try {
        localStorage.setItem(
            SAVE_KEY,
            JSON.stringify(gameState)
        );

        addLog("A játékállás sikeresen elmentve.", "success");

    } catch (error) {
        console.error("Mentési hiba:", error);
        addLog("A mentés nem sikerült.", "error");
    }
}

function loadGame() {
    try {
        const savedGame = localStorage.getItem(SAVE_KEY);

        if (!savedGame) {
            showMenuMessage(
                "Nincs elérhető mentett játék.",
                "error"
            );
            return;
        }

        const loadedState = JSON.parse(savedGame);

        if (
            !loadedState ||
            !Array.isArray(loadedState.trains) ||
            !Array.isArray(loadedState.nodes) ||
            !Array.isArray(loadedState.edges)
        ) {
            throw new Error("A mentés adatai hibásak.");
        }

        gameState = loadedState;
        gameState.isRunning = true;
        gameState.isPaused = false;
        pauseModal.hidden = true;
        gameState.gameOver = false;
        gameState.won = false;
        gameState.collision = null;

        lastResultShown = false;
        resultModal.hidden = true;

        addLog("A mentett játék betöltve.", "success");

        showScreen("game");

        previousFrameTime = 0;
        stopGameLoop();
        animationId = requestAnimationFrame(gameLoop);

    } catch (error) {
        console.error("Betöltési hiba:", error);
        showMenuMessage(
            "A mentett játék nem tölthető be.",
            "error"
        );
    }
}


/* ==========================================
   13. RANGLISTA
========================================== */

function getLeaderboard() {
    try {
        return JSON.parse(
            localStorage.getItem(LEADERBOARD_KEY) || "[]"
        );
    } catch (error) {
        console.error("Ranglistaolvasási hiba:", error);
        return [];
    }
}

function saveLeaderboardResult() {
   if (
    !gameState ||
    gameState.collision ||
    !gameState.gameOver && !gameState.won ||
    gameState.trains.length === 0 ||
    !gameState.trains.every(train =>
        train.status === "arrived" ||
        train.status === "derailed"
    )
    ) {
        return;
    }

    const leaderboard = getLeaderboard();
    const penaltyPerError = 30;

    const adjustedTime =
        gameState.elapsedTime +
        gameState.errorCount * penaltyPerError;

    leaderboard.push({
        playerName: gameState.playerName,
        levelId: gameState.levelId,
        levelName: gameState.levelName,
        time: gameState.elapsedTime,
        errors: gameState.errorCount,
        penaltySeconds: penaltyPerError,
        adjustedTime: adjustedTime,
        won: gameState.won,
        date: new Date().toLocaleDateString("hu-HU")
    });

    leaderboard.sort((a, b) => {
    const errorDifference = (a.errors ?? 0) - (b.errors ?? 0);

    if (errorDifference !== 0) {
        return errorDifference;
    }

        return (a.time ?? 0) - (b.time ?? 0);
    });

    try {
        localStorage.setItem(
            LEADERBOARD_KEY,
            JSON.stringify(leaderboard)
        );
    } catch (error) {
        console.error("Ranglistamentési hiba:", error);
    }
}

function renderLeaderboard() {
    const container = document.querySelector(
        '[data-role="leaderboard"]'
    );

    const selectedLevel = Number(
        document.querySelector("#leaderboard-level").value
    );

    const results = getLeaderboard()
        .filter(item => item.levelId === selectedLevel);

    container.replaceChildren();

    if (results.length === 0) {
        const message = document.createElement("p");
        message.textContent = "Még nincsenek elmentett eredmények.";
        container.append(message);
        return;
    }

    const list = document.createElement("ol");

    for (const result of results) {
        const item = document.createElement("li");

        const minutes = Math.floor(result.time / 60);
        const seconds = Math.floor(result.time % 60);

        const adjustedTime = result.adjustedTime ??
            (result.time + (result.errors || 0) * 30);

        const adjustedMinutes = Math.floor(adjustedTime / 60);
        const adjustedSeconds = Math.floor(adjustedTime % 60);

        const penaltyText = result.errors > 0 ? ` - büntetéssel: ${String(adjustedMinutes).padStart(2, "0")}:${String(adjustedSeconds).padStart(2, "0")}`: "";

        item.textContent =
            `${result.playerName} - ` +
            `${String(minutes).padStart(2, "0")}:` +
            `${String(seconds).padStart(2, "0")} - ` +
            `${result.errors} hiba` +
            penaltyText;

        list.append(item);
    }

    container.append(list);
}


/* ==========================================
   14. JÁTÉK VÉGI ABLAK
========================================== */

function showResult() {
    if (lastResultShown) {
        return;
    }

    lastResultShown = true;
    stopGameLoop();

    const won = gameState.won;

    document.querySelector('[data-role="result-icon"]').textContent =
        won ? "🏆" : "💥";

    document.querySelector('[data-role="result-title"]').textContent =
        won ? "Gratulálunk, sikerült!" : "Véget ért a szimuláció!";

    document.querySelector('[data-role="result-message"]').textContent =
        won
            ? "Minden vonat sikeresen célba ért!"
            : gameState.collision
                ? "Ütközés történt a pályán!"
                : "A forgalomirányítás nem sikerült.";

    document.querySelector('[data-role="result-stats"]').textContent =
        `Célba ért vonatok: ${gameState.arrivedCount} / ${gameState.trains.length} | ` +
        `Hibák: ${gameState.errorCount} | ` +
        `Idő: ${formatTime(gameState.elapsedTime)}`;

    saveLeaderboardResult();
    renderLeaderboard();

    resultModal.hidden = false;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return (
        `${String(minutes).padStart(2, "0")}:` +
        `${String(remainingSeconds).padStart(2, "0")}`
    );
}


/* ==========================================
   15. GOMBOK KEZELÉSE
========================================== */

document.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");

    if (!button) {
        return;
    }

    const action = button.dataset.action;

    switch (action) {
        case "start": {
            startGame(
                difficultySelect.value,
                playerInput.value
            );
            break;
        }

        case "load-menu": {
            loadGame();
            break;
        }

        case "pause": {
            togglePause();
            break;
        }

        case "restart": {
            if (gameState) {
                startGame(
                    gameState.levelId,
                    gameState.playerName
                );
            }
            break;
        }

        case "save": {
            saveGame();
            break;
        }

        case "back-menu":
        case "result-menu": {
            stopGameLoop();
            showScreen("menu");
            resultModal.hidden = true;
            renderLeaderboard();
            break;
        }

        case "play-again": {
            if (gameState) {
                startGame(
                    gameState.levelId,
                    gameState.playerName
                );
            }
            break;
        }

        case "info": {
            infoModal.hidden = false;
            break;
        }

        case "close-info": {
            infoModal.hidden = true;
            break;
        }

        case "toggle-mobile-menu": {
    const topbar = button.closest(".game-topbar");

    if (topbar) {
        const isOpen = topbar.classList.toggle("mobile-menu-open");

        button.setAttribute("aria-expanded", String(isOpen));

        button.setAttribute(
            "aria-label",
            isOpen ? "Menü bezárása" : "Menü megnyitása"
        );
    }

    break;
}
    }
});

infoModal.addEventListener("click", event => {
    if (event.target === infoModal) {
        infoModal.hidden = true;
    }
});

document.addEventListener("keydown", event => {

    if (event.key !== "Escape") {
        return;
    }

    if (!infoModal.hidden) {
        infoModal.hidden = true;
        return;
    }

    if (!pauseModal.hidden) {
        togglePause();
    }

});


/* ==========================================
   16. RANGLISTA ESEMÉNYEI
========================================== */

document.querySelector("#leaderboard-level")
    .addEventListener("change", renderLeaderboard);


/* ==========================================
   17. KEZDŐÁLLAPOT
========================================== */

renderLeaderboard();
showScreen("menu");
