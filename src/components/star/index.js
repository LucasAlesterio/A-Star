import Heap from 'heap';
import Instance from './instance';
import Node from './node';
var nextInstanceId = 1;
const CLOSED_LIST = 0;
const OPEN_LIST = 1;
var Direction = {}
Direction.TOP = 'TOP'
Direction.TOP_RIGHT = 'TOP_RIGHT'
Direction.RIGHT = 'RIGHT'
Direction.BOTTOM_RIGHT = 'BOTTOM_RIGHT'
Direction.BOTTOM = 'BOTTOM'
Direction.BOTTOM_LEFT = 'BOTTOM_LEFT'
Direction.LEFT = 'LEFT'
Direction.TOP_LEFT = 'TOP_LEFT'

export default class AStar {
    constructor() {
            var STRAIGHT_COST = 1.0;
            var DIAGONAL_COST = 1.4;
            var syncEnabled = false;
            var pointsToAvoid = {};
            var collisionGrid;
            var costMap = {};
            var pointsToCost = {};
            var directionalConditions = {};
            var allowCornerCutting = true;
            var iterationsSoFar;
            var instances = {};
            var instanceQueue = [];
            var iterationsPerCalculation = Number.MAX_VALUE;
            var acceptableTiles;
            var diagonalsEnabled = false;
            
            var coordinateToNode = function(instance, x, y, parent, cost) {
                if (instance.nodeHash[y] !== undefined) {
                    if (instance.nodeHash[y][x] !== undefined) {
                        return instance.nodeHash[y][x];
                    }
                } else {
                    instance.nodeHash[y] = {};
                }
                var simpleDistanceToTarget = getDistance(x, y, instance.endX, instance.endY);
                if (parent!==null) {
                    var costSoFar = parent.costSoFar + cost;
                } else {
                    costSoFar = 0;
                }
                var node = new Node(parent,x,y,costSoFar,simpleDistanceToTarget);
                instance.nodeHash[y][x] = node;
                return node;
            };
            var getDistance = function(x1,y1,x2,y2) {
                var dx = 0;
                var dy = 0; 
                if (diagonalsEnabled) {
                    // Octile distance
                    dx = Math.abs(x1 - x2);
                    dy = Math.abs(y1 - y2);
                    if (dx < dy) {
                        return DIAGONAL_COST * dx + dy;
                    } else {
                        return DIAGONAL_COST * dy + dx;
                    }
                } else {
                    // Manhattan distance
                    dx = Math.abs(x1 - x2);
                    dy = Math.abs(y1 - y2);
                    return (dx + dy);
                }
            };
            var checkAdjacentNode = function(instance, searchNode, x, y, cost) {
                var adjacentCoordinateX = searchNode.x+x;
                var adjacentCoordinateY = searchNode.y+y;
                if ((pointsToAvoid[adjacentCoordinateY] === undefined ||
                    pointsToAvoid[adjacentCoordinateY][adjacentCoordinateX] === undefined) &&
                    isTileWalkable(collisionGrid, acceptableTiles, adjacentCoordinateX, adjacentCoordinateY, searchNode)) {
                    var node = coordinateToNode(instance, adjacentCoordinateX,
                        adjacentCoordinateY, searchNode, cost);
        
                    if (node.list === undefined) {
                        node.list = OPEN_LIST;
                        instance.openList.push(node);
                    } else if (searchNode.costSoFar + cost < node.costSoFar) {
                        node.costSoFar = searchNode.costSoFar + cost;
                        node.parent = searchNode;
                        instance.openList.updateItem(node);
                    }
                }
            };
            var isTileWalkable = function(collisionGrid, acceptableTiles, x, y, sourceNode) {
                var directionalCondition = directionalConditions[y] && directionalConditions[y][x];
                if (directionalCondition) {
                    var direction = calculateDirection(sourceNode.x - x, sourceNode.y - y)
                    var directionIncluded = function () {
                        for (var i = 0; i < directionalCondition.length; i++) {
                            if (directionalCondition[i] === direction) return true
                        }
                        return false
                    }
                    if (!directionIncluded()) return false
                }
                for (var i = 0; i < acceptableTiles.length; i++) {
                    if (collisionGrid[y][x] === acceptableTiles[i]) {
                        return true;
                    }
                }
        
                return false;
            };
            var calculateDirection = function (diffX, diffY) {
                if (diffX === 0 && diffY === -1) return Direction.TOP
                else if (diffX === 1 && diffY === -1) return Direction.TOP_RIGHT
                else if (diffX === 1 && diffY === 0) return Direction.RIGHT
                else if (diffX === 1 && diffY === 1) return Direction.BOTTOM_RIGHT
                else if (diffX === 0 && diffY === 1) return Direction.BOTTOM
                else if (diffX === -1 && diffY === 1) return Direction.BOTTOM_LEFT
                else if (diffX === -1 && diffY === 0) return Direction.LEFT
                else if (diffX === -1 && diffY === -1) return Direction.TOP_LEFT
                throw new Error('These differences are not valid: ' + diffX + ', ' + diffY)
            };
            var getTileCost = function(x, y) {
                return (pointsToCost[y] && pointsToCost[y][x]) || costMap[collisionGrid[y][x]]
            };

            this.setGrid = function (grid) {
                collisionGrid = grid;

                //Setup cost map
                for (var y = 0; y < collisionGrid.length; y++) {
                    for (var x = 0; x < collisionGrid[0].length; x++) {
                        if (!costMap[collisionGrid[y][x]]) {
                            costMap[collisionGrid[y][x]] = 1;
                        }
                    }
                }
            };
            this.setAcceptableTiles = function (tiles) {
                if (tiles instanceof Array) {
                    // Array
                    acceptableTiles = tiles;
                } else if (!isNaN(parseFloat(tiles)) && isFinite(tiles)) {
                    // Number
                    acceptableTiles = [tiles];
                }
            };
            this.findPath = function (startX, startY, endX, endY, callback) {
                // Wraps the callback for sync vs async logic
                var callbackWrapper = function (result) {
                    if (syncEnabled) {
                        callback(result);
                    } else {
                        setTimeout(function () {
                            callback(result);
                        });
                    }
                };

                // No acceptable tiles were set
                if (acceptableTiles === undefined) {
                    throw new Error("You can't set a path without first calling setAcceptableTiles() on EasyStar.");
                }
                // No grid was set
                if (collisionGrid === undefined) {
                    throw new Error("You can't set a path without first calling setGrid() on EasyStar.");
                }

                // Start or endpoint outside of scope.
                if (startX < 0 || startY < 0 || endX < 0 || endY < 0 ||
                    startX > collisionGrid[0].length - 1 || startY > collisionGrid.length - 1 ||
                    endX > collisionGrid[0].length - 1 || endY > collisionGrid.length - 1) {
                    throw new Error("Your start or end point is outside the scope of your grid.");
                }

                // Start and end are the same tile.
                if (startX === endX && startY === endY) {
                    callbackWrapper([]);
                    return;
                }

                // End point is not an acceptable tile.
                var endTile = collisionGrid[endY][endX];
                var isAcceptable = false;
                for (var i = 0; i < acceptableTiles.length; i++) {
                    if (endTile === acceptableTiles[i]) {
                        isAcceptable = true;
                        break;
                    }
                }

                if (isAcceptable === false) {
                    callbackWrapper(null);
                    return;
                }

                // Create the instance
                var instance = new Instance();
                instance.openList = new Heap(function (nodeA, nodeB) {
                    return nodeA.bestGuessDistance() - nodeB.bestGuessDistance();
                });
                instance.isDoneCalculating = false;
                instance.nodeHash = {};
                instance.startX = startX;
                instance.startY = startY;
                instance.endX = endX;
                instance.endY = endY;
                instance.callback = callbackWrapper;

                instance.openList.push(coordinateToNode(instance, instance.startX,
                    instance.startY, null, STRAIGHT_COST));

                var instanceId = nextInstanceId++;
                instances[instanceId] = instance;
                instanceQueue.push(instanceId);
                return instanceId;
            };
            this.setIterationsPerCalculation = function(iterations) {
                iterationsPerCalculation = iterations;
            };
            this.calculate = function() {
                if (instanceQueue.length === 0 || collisionGrid === undefined || acceptableTiles === undefined) {
                    return;
                }
                for (iterationsSoFar = 0; iterationsSoFar < iterationsPerCalculation; iterationsSoFar++) {
                    if (instanceQueue.length === 0) {
                        return;
                    }
        
                    if (syncEnabled) {
                        // If this is a sync instance, we want to make sure that it calculates synchronously.
                        iterationsSoFar = 0;
                    }
        
                    var instanceId = instanceQueue[0];
                    var instance = instances[instanceId];
                    if (typeof instance == 'undefined') {
                        // This instance was cancelled
                        instanceQueue.shift();
                        continue;
                    }
        
                    // Couldn't find a path.
                    if (instance.openList.size() === 0) {
                        instance.callback(null);
                        delete instances[instanceId];
                        instanceQueue.shift();
                        continue;
                    }
        
                    var searchNode = instance.openList.pop();
        
                    // Handles the case where we have found the destination
                    if (instance.endX === searchNode.x && instance.endY === searchNode.y) {
                        var path = [];
                        path.push({x: searchNode.x, y: searchNode.y});
                        var parent = searchNode.parent;
                        while (parent!=null) {
                            path.push({x: parent.x, y:parent.y});
                            parent = parent.parent;
                        }
                        path.reverse();
                        var ip = path;
                        instance.callback(ip);
                        delete instances[instanceId];
                        instanceQueue.shift();
                        continue;
                    }
        
                    searchNode.list = CLOSED_LIST;
        
                    if (searchNode.y > 0) {
                        checkAdjacentNode(instance, searchNode,
                            0, -1, STRAIGHT_COST * getTileCost(searchNode.x, searchNode.y-1));
                    }
                    if (searchNode.x < collisionGrid[0].length-1) {
                        checkAdjacentNode(instance, searchNode,
                            1, 0, STRAIGHT_COST * getTileCost(searchNode.x+1, searchNode.y));
                    }
                    if (searchNode.y < collisionGrid.length-1) {
                        checkAdjacentNode(instance, searchNode,
                            0, 1, STRAIGHT_COST * getTileCost(searchNode.x, searchNode.y+1));
                    }
                    if (searchNode.x > 0) {
                        checkAdjacentNode(instance, searchNode,
                            -1, 0, STRAIGHT_COST * getTileCost(searchNode.x-1, searchNode.y));
                    }
                    if (diagonalsEnabled) {
                        if (searchNode.x > 0 && searchNode.y > 0) {
        
                            if (allowCornerCutting ||
                                (isTileWalkable(collisionGrid, acceptableTiles, searchNode.x, searchNode.y-1, searchNode) &&
                                isTileWalkable(collisionGrid, acceptableTiles, searchNode.x-1, searchNode.y, searchNode))) {
        
                                checkAdjacentNode(instance, searchNode,
                                    -1, -1, DIAGONAL_COST * getTileCost(searchNode.x-1, searchNode.y-1));
                            }
                        }
                        if (searchNode.x < collisionGrid[0].length-1 && searchNode.y < collisionGrid.length-1) {
        
                            if (allowCornerCutting ||
                                (isTileWalkable(collisionGrid, acceptableTiles, searchNode.x, searchNode.y+1, searchNode) &&
                                isTileWalkable(collisionGrid, acceptableTiles, searchNode.x+1, searchNode.y, searchNode))) {
        
                                checkAdjacentNode(instance, searchNode,
                                    1, 1, DIAGONAL_COST * getTileCost(searchNode.x+1, searchNode.y+1));
                            }
                        }
                        if (searchNode.x < collisionGrid[0].length-1 && searchNode.y > 0) {
        
                            if (allowCornerCutting ||
                                (isTileWalkable(collisionGrid, acceptableTiles, searchNode.x, searchNode.y-1, searchNode) &&
                                isTileWalkable(collisionGrid, acceptableTiles, searchNode.x+1, searchNode.y, searchNode))) {
        
                                checkAdjacentNode(instance, searchNode,
                                    1, -1, DIAGONAL_COST * getTileCost(searchNode.x+1, searchNode.y-1));
                            }
                        }
                        if (searchNode.x > 0 && searchNode.y < collisionGrid.length-1) {
        
                            if (allowCornerCutting ||
                                (isTileWalkable(collisionGrid, acceptableTiles, searchNode.x, searchNode.y+1, searchNode) &&
                                isTileWalkable(collisionGrid, acceptableTiles, searchNode.x-1, searchNode.y, searchNode))) {
        
                                checkAdjacentNode(instance, searchNode,
                                    -1, 1, DIAGONAL_COST * getTileCost(searchNode.x-1, searchNode.y+1));
                            }
                        }
                    }
        
                }
            };
        
    }
}