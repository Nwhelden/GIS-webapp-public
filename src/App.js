import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import PrivateRoute from './components/routing/PrivateRoute'
import SignUp from './views/SignUp'
import LogIn from './views/LogIn'
import Dashboard from './views/Dashboard'
import CreateOrg from './views/CreateOrg'
import Header from './components/routing/Header'
import { AuthProvider } from "./contexts/Auth"
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';


function App() {
  const headerBlacklist = ["/login", "/signup", "/create"];

  return (
    <div>
      <Router>
        <AuthProvider>
          <Route path="/" render={ ( props ) => ( !headerBlacklist.includes(props.location.pathname) ) && <Header /> } />
          <Switch>
            <Route exact path="/signup" component={SignUp} />
            <Route exact path="/login" component={LogIn} />
            <Route exact path="/create" component={CreateOrg} />
            <PrivateRoute exact path="/dashboard" component={Dashboard} />
            <Route render={() => <Redirect to="/dashboard" />} />
          </Switch>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
