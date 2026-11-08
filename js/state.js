/* ==========================================
   1. PÁLYÁK ADATAI
========================================== */

const LEVELS = {

    1: {
        name: "Kitérő vágány jelzőkkel",
        difficulty: "Könnyű",

        nodes: [
            { id: "entry1", x: 70, y: 325, type: "entry" },
            { id: "signal1", x: 250, y: 325, type: "signal" },
            { id: "switch1", x: 380, y: 325, type: "switch" },
            { id: "switch2", x: 570, y: 190, type: "switch" },
            { id: "junction1", x: 570, y: 460, type: "junction" },
            { id: "platform1", x: 1050, y: 190, type: "platform" },
            { id: "platform2", x: 1050, y: 460, type: "platform" }
        ],

        edges: [
            { id: "e1", a: "entry1", b: "signal1" },
            { id: "e2", a: "signal1", b: "switch1" },
            { id: "e3", a: "switch1", b: "switch2" },
            { id: "e4", a: "switch1", b: "junction1" },
            { id: "e5", a: "switch2", b: "platform1" },
            { id: "e6", a: "switch2", b: "junction1" },
            { id: "e7", a: "junction1", b: "platform2" }
        ],

        switches: [
            {
                id: "switch1",
                edgeIds: ["e3", "e4"],
                activeIndex: 0
            },
            {
                id: "switch2",
                edgeIds: ["e5", "e6"],
                activeIndex: 0
            }
        ],

        signals: [
            { id: "signal1", nodeId: "signal1", green: false },
            { id: "signal2", nodeId: "switch2", green: false },
            { id: "signal3", nodeId: "junction1", green: false }
        ],

        platforms: [
            {
                id: "platform1",
                nodeId: "platform1",
                name: "1. Vágány",
                color: "#e34f55"
            },
            {
                id: "platform2",
                nodeId: "platform2",
                name: "2. Vágány",
                color: "#5684ed"
            }
        ],

        schedule: [
            {
                id: "T1",
                name: "Személyvonat 101",
                color: "#e34f55",
                origin: "entry1",
                destination: "platform1",
                speed: 95,
                spawnAt: 2
            },
            {
                id: "T2",
                name: "Személyvonat 202",
                color: "#5684ed",
                origin: "entry1",
                destination: "platform2",
                speed: 85,
                spawnAt: 13
            },
            {
                id: "T3",
                name: "Gyorsvonat 303",
                color: "#e34f55",
                origin: "entry1",
                destination: "platform1",
                speed: 115,
                spawnAt: 27
            },
            {
                id: "T4",
                name: "Tehervonat 404",
                color: "#5684ed",
                origin: "entry1",
                destination: "platform2",
                speed: 65,
                spawnAt: 43
            }
        ]
    },


    /* ======================================
       2. PÁLYA - RENDEZŐPÁLYAUDVAR
    ====================================== */

    2: {
        name: "Rendező-pályaudvar",
        difficulty: "Közepes",

        nodes: [
            { id: "entry1", x: 60, y: 180, type: "entry" },
            { id: "signal1", x: 210, y: 180, type: "signal" },
            { id: "switch1", x: 350, y: 180, type: "switch" },
            { id: "junction1", x: 520, y: 100, type: "junction" },
            { id: "junction2", x: 520, y: 300, type: "junction" },
            { id: "switch2", x: 700, y: 100, type: "switch" },
            { id: "switch3", x: 700, y: 300, type: "switch" },
            { id: "platform1", x: 1080, y: 100, type: "platform" },
            { id: "platform2", x: 1080, y: 300, type: "platform" },
            { id: "platform3", x: 1080, y: 500, type: "platform" },
            { id: "entry2", x: 60, y: 500, type: "entry" },
            { id: "signal2", x: 210, y: 500, type: "signal" },
            { id: "junction3", x: 520, y: 500, type: "junction" }
        ],

        edges: [
            { id: "e1", a: "entry1", b: "signal1" },
            { id: "e2", a: "signal1", b: "switch1" },
            { id: "e3", a: "switch1", b: "junction1" },
            { id: "e4", a: "switch1", b: "junction2" },
            { id: "e5", a: "junction1", b: "switch2" },
            { id: "e6", a: "junction2", b: "switch3" },
            { id: "e7", a: "switch2", b: "platform1" },
            { id: "e8", a: "switch2", b: "junction2" },
            { id: "e9", a: "junction2", b: "junction3" },
            { id: "e10", a: "junction3", b: "switch3" },
            { id: "e11", a: "switch3", b: "platform2" },
            { id: "e12", a: "switch3", b: "platform3" },
            { id: "e13", a: "entry2", b: "signal2" },
            { id: "e14", a: "signal2", b: "junction3" }
        ],

        switches: [
            { id: "switch1", edgeIds: ["e3", "e4"], activeIndex: 0 },
            { id: "switch2", edgeIds: ["e7", "e8"], activeIndex: 0 },
            { id: "switch3", edgeIds: ["e11", "e12"], activeIndex: 0 }
        ],

        signals: [
            { id: "signal1", nodeId: "signal1", green: false },
            { id: "signal2", nodeId: "signal2", green: false },
            { id: "signal3", nodeId: "junction1", green: false },
            { id: "signal4", nodeId: "junction3", green: false }
        ],

        platforms: [
            { id: "platform1", nodeId: "platform1", name: "1. Vágány", color: "#e34f55" },
            { id: "platform2", nodeId: "platform2", name: "2. Vágány", color: "#5684ed" },
            { id: "platform3", nodeId: "platform3", name: "3. Vágány", color: "#43b982" }
        ],

        schedule: [
            {
                id: "T1",
                name: "Személyvonat 101",
                color: "#e34f55",
                origin: "entry1",
                destination: "platform1",
                speed: 95,
                spawnAt: 2
            },
            {
                id: "T2",
                name: "Tehervonat 202",
                color: "#5684ed",
                origin: "entry2",
                destination: "platform2",
                speed: 65,
                spawnAt: 12
            },
            {
                id: "T3",
                name: "Gyorsvonat 303",
                color: "#43b982",
                origin: "entry1",
                destination: "platform3",
                speed: 120,
                spawnAt: 22
            },
            {
                id: "T4",
                name: "Személyvonat 404",
                color: "#5684ed",
                origin: "entry2",
                destination: "platform2",
                speed: 85,
                spawnAt: 34
            },
            {
                id: "T5",
                name: "Tehervonat 505",
                color: "#e34f55",
                origin: "entry1",
                destination: "platform1",
                speed: 70,
                spawnAt: 48
            }
        ]
    },


    /* ======================================
       3. PÁLYA - FEJÁLLOMÁSI CSÚCSFORGALOM
    ====================================== */

    3: {
        name: "Fejpályaudvari csúcsforgalom",
        difficulty: "Nehéz",

        nodes: [
            { id: "entry1", x: 60, y: 140, type: "entry" },
            { id: "signal1", x: 220, y: 140, type: "signal" },
            { id: "switch1", x: 360, y: 140, type: "switch" },
            { id: "junction1", x: 520, y: 80, type: "junction" },
            { id: "junction2", x: 520, y: 270, type: "junction" },
            { id: "switch2", x: 700, y: 80, type: "switch" },
            { id: "switch3", x: 700, y: 270, type: "switch" },
            { id: "platform1", x: 1080, y: 80, type: "platform" },
            { id: "platform2", x: 1080, y: 270, type: "platform" },
            { id: "platform3", x: 1080, y: 440, type: "platform" },
            { id: "entry2", x: 60, y: 550, type: "entry" },
            { id: "signal2", x: 220, y: 550, type: "signal" },
            { id: "switch4", x: 360, y: 550, type: "switch" },
            { id: "junction3", x: 520, y: 440, type: "junction" },
            { id: "platform4", x: 850, y: 550, type: "platform" }
        ],

        edges: [
            { id: "e1", a: "entry1", b: "signal1" },
            { id: "e2", a: "signal1", b: "switch1" },
            { id: "e3", a: "switch1", b: "junction1" },
            { id: "e4", a: "switch1", b: "junction2" },
            { id: "e5", a: "junction1", b: "switch2" },
            { id: "e6", a: "junction2", b: "switch2" },
            { id: "e7", a: "switch2", b: "platform1" },
            { id: "e8", a: "switch2", b: "junction2" },
            { id: "e9", a: "junction2", b: "switch3" },
            { id: "e10", a: "switch3", b: "platform2" },
            { id: "e11", a: "switch3", b: "platform3" },
            { id: "e12", a: "entry2", b: "signal2" },
            { id: "e13", a: "signal2", b: "switch4" },
            { id: "e14", a: "switch4", b: "junction3" },
            { id: "e15", a: "switch4", b: "junction2" },
            { id: "e16", a: "junction3", b: "switch3" },
            { id: "e17", a: "junction3", b: "platform4" }
        ],

        switches: [
            { id: "switch1", edgeIds: ["e3", "e4"], activeIndex: 0 },
            { id: "switch2", edgeIds: ["e7", "e8"], activeIndex: 0 },
            { id: "switch3", edgeIds: ["e10", "e11"], activeIndex: 0 },
            { id: "switch4", edgeIds: ["e14", "e15"], activeIndex: 0 }
        ],

        signals: [
            { id: "signal1", nodeId: "signal1", green: false },
            { id: "signal2", nodeId: "signal2", green: false },
            { id: "signal3", nodeId: "junction1", green: false },
            { id: "signal4", nodeId: "junction2", green: false },
            { id: "signal5", nodeId: "junction3", green: false }
        ],

        platforms: [
            { id: "platform1", nodeId: "platform1", name: "1. Vágány", color: "#e34f55" },
            { id: "platform2", nodeId: "platform2", name: "2. Vágány", color: "#5684ed" },
            { id: "platform3", nodeId: "platform3", name: "3. Vágány", color: "#43b982" },
            { id: "platform4", nodeId: "platform4", name: "4. Vágány", color: "#e8b84c" }
        ],

        schedule: [
            {
                id: "T1",
                name: "Gyorsvonat 101",
                color: "#e34f55",
                origin: "entry1",
                destination: "platform1",
                speed: 120,
                spawnAt: 2
            },
            {
                id: "T2",
                name: "Személyvonat 202",
                color: "#5684ed",
                origin: "entry2",
                destination: "platform2",
                speed: 85,
                spawnAt: 9
            },
            {
                id: "T3",
                name: "Tehervonat 303",
                color: "#43b982",
                origin: "entry1",
                destination: "platform3",
                speed: 65,
                spawnAt: 17
            },
            {
                id: "T4",
                name: "Gyorsvonat 404",
                color: "#e8b84c",
                origin: "entry2",
                destination: "platform4",
                speed: 115,
                spawnAt: 25
            },
            {
                id: "T5",
                name: "Személyvonat 505",
                color: "#e34f55",
                origin: "entry1",
                destination: "platform1",
                speed: 90,
                spawnAt: 34
            },
            {
                id: "T6",
                name: "Tehervonat 606",
                color: "#5684ed",
                origin: "entry2",
                destination: "platform2",
                speed: 70,
                spawnAt: 43
            }
        ]
    }
};


