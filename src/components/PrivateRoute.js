import React from 'react'
import { Route, Redirect } from 'react-router'
import { useAuth } from "../contexts/Auth"

export default function PrivateRoute({ component: Component, ...rest }) {

    const currentUser = useAuth();

    return (
        <Route {...rest} render={(props) => {
            return currentUser ? <Component {...props} /> : <Redirect to='/login' />
        }}/>
    )
}
