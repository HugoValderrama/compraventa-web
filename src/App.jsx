import { BrowserRouter as Router, Route } from 'react-router-dom'
import Login from "./pages/Login/LoginScreen.jsx";

function App() {
  return (
      <Router>
        <Route path="/" component={Login} />
      </Router>
  )
}

export default App;