import { BrowserRouter as Router, Route } from 'react-router-dom'
import LoginScreen from "./pages/Login/LoginScreen.jsx";

function App() {
  return (
      <Router>
        <Route path="/" component={LoginScreen} />
      </Router>
  )
}

export default App;