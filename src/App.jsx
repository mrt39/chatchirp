import { useState } from 'react'
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx"
import './styles/App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
      <div className='appContainer'>
        <Navbar
        count = {count}
        />
        {/* "context" is how you pass props to Outlet: https://reactrouter.com/en/main/hooks/use-outlet-context */}
        <Outlet  context={[count]} /> 
      </div>
  )
}

export default App
