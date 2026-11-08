import {
    getNodeById,
    getTrainPosition,
    getEdgeById,
    getOtherNode
} from "./state.js";


/* ==========================================
   1. ALAPSZÍNEK
========================================== */

const COLORS = {
    background: "#090c15",
    trackOuter: "#30394d",
    trackInner: "#8792a7",
    trackCenter: "#414c60",
    node: "#8c9bb5",
    switch: "#69c8ff",
    switchActive: "#ffd447",
    red: "#e34f55",
    green: "#35c978",
    white: "#edf2ff",
    muted: "#aab6d0",
    warning: "#ffce35",
    danger: "#ff3434"
};


/* ==========================================
   2. SEGÉDFÜGGVÉNYEK
========================================== */

function drawText(ctx, text, x, y, size = 13, color = COLORS.white) {

    ctx.save();

    ctx.font = `bold ${size}px Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    ctx.fillText(text, x, y);

    ctx.restore();

}


function drawCircle(ctx, x, y, radius, color, strokeColor = null) {

    ctx.save();

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);

    ctx.fillStyle = color;
    ctx.fill();

    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    ctx.restore();

}


function drawRoundedRect(ctx, x, y, width, height, radius, color) {

    ctx.save();

    ctx.beginPath();

    ctx.roundRect(
        x,
        y,
        width,
        height,
        radius
    );

    ctx.fillStyle = color;
    ctx.fill();

    ctx.restore();

}


/* ==========================================
   3. HÁTTÉR RAJZOLÁSA
========================================== */

function drawBackground(ctx, canvas) {

    ctx.save();

    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(130, 150, 190, 0.045)";
    ctx.lineWidth = 1;

    const gridSize = 40;

    for (let x = 0; x <= canvas.width; x += gridSize) {

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();

    }

    for (let y = 0; y <= canvas.height; y += gridSize) {

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();

    }

    ctx.restore();

}


/* ==========================================
   4. VÁGÁNYOK RAJZOLÁSA
========================================== */

function drawTrack(ctx, state, edge) {

    const nodeA = getNodeById(state, edge.a);
    const nodeB = getNodeById(state, edge.b);

    if (!nodeA || !nodeB) {
        return;
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(nodeA.x, nodeA.y);
    ctx.lineTo(nodeB.x, nodeB.y);

    ctx.strokeStyle = COLORS.trackOuter;
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(nodeA.x, nodeA.y);
    ctx.lineTo(nodeB.x, nodeB.y);

    ctx.strokeStyle = COLORS.trackInner;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(nodeA.x, nodeA.y);
    ctx.lineTo(nodeB.x, nodeB.y);

    ctx.strokeStyle = COLORS.trackCenter;
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 12]);
    ctx.stroke();

    ctx.restore();

}


/* ==========================================
   5. AKTÍV VÁLTÓIRÁNY RAJZOLÁSA
========================================== */

function drawSwitch(ctx, state, railwaySwitch) {

    const node = getNodeById(state, railwaySwitch.id);

    if (!node) {
        return;
    }

    const activeEdgeId =
        railwaySwitch.edgeIds[railwaySwitch.activeIndex];

    const activeEdge = getEdgeById(state, activeEdgeId);

    ctx.save();
    drawCircle(
        ctx,
        node.x,
        node.y,
        22,
        "#101a2d",
        COLORS.switch
    );

    if (activeEdge) {

        const nextNodeId = getOtherNode(activeEdge, node.id);
        const nextNode = getNodeById(state, nextNodeId);

        if (nextNode) {

            const angle = Math.atan2(
                nextNode.y - node.y,
                nextNode.x - node.x
            );

            ctx.translate(node.x, node.y);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(15, 0);

            ctx.strokeStyle = COLORS.switchActive;
            ctx.lineWidth = 4;
            ctx.lineCap = "round";
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(15, 0);
            ctx.lineTo(8, -6);
            ctx.lineTo(8, 6);
            ctx.closePath();

            ctx.fillStyle = COLORS.switchActive;
            ctx.fill();

        }

    }

    ctx.restore();

    drawText(
        ctx,
        "VÁLTÓ",
        node.x - 23,
        node.y + 34,
        10,
        COLORS.switch
    );

}


/* ==========================================
   6. FÉNYJELZŐK RAJZOLÁSA
========================================== */

function drawSignal(ctx, state, signal) {

    const node = getNodeById(state, signal.nodeId);

    if (!node) {
        return;
    }

    const offsetX = 0;
    const offsetY = -29;

    const x = node.x + offsetX;
    const y = node.y + offsetY;

    ctx.save();

    ctx.fillStyle = "#68758b";
    ctx.fillRect(x - 2, y + 15, 4, 23);

    drawRoundedRect(
        ctx,
        x - 11,
        y - 15,
        22,
        34,
        5,
        "#171d2a"
    );

    ctx.strokeStyle = "#68758b";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 11, y - 15, 22, 34);

    drawCircle(
        ctx,
        x,
        y - 6,
        5,
        signal.green ? "#612d32" : COLORS.red
    );

    drawCircle(
        ctx,
        x,
        y + 7,
        5,
        signal.green ? COLORS.green : "#244b38"
    );

    ctx.restore();

    drawText(
        ctx,
        signal.green ? "SZABAD" : "TILOS",
        x - 20,
        y - 25,
        10,
        signal.green ? COLORS.green : COLORS.red
    );

}


/* ==========================================
   7. ÁLLOMÁSOK RAJZOLÁSA
========================================== */

function drawPlatforms(ctx, state) {

    for (const platform of state.platforms) {

        const node = getNodeById(state, platform.nodeId);

        if (!node) {
            continue;
        }

        ctx.save();

        ctx.fillStyle = platform.color;

        ctx.fillRect(
            node.x - 12,
            node.y - 24,
            24,
            48
        );

        ctx.strokeStyle = "#f2f5ff";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(
            node.x - 12,
            node.y - 24,
            24,
            48
        );

        ctx.restore();
        drawText(
            ctx,
            platform.name,
            node.x + 22,
            node.y,
            14,
            COLORS.white
        );

    }

}


/* ==========================================
   8. BELÉPÉSI PONTOK RAJZOLÁSA
========================================== */

function drawEntries(ctx, state) {

    const entries = state.nodes.filter(
        node => node.type === "entry"
    );

    for (const entry of entries) {

        drawText(
            ctx,
            "Belépő →",
            entry.x - 62,
            entry.y,
            12,
            COLORS.muted
        );

        drawCircle(
            ctx,
            entry.x,
            entry.y,
            5,
            "#aab6d0"
        );

    }

}


/* ==========================================
   9. CSOMÓPONTOK RAJZOLÁSA
========================================== */

function drawNodes(ctx, state) {

    for (const node of state.nodes) {

        if (
            node.type === "switch" ||
            node.type === "platform" ||
            node.type === "signal" ||
            node.type === "entry"
        ) {
            continue;
        }

        drawCircle(
            ctx,
            node.x,
            node.y,
            7,
            "#8492a9",
            "#c0cce0"
        );

    }

}


/* ==========================================
   10. VONATOK VESZÉLYJELZÉSE
========================================== */

function drawTrainWarning(ctx, position, train, time) {

    if (!train.warning) {
        return;
    }

    ctx.save();

    const pulse = 1 + Math.sin(time / 120) * 0.15;

    ctx.beginPath();

    ctx.arc(
        position.x,
        position.y,
        25 * pulse,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle = COLORS.warning;
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 5]);
    ctx.stroke();

    ctx.restore();

}


/* ==========================================
   11. VONAT RAJZOLÁSA
========================================== */

function drawTrain(ctx, state, train, time) {

    const position = getTrainPosition(state, train);

    if (!position) {
        return;
    }

    drawTrainWarning(ctx, position, train, time);

    const fromNode = getNodeById(state, train.fromNodeId);
    const toNode = getNodeById(state, train.toNodeId);

    if (!fromNode || !toNode) {
        return;
    }

    const angle = Math.atan2(
        toNode.y - fromNode.y,
        toNode.x - fromNode.x
    );

    ctx.save();

    ctx.translate(position.x, position.y);
    ctx.rotate(angle);

    ctx.fillStyle = train.brake ? "#ffcc33" : "#e9edf7";

    ctx.strokeStyle = train.color;
    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.roundRect(
        -19,
        -10,
        38,
        20,
        5
    );

    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = train.color;

    ctx.beginPath();
    ctx.moveTo(19, -7);
    ctx.lineTo(26, 0);
    ctx.lineTo(19, 7);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#263653";
    ctx.fillRect(-9, -6, 12, 12);

    ctx.fillStyle = "#ffe58a";
    ctx.fillRect(14, -4, 4, 8);

    ctx.restore();

    drawText(
        ctx,
        train.id,
        position.x - 12,
        position.y - 24,
        11,
        COLORS.white
    );

    if (train.brake) {

        drawRoundedRect(
            ctx,
            position.x - 17,
            position.y - 44,
            34,
            16,
            4,
            "#d7a927"
        );

        drawText(
            ctx,
            "FÉK",
            position.x - 10,
            position.y - 36,
            10,
            "#17120a"
        );

    }

    if (train.status === "waiting") {

        drawText(
            ctx,
            "TILOS",
            position.x - 18,
            position.y + 29,
            11,
            COLORS.red
        );

    }

}


/* ==========================================
   12. ÜTKÖZÉS MEGJELENÍTÉSE
========================================== */

function drawCollision(ctx, state) {

    if (!state.collision) {
        return;
    }

    const trainA = state.trains.find(
        train => train.id === state.collision.trainA
    );

    const trainB = state.trains.find(
        train => train.id === state.collision.trainB
    );

    const positionA = trainA
        ? getTrainPosition(state, trainA)
        : null;

    const positionB = trainB
        ? getTrainPosition(state, trainB)
        : null;

    if (!positionA || !positionB) {
        return;
    }

    const centerX = (positionA.x + positionB.x) / 2;
    const centerY = (positionA.y + positionB.y) / 2;

    ctx.save();

    ctx.font = "bold 38px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText("💥", centerX, centerY);

    ctx.restore();

}


/* ==========================================
   13. HUD FRISSÍTÉSE
========================================== */

function updateHUD(state) {

    try {

        const playerDisplay = document.querySelector(
            '[data-role="player-display"]'
        );

        const levelDisplay = document.querySelector(
            '[data-role="level-display"]'
        );

        const timerDisplay = document.querySelector(
            '[data-role="timer"]'
        );

        const arrivedDisplay = document.querySelector(
            '[data-role="arrived"]'
        );

        const errorsDisplay = document.querySelector(
            '[data-role="errors"]'
        );

        const eventLog = document.querySelector(
            '[data-role="event-log"]'
        );

        if (playerDisplay) {
            playerDisplay.textContent =
                `Játékos: ${state.playerName}`;
        }

        if (levelDisplay) {
            levelDisplay.textContent =
                `${state.levelId}. szint: ${state.levelName} (${state.difficulty})`;
        }

        if (timerDisplay) {

            const minutes = Math.floor(state.elapsedTime / 60);
            const seconds = Math.floor(state.elapsedTime % 60);

            timerDisplay.textContent =
                `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

        }

        if (arrivedDisplay) {

            arrivedDisplay.textContent =
                `${state.arrivedCount} / ${state.schedule.length}`;

        }

        if (errorsDisplay) {
            errorsDisplay.textContent = String(state.errorCount);
        }

        if (eventLog) {

            eventLog.replaceChildren();

            if (state.eventLog.length === 0) {

                const paragraph = document.createElement("p");
                paragraph.textContent = "A szimuláció még nem indult el.";

                eventLog.append(paragraph);

            } else {

                for (const event of state.eventLog.slice(0, 5)) {

                    const paragraph = document.createElement("p");

                    paragraph.textContent = event.message;

                    eventLog.append(paragraph);

                }

            }

        }

    } catch (error) {

        console.error("HUD frissítési hiba:", error);

    }

}


/* ==========================================
   14. FŐ RAJZOLÓ FÜGGVÉNY
========================================== */

export function renderGame(state, canvas, time = 0) {

    try {

        if (!canvas || !state) {
            throw new Error("Hiányzó Canvas vagy játékállapot!");
        }

        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw new Error("A Canvas 2D környezet nem érhető el!");
        }

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        drawBackground(ctx, canvas);

        for (const edge of state.edges) {
            drawTrack(ctx, state, edge);
        }

        drawEntries(ctx, state);

        drawNodes(ctx, state);

        for (const railwaySwitch of state.switches) {
            drawSwitch(ctx, state, railwaySwitch);
        }

        for (const signal of state.signals) {
            drawSignal(ctx, state, signal);
        }

        drawPlatforms(ctx, state);

        for (const train of state.trains) {

            if (train.status === "running" ||
                train.status === "waiting") {

                drawTrain(ctx, state, train, time);

            }

        }

        drawCollision(ctx, state);

        updateHUD(state);

    } catch (error) {

        console.error("Megjelenítési hiba:", error);

    }

}
