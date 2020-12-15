// Lucas Alesterio Marques Vieira  11621ECP016
//Importações
import Heap from 'heap';
import Instance from './instance';
import Node from './node';
//Declarações publicas
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

//Classe AStar
export default class AStar {
    //Construtor da classe
    constructor(diagonal,corner) {
            var STRAIGHT_COST = 1.0;
            var DIAGONAL_COST = 1.4;
            var pointsToAvoid = {};
            var collisionGrid;
            var costMap = {};
            var allowCornerCutting = corner;
            var instances = {};
            var instanceQueue = [];
            var iterationsPerCalculation = Number.MAX_VALUE;
            var acceptableTiles;
            var diagonalsEnabled = diagonal;
            //Retorna o proximo "node"
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
            //Retorna distancia entre dois pontos
            var getDistance = function(x1,y1,x2,y2) {
                var dx = 0;
                var dy = 0; 
                if (diagonalsEnabled) {
                    dx = Math.abs(x1 - x2);
                    dy = Math.abs(y1 - y2);
                    if (dx < dy) {
                        return DIAGONAL_COST * dx + dy;
                    } else {
                        return DIAGONAL_COST * dy + dx;
                    }
                } else {
                    dx = Math.abs(x1 - x2);
                    dy = Math.abs(y1 - y2);
                    return (dx + dy);
                }
            };
            // Teste para proximo "node"
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
            // Teste individual se o "node" esta livre
            var isTileWalkable = function(collisionGrid, acceptableTiles, x, y) {
                for (var i = 0; i < acceptableTiles.length; i++) {
                    if (collisionGrid[y][x] === acceptableTiles[i]) {
                        return true;
                    }
                }
                return false;
            };
            // Retorna o custo
            var getTileCost = function(x, y) {
                return costMap[collisionGrid[y][x]];
            };
            //Definindo matriz
            this.setGrid = function (grid) {
                collisionGrid = grid;
                //Definindo custo
                for (var y = 0; y < collisionGrid.length; y++) {
                    for (var x = 0; x < collisionGrid[0].length; x++) {
                        if (!costMap[collisionGrid[y][x]]) {
                            costMap[collisionGrid[y][x]] = 1;
                        }
                    }
                }
            };
            //Definindo os "nodes" livres
            this.setAcceptableTiles = function (tiles) {
                if (tiles instanceof Array) {
                    acceptableTiles = tiles;
                } else if (!isNaN(parseFloat(tiles)) && isFinite(tiles)) {
                    acceptableTiles = [tiles];
                }
            };
            this.findPath = function (startX, startY, endX, endY, callback) {
                // Setando função de retorno
                var callbackWrapper = function (result) {
                    setTimeout(function () {
                        callback(result);
                    });
                };

                // Percorre o array de "tiles" livres testando se é aceitavel ou não
                var endTile = collisionGrid[endY][endX];
                var isAcceptable = false;
                for (var i = 0; i < acceptableTiles.length; i++) {
                    if (endTile === acceptableTiles[i]) {
                        isAcceptable = true;
                        break;
                    }
                }
                // Caso não seja aceitavél retorna null na função de retorno
                if (isAcceptable === false) {
                    callbackWrapper(null);
                    return;
                }
                // Criando uma instancia
                var instance = new Instance();
                // Criando uma heap para calculo do melhor "palpite" de menor distacia
                instance.openList = new Heap(function (nodeA, nodeB) {
                    return nodeA.bestGuessDistance() - nodeB.bestGuessDistance();
                });
                //setando condições iniciais
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
            // Definindo o numero mázimo de interações por calculo
            this.setIterationsPerCalculation = function(iterations) {
                iterationsPerCalculation = iterations;
            };
            // Calcula menor rota
            this.calculate = function() {
                for (let iterationsSoFar = 0; iterationsSoFar < iterationsPerCalculation; iterationsSoFar++) {
                    if (instanceQueue.length === 0) {
                        return;
                    }
        
                    var instanceId = instanceQueue[0];
                    var instance = instances[instanceId];
                    if (typeof instance == 'undefined') {
                        // Instancia cancelada
                        instanceQueue.shift();
                        continue;
                    }
        
                    // Caminho não encontrado
                    if (instance.openList.size() === 0) {
                        instance.callback(null);
                        delete instances[instanceId];
                        instanceQueue.shift();
                        continue;
                    }
        
                    var searchNode = instance.openList.pop();
        
                    // Teste para quando atingir o obejetivo
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
                    //Testes para a possivel direção
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
                    //Testes para as diagonais caso esteja ativada
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