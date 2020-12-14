/**
 * Represents a single instance of EasyStar.
 * A path that is in the queue to eventually be found.
*/
    export default class Instance{
    constructor() {
        this.pointsToAvoid = {};
        this.startX = 0;
        this.callback = {};
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
        this.nodeHash = {};
        this.openList = {};
    }
};