import { Routes, Route } from 'react-router-dom';
import LoginScreen from "./pages/Login/LoginScreen.jsx";

function App() {
  return (
        <div className="App">
            <Routes>
                <Route path="/" element={<LoginScreen />} />
            </Routes>
        </div>
  )
}

export default App;