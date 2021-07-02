import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import PrivateRoute from './components/routing/PrivateRoute'
import SignUp from './views/SignUp'
import LogIn from './views/LogIn'
import Dashboard from './views/Dashboard'
import { AuthProvider } from "./contexts/Auth"

function App() {
  return (
    <div>
      <AuthProvider>
        <Router>
          <Switch>
            <Route exact path="/signup" component={SignUp} />
            <Route exact path="/login" component={LogIn} />
            <PrivateRoute exact path="/dashboard" component={Dashboard} />
            <Route render={() => <Redirect to="/dashboard" />} />
          </Switch>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
