// Lucas Alesterio Marques Vieira  11621ECP016
import React,{ useEffect, useState } from 'react';
import Node from './components/node'
import AStar from './components/star';

export default function App(){
  const [list,setList] = useState([]);
  const [finalPath,setFinalPath] = useState([]);
  const [size,setSize] = useState(30);
  const [grid,setGrid] = useState([]);
  const [stateButton,setStateButton] = useState(false);
  const [initial,setInitial] = useState({x:null,y:null});
  const [final,setFinal] = useState({x:null,y:null});
  const [wall,setWall] = useState(false);
  const [diagonal,setDiagonal] = useState(false);
  const [corner,setCorner] = useState(false);
  const [colors,setColors] = useState({0:'#0A0A0A',1:'#FF0000',2:'#FFFFFF',3:'#00FF00',4:'#00FFFF'});

  function find(){
    //Teste para caso exista os pontos iniciais
    if(final.x !== null && initial.x !== null){
      //Criando novo objeto
      var astar = new AStar(diagonal,corner);
      //Inicializando com a matriz binária
      astar.setGrid(grid);
      //Setando onde é caminho livre
      astar.setAcceptableTiles([0]);
      //Setar condições iniciais para calculo de busca
      astar.findPath(initial.y, initial.x, final.y, final.x, function( path ) {
        if (path === null) {
          alert("Nenhum caminho encontrado!");
          setFinal({x:null,y:null});
          setInitial({x:null,y:null});
          setFinalPath([]);
        } else {
          setFinalPath(path);
        }
      });
      //Máximo de interações por calculo
      astar.setIterationsPerCalculation(10000);
      //Calcular caminho
      astar.calculate();
    }else{
      alert("Defina as posições iniciais!");
    }
  }

  useEffect(() => {
    //Teste para printar determinada cor
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
    //função para setar paredes manualmente
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
          for(var j = 0;j < matrix[0].length;j++){
              row.push(
              <Node
              key={String(i).concat(String(j))} 
              onClick={(coord)=> markPosition(coord)}
              onMouseEnter={({event,coord})=>drawWall(event,coord)}
              type={testPath(i,j,grid[i][j])} 
              coord={{x:i,y:j}}
              colors={colors}
              />)
          }
          rows.push(<div className="containerRow" key={i}>{row}</div>);
        }
        setGrid(matrix);
        setList(rows)
      }
    }
    //Função para marcar as posições iniciais
    function markPosition(coord){
      if(wall){
        drawWall(1,coord);
      }else{
        setFinalPath([]);
        if(grid[coord.x][coord.y] !== 1){
          if(!stateButton){
            if(final !== coord){
              setInitial({x:coord.x, y:coord.y}) 
              setStateButton(!stateButton);
            }
          }else{
            if(initial !== coord){
              setFinal({x:coord.x, y:coord.y})
              setStateButton(!stateButton);
            }
          }
        }
      }
    }
    //Função para listagem dos "nodes" em html
    function listNodes(){
      let row = [];
      let rows = [];
      for(var i = 0; i < grid.length ; i++){
        row = [];
        for(var j = 0;j < grid[0].length;j++){
            row.push(
            <Node
            key={String(i).concat(String(j))} 
            onClick={(coord)=> markPosition(coord)}
            onMouseEnter={({event,coord})=>drawWall(event,coord)}
            type={testPath(i,j,grid[i][j])} 
            coord={{x:i,y:j}}
            colors={colors}
            />)
        }
        rows.push(<div className="containerRow" key={i}>{row}</div>);
      }
      setList(rows)
    }
      listNodes();
  },[grid,finalPath,initial,final,stateButton,wall,colors])

  //Função para criação da matriz binária aleatóriamente
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
  //Teste para iniciar com uma matriz aleatória
  if(grid.length === 0){
    createGrid();
  }
  //Função para criar matriz vazia
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
  //HTML para menu;
    return (
      <div className="container">
        <div className="containerNodes">
          {list || null}
        </div>
        <div>
          <label>Gerar matriz :</label>
          <section>
            <div>
              <label htmlFor="sizeMatrix">Tamanho NxN:</label>
              <input id="sizeMatrix" type="number" value={size} onChange={(e)=>setSize(e.target.value)}/>
            </div>
            <div>
              <label>Gerar paredes aleatóriamente:</label>
              <button className="buttonMenu" onClick={()=>createGrid()}> Aleatório </button>
            </div>
            <div>
              <label>Marcadores:</label>
              <button className="buttonMenu" style={!stateButton ? {backgroundColor:'#282828'}:null} onClick={()=>setStateButton(false)}>Inicial</button>  
              <button className="buttonMenu" style={stateButton ? {backgroundColor:'#282828'}:null} onClick={()=>setStateButton(true)}>Final</button>
            </div>
            <div>
              <label>Definir paredes manualmente:</label>
              <button className="buttonMenu" style={wall ? {backgroundColor:'#282828'}:null} onClick={()=>setWall(!wall)}>Parede</button>
            </div>
            <div>
              <label>Limpar ou gerar vazia:</label>
              <button className="buttonMenu" onClick={()=>createDefault()}> Limpar </button>
            </div>
            <div style={{flexDirection:'row'}}>
              <label htmlFor="diagonal">Habilitar diagonal:</label>
              <input id="diagonal" type="checkbox" value={diagonal} onChange={(e)=>setDiagonal(e.target.checked)}/>
            </div>
            <div style={{flexDirection:'row',alignItems:'center'}}>
              <label htmlFor="corner">Habilitar passagem entre quinas de obstáculos:</label>
              <input disabled={!diagonal} id="corner" type="checkbox" value={corner} onChange={(e)=>setCorner(e.target.checked)}/>
            </div>
          </section>
          <button className="buttonSearch" onClick={()=>find()}> Buscar </button>
        </div>  
        <div >
          <label>Cores:</label>
          <section>
            <label htmlFor="color0">
              Caminho livre:
              <div style={{backgroundColor:colors[0]}}/>
            </label>
            <input id="color0" type="color" onChange={(e)=>setColors({0:e.target.value,1:colors[1],2:colors[2],3:colors[3],4:colors[4]})} value={colors[0]}/>
            <label htmlFor="color1">
              Obstáculos:
              <div style={{backgroundColor:colors[1]}}/>
            </label>
            <input id="color1" type="color" onChange={(e)=>setColors({0:colors[0],1:e.target.value,2:colors[2],3:colors[3],4:colors[4]})} value={colors[1]}/>
            <label htmlFor="color2">
              Rota calculada:
              <div style={{backgroundColor:colors[2]}}/>
            </label>
            <input id="color2" type="color" onChange={(e)=>setColors({0:colors[0],1:colors[1],2:e.target.value,3:colors[3],4:colors[4]})} value={colors[2]}/>
            <label htmlFor="color3">
              Ponto inicial:
              <div style={{backgroundColor:colors[3]}}/>
            </label>
            <input id="color3" type="color" onChange={(e)=>setColors({0:colors[0],1:colors[1],2:colors[2],3:e.target.value,4:colors[4]})} value={colors[3]}/>
            <label htmlFor="color4">
              Ponto final:
              <div style={{backgroundColor:colors[4]}}/>
            </label>
            <input id="color4" type="color" onChange={(e)=>setColors({0:colors[0],1:colors[1],2:colors[2],3:colors[3],4:e.target.value})} value={colors[4]}/>
          </section>
        </div>
        <a target="_blank"  rel="noreferrer" href="https://github.com/LucasAlesterio/A-Star">Desenvolvido por Lucas Alesterio</a>
    </div>
    );
  }