/* ==========================================
   2. JÁTÉKÁLLAPOT LÉTREHOZÁSA
========================================== */

export function createGameState(levelId, playerName) {

    try {

        const level = LEVELS[levelId];

        if (!level) {
            throw new Error("A kiválasztott pálya nem létezik!");
        }

        if (typeof playerName !== "string" || !playerName.trim()) {
            throw new Error("A játékos neve nem lehet üres!");
        }

        const trains = level.schedule.map(train => ({
            ...train,

            status: "scheduled",

            edgeId: null,
            fromNodeId: null,
            toNodeId: null,

            progress: 0,

            brake: false,
            warning: false,

            arrived: false,
            derailed: false
        }));

        return {
            playerName: playerName.trim(),

            levelId,
            levelName: level.name,
            difficulty: level.difficulty,

            nodes: level.nodes.map(node => ({ ...node })),
            edges: level.edges.map(edge => ({ ...edge })),

            switches: level.switches.map(item => ({
                ...item,
                edgeIds: [...item.edgeIds]
            })),

            signals: level.signals.map(signal => ({ ...signal })),

            platforms: level.platforms.map(platform => ({ ...platform })),

            schedule: level.schedule.map(train => ({ ...train })),

            trains,

            elapsedTime: 0,

            arrivedCount: 0,
            errorCount: 0,

            isRunning: false,
            isPaused: false,

            gameOver: false,
            won: false,

            collision: null,

            eventLog: []
        };

    } catch (error) {

        console.error("Játékállapot létrehozási hiba:", error);
        throw error;

    }
}


