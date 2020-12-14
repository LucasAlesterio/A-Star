import React from 'react';
import './styles.css';

export default function Node({onClick,type,coord,onMouseEnter}){
    if(type === 0){
    return(
        <button onMouseEnter={(event)=>onMouseEnter({event:event.buttons,coord:coord})}  style={{backgroundColor:'red'}}onClick={()=>onClick(coord)}/>
        )
    }
    if(type === 1){
        return(
            <button onMouseEnter={(event)=>onMouseEnter({event:event.buttons,coord:coord})} style={{backgroundColor:'blue'}}onClick={()=>onClick(coord)}/>
        )
    }
    if(type === 2){
        return(
            <button onMouseEnter={(event)=>onMouseEnter({event:event.buttons,coord:coord})} style={{backgroundColor:'white'}}onClick={()=>onClick(coord)}/>
        )
    }
    if(type === 3){
        return(
            <button onMouseEnter={(event)=>onMouseEnter({event:event.buttons,coord:coord})} style={{backgroundColor:'yellow'}}onClick={()=>onClick(coord)}/>
        )
    }
    if(type === 4){
        return(
            <button onMouseEnter={(event)=>onMouseEnter({event:event.buttons,coord:coord})} style={{backgroundColor:'orange'}}onClick={()=>onClick(coord)}/>
        )
    }
    
}