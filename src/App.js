import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import PrivateRoute from './components/routing/PrivateRoute'
import SignUp from './views/SignUp'
import LogIn from './views/LogIn'
import Dashboard from './views/Dashboard'
import Header from './components/routing/Header'
import { AuthProvider } from "./contexts/Auth"

function App() {
  const headerBlacklist = ["/login", "/signup"];

  return (
    <div>
      <Router>
        <AuthProvider>
          <Route path="/" render={ ( props ) => ( !headerBlacklist.includes(props.location.pathname) ) && <Header /> } />
          <Switch>
            <Route exact path="/signup" component={SignUp} />
            <Route exact path="/login" component={LogIn} />
            <PrivateRoute exact path="/dashboard" component={Dashboard} />
            <Route render={() => <Redirect to="/dashboard" />} />
          </Switch>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