/* ==========================================
   3. CSOMÓPONTOK ÉS VÁGÁNYOK KERESÉSE
========================================== */

export function getNodeById(state, nodeId) {

    return state.nodes.find(node => node.id === nodeId) ?? null;

}


export function getEdgeById(state, edgeId) {

    return state.edges.find(edge => edge.id === edgeId) ?? null;

}


export function getSwitchById(state, switchId) {

    return state.switches.find(item => item.id === switchId) ?? null;

}


export function getSignalByNode(state, nodeId) {

    return state.signals.find(signal => signal.nodeId === nodeId) ?? null;

}


export function getPlatformById(state, platformId) {

    return state.platforms.find(platform => platform.id === platformId) ?? null;

}


/* ==========================================
   4. KAPCSOLÓDÓ VÁGÁNYOK LEKÉRDEZÉSE
========================================== */

export function getConnectedEdges(state, nodeId) {

    return state.edges.filter(edge =>
        edge.a === nodeId || edge.b === nodeId
    );

}


export function getOtherNode(edge, currentNodeId) {

    if (edge.a === currentNodeId) {
        return edge.b;
    }

    if (edge.b === currentNodeId) {
        return edge.a;
    }

    return null;

}


/* ==========================================
   5. VÁLTÓ ÁLLÁSÁNAK MÓDOSÍTÁSA
========================================== */

