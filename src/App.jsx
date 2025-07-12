import { useState } from 'react'
import './App.css'



function App() {
  
  const [color,setcolor]=useState("green")
  return (
    <>
    <div className='w-full h-screen duration-200' 
    style={{backgroundColor:color}}></div>
    
    <div>
      
    </div>
    
    </>
      
  )
}

export default App
