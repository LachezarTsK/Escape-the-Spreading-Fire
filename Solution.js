
/**
 * @param {number[][]} grid
 * @return {number}
 */
var maximumMinutes = function (grid) {
    this.GRASS = 0;
    this.FIRE = 1;
    this.WALL = 2;
    this.MAX_TIME = 2 * Math.pow(10, 4);
    this.CAN_WAIT_UNLIMITED_TIME = Math.pow(10, 9);
    this.NOT_POSSIBLE_TO_REACH_GOAL = -1;
    this.MOVES = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    this.initialFirePoints = [];
    this.currentGrid = [];
    this.personLatestSteps = [];
    this.ID_personLatestSteps = 0;
    this.blockedPointsOnPersonLatestSteps = 0;
    this.rows = grid.length;
    this.columns = grid[0].length;

    recordInitialFirePoints(grid);
    return findMaximumPossibleWaitingTimeAtInitialPosition(grid);
};

/**
 * @param {number[][]} grid
 * @return {number}
 */
function findMaximumPossibleWaitingTimeAtInitialPosition(grid) {
    let lowerLimit = 0;
    let upperLimit = this.MAX_TIME;
    let maximumPossibleWaitingTime = this.NOT_POSSIBLE_TO_REACH_GOAL;

    while (lowerLimit <= upperLimit) {
        let time = lowerLimit + Math.floor((upperLimit - lowerLimit) / 2);
        if (goalCanBeReached(grid, time)) {
            maximumPossibleWaitingTime = Math.max(maximumPossibleWaitingTime, time);
            lowerLimit = time + 1;
        } else {
            upperLimit = time - 1;
        }
    }
    return (maximumPossibleWaitingTime !== this.MAX_TIME) ? maximumPossibleWaitingTime : this.CAN_WAIT_UNLIMITED_TIME;
}

/**
 * @param {number[][]} grid
 * @param {number} time
 * @return {boolean}
 */
function goalCanBeReached(grid, time) {
    cloneInitialGridForTheNextSearch(grid);
    const fireQueue = new Queue();
    initiallySpreadFireForGivenTime(fireQueue, time);
    if (this.currentGrid[0][0] === this.FIRE) {
        return false;
    }

    const personQueue = new Queue();
    personQueue.enqueue(new Point(0, 0));
    this.ID_personLatestSteps = 1;
    this.personLatestSteps = Array.from(new Array(this.rows), () => new Array(this.columns).fill(0));
    this.personLatestSteps[0][0] = this.ID_personLatestSteps;

    while (!personQueue.isEmpty() || !fireQueue.isEmpty()) {

        let fireUpdate = false;
        let initalUpdate = false;
        ++this.ID_personLatestSteps;
        updateGrid(personQueue, fireUpdate, initalUpdate);
        if (this.personLatestSteps[this.rows - 1][this.columns - 1] === this.ID_personLatestSteps) {
            return true;
        }

        fireUpdate = true;
        initalUpdate = false;
        this.blockedPointsOnPersonLatestSteps = 0;
        updateGrid(fireQueue, fireUpdate, initalUpdate);
        if (this.blockedPointsOnPersonLatestSteps === personQueue.size()) {
            return false;
        }
    }
    return false;
}

/**
 * @param {Queue of Points} fireQueue
 * @param {number} time
 * @return {void}
 */
function initiallySpreadFireForGivenTime(fireQueue, time) {
    for (let point of this.initialFirePoints) {
        fireQueue.enqueue(point);
    }
    let fireUpdate = true;
    let initalUpdate = true;
    let countMinutes = 0;
    while (!fireQueue.isEmpty() && countMinutes < time) {
        countMinutes++;
        updateGrid(fireQueue, fireUpdate, initalUpdate);
    }
}

/**
 * @param {Queue of Points} queue
 * @param {boolean} fireUpdate
 * @param {boolean} initalUpdate
 * @return {void}
 */
function updateGrid(queue, fireUpdate, initalUpdate) {
    let size = queue.size();
    while (size-- > 0) {

        const point = queue.dequeue();
        for (let move of this.MOVES) {
            const nextRow = point.row + move[0];
            const nextColumn = point.column + move[1];

            if (isInGrid(nextRow, nextColumn) && this.currentGrid[nextRow][nextColumn] === this.GRASS) {

                if (fireUpdate) {
                    queue.enqueue(new Point(nextRow, nextColumn));
                    this.currentGrid[nextRow][nextColumn] = this.FIRE;
                    this.blockedPointsOnPersonLatestSteps +=
                            (!initalUpdate && this.personLatestSteps[nextRow][nextColumn] === this.ID_personLatestSteps) ? 1 : 0;
                } else if (this.personLatestSteps[nextRow][nextColumn] === this.GRASS) {
                    queue.enqueue(new Point(nextRow, nextColumn));
                    this.personLatestSteps[nextRow][nextColumn] = this.ID_personLatestSteps;
                }
            }
        }
    }
}

/**
 * @param {number[][]} grid
 * @return {void}
 */
function recordInitialFirePoints(grid) {
    this.initialFirePoints = [];
    for (let r = 0; r < this.rows; ++r) {
        for (let c = 0; c < this.columns; ++c) {
            if (grid[r][c] === this.FIRE) {
                this.initialFirePoints.push(new Point(r, c));
            }
        }
    }
}

/**
 * @param {number} row
 * @param {number} column
 * @return {boolean}
 */
function isInGrid(row, column) {
    return row >= 0 && row < this.rows && column >= 0 && column < this.columns;
}

/**
 * @param {number[][]} grid
 * @return {void}
 */
function cloneInitialGridForTheNextSearch(grid) {
    this.currentGrid = Array.from(new Array(this.rows), () => new Array(this.columns));
    for (let r = 0; r < rows; ++r) {
        this.currentGrid[r] = Array.from(grid[r]);
    }
}

/**
 * @param {number} row
 * @param {number} column
 */
function Point(row, column) {
    this.row = row;
    this.column = column;
}