export function toggleSwitch(state, switchId) {

    try {

        const railwaySwitch = getSwitchById(state, switchId);

        if (!railwaySwitch) {
            throw new Error("A keresett váltó nem található!");
        }

        railwaySwitch.activeIndex =
            (railwaySwitch.activeIndex + 1) %
            railwaySwitch.edgeIds.length;

        return railwaySwitch.edgeIds[railwaySwitch.activeIndex];

    } catch (error) {

        console.error("Váltóállítási hiba:", error);
        return null;

    }

}


/* ==========================================
   6. FÉNYJELZŐ ÁLLÍTÁSA
========================================== */

export function toggleSignal(state, signalId) {

    try {

        const signal = state.signals.find(
            item => item.id === signalId
        );

        if (!signal) {
            throw new Error("A fényjelző nem található!");
        }

        signal.green = !signal.green;

        return signal.green;

    } catch (error) {

        console.error("Fényjelző-állítási hiba:", error);
        return null;

    }

}


/* ==========================================
   7. KÖVETKEZŐ VÁGÁNY MEGHATÁROZÁSA
========================================== */

export function getNextEdge(state, train, currentNodeId) {

    const connectedEdges = getConnectedEdges(state, currentNodeId);

    const possibleEdges = connectedEdges.filter(edge =>
        edge.id !== train.edgeId
    );

    if (possibleEdges.length === 0) {
        return null;
    }

    const railwaySwitch = getSwitchById(state, currentNodeId);

    if (railwaySwitch) {

        const selectedEdgeId =
            railwaySwitch.edgeIds[railwaySwitch.activeIndex];

        return possibleEdges.find(edge =>
            edge.id === selectedEdgeId
        ) ?? null;

    }

    const destination = train.destination;

    const visited = new Set([currentNodeId]);

    const queue = [{
        nodeId: currentNodeId,
        firstEdge: null
    }];

    while (queue.length > 0) {

        const current = queue.shift();

        if (current.nodeId === destination) {
            return current.firstEdge;
        }

        const edges = getConnectedEdges(state, current.nodeId);

        for (const edge of edges) {

            const nextNode = getOtherNode(edge, current.nodeId);

            if (visited.has(nextNode)) {
                continue;
            }

            visited.add(nextNode);

            queue.push({
                nodeId: nextNode,
                firstEdge: current.firstEdge ?? edge
            });

        }

    }

    return possibleEdges[0] ?? null;

}


