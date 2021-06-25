import React, { useEffect, useState, useContext } from 'react'
import { auth } from '../firebase'

const AuthContext = React.createContext();

//children can extract value from the context object using useContext()
export function useAuth() {
    return useContext(AuthContext);
}

//provider component passes down the context object to the children it wraps
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null); //possibly don't need? refactor: https://firebase.google.com/docs/reference/js/firebase.auth.Auth#currentuser
    const [pending, setPending] = useState(true); //set false when there is a current user

    //on initial render setup authentication observer
    useEffect(() => {
        const cleanup = auth.onAuthStateChanged((user) => {
            setCurrentUser(user);
            setPending(false);
        });

        //listener cleanup; onAuthStateChanged triggers when a user signs-in and returns a function to unsubscribe
        return cleanup;
    }, []);

    //render the rest of the application (children) when there is a current user
    if (pending) {
        return (
            <div>Loading...</div>
        )
    }
    else {

        //value is what we want the children to globally have access to
        return (
            <AuthContext.Provider value={currentUser}>
                {children}
            </AuthContext.Provider>
        )
    }
}
