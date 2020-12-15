// Lucas Alesterio Marques Vieira  11621ECP016
import React from 'react';
import '../../styles.css';

export default function Node({onClick,type,coord,onMouseEnter,colors}){
    return(
        <button onMouseEnter={(event)=>onMouseEnter({event:event.buttons,coord:coord})}  style={{backgroundColor:colors[type]}}onClick={()=>onClick(coord)}/>
        )
}