/* ==========================================
   8. VONAT KOORDINÁTÁINAK KISZÁMÍTÁSA
========================================== */

export function getTrainPosition(state, train) {

    if (!train.edgeId) {
        return null;
    }

    const edge = getEdgeById(state, train.edgeId);

    if (!edge) {
        return null;
    }

    const fromNode = getNodeById(state, train.fromNodeId);
    const toNode = getNodeById(state, train.toNodeId);

    if (!fromNode || !toNode) {
        return null;
    }

    const progress = Math.max(0, Math.min(1, train.progress));

    return {
        x: fromNode.x + (toNode.x - fromNode.x) * progress,
        y: fromNode.y + (toNode.y - fromNode.y) * progress
    };

}


/* ==========================================
   9. KÉT PONT KÖZÖTTI TÁVOLSÁG
========================================== */

export function calculateDistance(pointA, pointB) {

    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;

    return Math.sqrt(dx * dx + dy * dy);

}


/* ==========================================
   10. ÜTKÖZÉSVIZSGÁLAT
========================================== */

export function checkCollisions(state) {

    const activeTrains = state.trains.filter(train =>
        train.status === "running" &&
        train.edgeId !== null
    );

    const warningDistance = 75;
    const collisionDistance = 24;

    const collisionPairs = [];

    for (const train of activeTrains) {
        train.warning = false;
    }

    for (let i = 0; i < activeTrains.length; i++) {

        for (let j = i + 1; j < activeTrains.length; j++) {

            const trainA = activeTrains[i];
            const trainB = activeTrains[j];

            const positionA = getTrainPosition(state, trainA);
            const positionB = getTrainPosition(state, trainB);

            if (!positionA || !positionB) {
                continue;
            }

            const distance = calculateDistance(
                positionA,
                positionB
            );

            if (distance <= warningDistance) {

                trainA.warning = true;
                trainB.warning = true;

            }

            if (distance <= collisionDistance) {

                collisionPairs.push({
                    trainA: trainA.id,
                    trainB: trainB.id,
                    distance
                });

            }

        }

    }

    if (collisionPairs.length > 0) {

        state.collision = collisionPairs[0];
        state.gameOver = true;
        state.isRunning = false;

        return collisionPairs[0];

    }

    state.collision = null;

    return null;

}


/* ==========================================
   11. ESEMÉNYNAPLÓ FRISSÍTÉSE
========================================== */

export function addEvent(state, message, type = "info") {

    state.eventLog.unshift({
        message,
        type,
        time: state.elapsedTime
    });

    if (state.eventLog.length > 30) {
        state.eventLog.pop();
    }

}


/* ==========================================
   12. SEGÉDFÜGGVÉNY - PÁLYA ADATAI
========================================== */

export function getLevelInfo(levelId) {

    const level = LEVELS[levelId];

    if (!level) {
        return null;
    }

    return {
        id: levelId,
        name: level.name,
        difficulty: level.difficulty,
        trainCount: level.schedule.length,
        switchCount: level.switches.length,
        signalCount: level.signals.length,
        platformCount: level.platforms.length
    };

}
