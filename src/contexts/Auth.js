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
    const [currentPerms, setCurrentPerms] = useState(null); //used for keeping track of important data (ex: use roles, security checks) instead of having to make on-demand queries
    const [permsFlag, setPermsFlag] = useState(null); //when set means we want to get user perms for an organization; typically after perms created and/or we want redirection
    const [contextError, setContextError] = useState(""); //in case perms were not set correctly, log the error 
    const [pending, setPending] = useState(true); //set false when there is a current user
    const history = useHistory();

    const setOrg = (orgID, orgName) => {
        return new Promise((resolve, reject) => {
           resolve(sessionStorage.setItem('organization', JSON.stringify({id: orgID, name: orgName}))) 
        })
    }

    //get both the information specific to the user and the information specific to the group
    const getPerms = async (user, organization, redirect) => {
        /*
        if (organization.id === 0) {
            console.log("test4.1");
            setCurrentPerms({orgName: organization.name, role: "guest"})
            if (redirect) {
                console.log("redirected");
                history.push('/');
            }
            setPending(false);
            return;
        }
        */

        console.log("retrieving data...");
        await db.collection(`organizations/${organization.id}/users`).doc(user.uid).get().then((doc) => {
            console.log(doc.data());
            setCurrentPerms({orgName: organization.name, ...doc.data()});
        }).catch((err) => {
            setCurrentPerms({orgName: organization.name, role: "guest"});
            setContextError(err.message);
        }).finally(() => {
            if (redirect) {
                console.log("redirected");
                history.push('/');
            }
            setPending(false);
        })

        /*
        await db.collectionGroup('users').where('userID', '==', user.uid).get().then((querySnapshot) => {
            //throw "err"
            querySnapshot.forEach((doc) => {
                var data = doc.data();
                db.collection(`organizations/${data.orgID}/privateData`).get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        setCurrentPerms(doc.data());
                        console.log(doc.data());
                    })
                }).finally(() => {
                    if (redirect) {
                        console.log("redirected")
                        history.push('/');
                    }
                    setPending(false);
                })
            })
        }).catch((err) => { //don't want application to brick if perms can't be retrieved; 
            console.log(err);
            setContextError(err.message);
            if (redirect) {
                console.log("redirected")
                history.push('/');
            }
            setPending(false);
        })
        */
    }

    //if a user is signing up, data may not be ready for retrieval when onAuthStateChanged is triggered
    //if there is a valid user on signup, get the data when it's ready (not like on login, where data is retrieved when onAuthStateChanged is triggered)
    useEffect(() => {
        const organization = JSON.parse(sessionStorage.getItem('organization'));
        if (permsFlag && currentUser && organization) {
            console.log(permsFlag.redirect);
            getPerms(currentUser, organization, permsFlag.redirect);
            setPermsFlag(null);
        }
    }, [permsFlag]) // eslint-disable-line react-hooks/exhaustive-deps

    //on initial render setup authentication observer
    useEffect(() => {
        const cleanup = auth.onAuthStateChanged((user) => {
            setCurrentUser(user);

            if (user) {
                console.log(`logged in as ${user.email}`);
                const organization = JSON.parse(sessionStorage.getItem('organization'));
                //auth.signOut()
                if (organization) {
                    getPerms(user, organization, false);
                }
                else {
                    setPending(false);
                }
            } else {
                console.log("logged out");
                sessionStorage.removeItem('organization');
                setPending(false);
            }
        });

        //listener cleanup; onAuthStateChanged triggers when a user signs-in and returns a function to unsubscribe
        return cleanup;
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const values = {
        currentUser,
        currentPerms,
        contextError,
        setCurrentPerms,
        setPermsFlag,
        setOrg
    }

    //render the rest of the application (children) when there is a current user and permissions have been loaded
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

//PROBLEM: want to get user perms specific to organization on signup, login, and rerender
//alternatives:
//1. Have user data set whenever onAuthStateChange triggers; set signupFlag when OrgSignUp/UserSignUp finishes; problem: data may be retrieved more than once on signup
    /*
    useEffect(() => {
        if (signupFlag && currentUser) {
            getData(currentUser, true);
            console.log("what is signup flag");
            setSignupFlag(false);
        }
    }, [signupFlag])
    */
//2. Have user data set 
    /*
    return new Promise((resolve, reject) => {
        db.collectionGroup('users').where('userID', '==', userCredential.user.uid).get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                var data = doc.data();
                db.collection(`organizations/${data.orgID}/privateData`).get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        setCurrentData(doc.data());
                    })
                }).then(() => {
                    resolve("Success");
                })
            })
        }).catch((err) => {
            reject(err);
        })
    })
    */
//3.
    /*
    useEffect(() => {
        if (previousStates.current.permsFlag !== permsFlag && previousStates.current.currentUser !== currentUser) {
            if (permsFlag && currentUser) {
                getPerms(currentUser, true);
            }
            previousStates.current = { permsFlag, currentUser }
            setPermsFlag(false)
        } else {
            if (!permsFlag && currentUser) {
                getPerms(currentUser, false);
            }
            previousStates.current = { permsFlag, currentUser }
        }
    }, [currentUser])
    */

//Possibility: store
//NEED: a way to store