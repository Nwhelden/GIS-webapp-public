import React from 'react'
import { Route, Redirect } from 'react-router'
import { useAuth } from "../../contexts/Auth"

export default function PrivateRoute({ component: Component, ...rest }) {

    const {currentUser, currentPerms} = useAuth();

    return (
        <Route {...rest} render={(props) => {
            return (currentUser && currentPerms) ? <Component {...props} /> : <Redirect to='/login' />
        }}/>
    )
}

    /*
    const location = useLocation();
    console.log(location);
    return (
        <Route {...rest} render={(props) => {
            if (location === "/dashboard") {
                return (currentPerms.role === "owner") ? <Component {...props} /> : <Redirect to='/login' /> 
            }
            else {
                return (currentUser && currentPerms) ? <Component {...props} /> : <Redirect to='/login' />
            }
        }}/>
    )
    */

    /*
    const location = useLocation();
    console.log(location);
    return (
        <Route {...rest} render={(props) => {
            if (currentPerms) {
                return currentUser ? <Component {...props} /> : <Redirect to='/login' /> 
            }
            else {
                return currentUser ? <Component {...props} /> : <Redirect to='/login' />
            }
        }}/>
    )
    */
