import React,{useEffect, useState} from 'react';
import Node from './components/node'
import AStar from './components/star';

export default function App(){
  const [list,setList] = useState([]);
  const [finalPath,setFinalPath] = useState([]);
  const [size,setSize] = useState(25);
  const [grid,setGrid] = useState([]);
  const [stateButton,setStateButton] = useState(false);
  const [initial,setInitial] = useState({x:null,y:null});
  const [final,setFinal] = useState({x:null,y:null});
  const [wall,setWall] = useState(false);

  function find(){
    if(final.x !== null && initial.x !== null){
      var easystar = new AStar();
      easystar.setGrid(grid);
      easystar.setAcceptableTiles([0]);
      easystar.findPath(initial.y, initial.x, final.y, final.x, function( path ) {
        if (path === null) {
          alert("Nenhum caminho encontrado!");
          setFinal({x:null,y:null});
          setInitial({x:null,y:null});
          setFinalPath([]);
        } else {
          setFinalPath(path);
        }
      });
      easystar.setIterationsPerCalculation(10000);
      easystar.calculate();
    }else{
      alert("Defina as posições iniciais!");
    }
  }

  useEffect(() => {
    function testPath(x,y,m){
      if(initial.x === x && initial.y === y){
        return 3;
      }
      if(final.x === x && final.y === y){
        return 4;
      }
      for(var i = 0; i < finalPath.length ; i++){
        if(finalPath[i].y === x && finalPath[i].x === y){
          return 2;
        }
      }
      return m;
    }
    function drawWall(event,coord){
      if((event === 1 || event.event === 1) && wall ){
        if(finalPath.length > 0){
          setFinalPath([]);
        }
        let matrix = grid;
        matrix[coord.x][coord.y] = 1;
        let row = [];
        let rows = [];
        for(var i = 0; i < matrix.length ; i++){
          row = [];
          for(var j = 0;j < matrix.reduce((x, y) => Math.max(x, y.length), 0);j++){
              row.push(
              <Node
              key={String(i).concat(String(j))} 
              onClick={(coord)=>
                !stateButton? 
                setInitial({x:coord.x, y:coord.y}) 
                : setFinal({x:coord.x, y:coord.y})
              }
              onMouseEnter={({event,coord})=>drawWall(event,coord)}
              type={testPath(i,j,grid[i][j])} 
              coord={{x:i,y:j}}
              />)
          }
          rows.push(<div className="containerRow" key={i}>{row}</div>);
        }
        setGrid(matrix);
        setList(rows)
      }
    }
    function markPosition(coord){
      if(grid[coord.x][coord.y] !== 1){
      if(!stateButton){
        
        setInitial({x:coord.x, y:coord.y}) 
      }else{
        setFinal({x:coord.x, y:coord.y})
      }
    }
    }
    function listNodes(){
      let row = [];
      let rows = [];
      for(var i = 0; i < grid.length ; i++){
        row = [];
        for(var j = 0;j < grid.reduce((x, y) => Math.max(x, y.length), 0);j++){
            row.push(
            <Node
            key={String(i).concat(String(j))} 
            onClick={(coord)=> markPosition(coord)}
            onMouseEnter={({event,coord})=>drawWall(event,coord)}
            type={testPath(i,j,grid[i][j])} 
            coord={{x:i,y:j}}
            />)
        }
        rows.push(<div className="containerRow" key={i}>{row}</div>);
      }
      setList(rows)
    }
      listNodes();
  },[grid,finalPath,initial,final,stateButton,wall])
  
  function createGrid(){
    if(size > 100){
      setSize(25);
      alert('Escolha um valor abaixo de 100!');
      return null
    }
    setFinal({x:null,y:null});
    setInitial({x:null,y:null});
    setFinalPath([]);
    const n = parseInt(size);
    let m = new Array(n);
    for(var i = 0; i < n ; i++){
      m[i] = new Array(n);
      for(var j = 0;j < n ;j++){
        let rand = Math.random();
        if(rand > 0.65){
          m[i][j] = 1;
        }else{
          m[i][j] = 0;
        }
      }
    }
    setGrid(m);
  }
  if(grid.length === 0){
    createGrid();
  }
  function createDefault(){
    if(size > 100){
      setSize(25);
      alert('Escolha um valor abaixo de 100!');
      return null
    }
    setFinal({x:null,y:null});
    setInitial({x:null,y:null});
    setFinalPath([]);
    const n = parseInt(size);
    let m = new Array(n);
    for(var i = 0; i < n ; i++){
      m[i] = new Array(n);
      for(var j = 0;j < n ;j++){
          m[i][j] = 0;
        }
      }
    setGrid(m);
  }
    return (
      <div className="container">
        <div className="containerNodes">
          {list || null}
        </div>
        <div className="menu">
          <label htmlFor="sizeMatrix">Tamanho da matriz NxN:</label>
          <input id="sizeMatrix" type="number" value={size} onChange={(e)=>setSize(e.target.value)}/>
          <button className="buttonMenu" onClick={()=>createGrid()}> Aleatório </button>
          <button className="buttonMenu" onClick={()=>find()}> Buscar </button>
          <button className="buttonMenu" style={!stateButton ? {backgroundColor:'#282828'}:null} onClick={()=>setStateButton(false)}>Inicio</button>
          <button className="buttonMenu" style={stateButton ? {backgroundColor:'#282828'}:null} onClick={()=>setStateButton(true)}>Final</button>
          <button className="buttonMenu" onClick={()=>createDefault()}> Limpar </button>
          <button className="buttonMenu" style={wall ? {backgroundColor:'#282828'}:null} onClick={()=>setWall(!wall)}>Parede</button>
        </div>
      </div>
    );
  }