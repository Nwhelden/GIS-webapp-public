import React, { useEffect, useState, useContext } from 'react'
import { auth, db } from '../firebase'
import { useHistory } from 'react-router-dom'

const AuthContext = React.createContext();

//children can extract value from the context object using useContext()
export function useAuth() {
    return useContext(AuthContext);
}

//provider component passes down the context object to the children it wraps
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null); //possibly don't need? refactor: https://firebase.google.com/docs/reference/js/firebase.auth.Auth#currentuser
    const [currentData, setCurrentData] = useState(null); //used for keeping track of important data (ex: use roles, security checks) instead of having to make on-demand queries
    const [signupFlag, setSignupFlag] = useState(false);
    const [redirFlag, setRedirFlag] = useState(false);
    const [pending, setPending] = useState(true); //set false when there is a current user
    const [contextError, setContextError] = useState("");
    const history = useHistory();

    //get both the information specific to the user and the information specific to the group
    const getData = async (user) => {
        console.log("retrieving data");
        //console.log(redirFlag);
        await db.collectionGroup('users').where('userID', '==', user.uid).get().then((querySnapshot) => {
            //throw "err"
            querySnapshot.forEach((doc) => {
                var data = doc.data();
                db.collection(`organizations/${data.orgID}/privateData`).get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        setCurrentData(doc.data());
                        console.log(doc.data());
                    })
                }).finally(() => {
                    if (redirFlag) {
                        console.log("HELLLO??????")
                        setRedirFlag(false);
                        history.push('/');
                    }
                    setPending(false);
                })
            })
        }).catch((err) => {
            console.log(err);
            setContextError("test");
            if (redirFlag) {
                setRedirFlag(false);
                history.push('/');
            }
            setPending(false);
        })
    }

    //if a user is signing up, data may not be ready for retrieval when onAuthStateChanged is 
    //if there is a valid user on signup, get the data when it's ready (not like on login, where data is retrieved when onAuthStateChanged is triggered)
    useEffect(() => {
        if (signupFlag && currentUser) {
            getData(currentUser);
            setSignupFlag(false);
        }
    }, [signupFlag])

    //on initial render setup authentication observer
    useEffect(() => {
        const cleanup = auth.onAuthStateChanged((user) => {
            setCurrentUser(user);

            if (user) {
                console.log(`logged in as ${user.email}`)
                if (!signupFlag) {
                    getData(user);
                }
            } else {
                console.log("logged out")
                setPending(false);
            }
        });

        //listener cleanup; onAuthStateChanged triggers when a user signs-in and returns a function to unsubscribe
        return cleanup;
    }, []);

    const values = {
        currentUser,
        currentData,
        contextError,
        setCurrentData,
        setRedirFlag,
        setSignupFlag
    }

    //render the rest of the application (children) when there is a current user
    if (pending) {
        return (
            <div>Loading...</div>
        )
    }
    else {

        //value is what we want the children to globally have access to
        return (
            <AuthContext.Provider value={values}>
                {children}
            </AuthContext.Provider>
        )
    }
}
