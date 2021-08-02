import React, { useState } from 'react'
import { auth } from '../firebase'
import { Link } from "react-router-dom"
import OrgList from '../components/authentication/OrgList'
import { useAuth } from "../contexts/Auth"

export default function LogIn() {
    const [error, setError] = useState('');
    const [pending, setPending] = useState(false); //set true when a signup request is made; prevents multiple signups in a signle instance
    const {currentUser} = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const { email, password } = event.target.elements; //get input from respective form fields
        setError('');
        setPending(true);

        //try to create user and redirect; otherwise display error
        await auth.signInWithEmailAndPassword(email.value, password.value).then((userCredential) => {
            //...
        }).catch((err) => {
            switch(err.code) {
                case "auth/user-not-found":
                    setError("No user with this email exists.");
                   break;
                case "auth/invalid-email":
                    setError("Invalid email.");
                    break;
                case "auth/wrong-password":
                    setError("Incorrect password.");
                    break;
                case "auth/user-disabled":
                    setError("Account has been disabled. Please contact the site admin for more information.");
                    break;
                default:
                    setError("Could not authenticate user. Please try again later.");
                    break;
            }
            console.log(err);
        }).finally(() => {
            setPending(false);
        })
    }

    //if there are no perms set or session expires, render OrgList (component handles setting user permissions on login) instead of login prompt
    return (
        <div>
            { currentUser &&
                <OrgList />
            }
            { !currentUser &&
                <div>
                    <div>
                        <h2>Log In</h2>
                        <form onSubmit={handleSubmit}>
                            <label>
                                Email
                                <input name="email" type="text" />
                            </label>
                            <label>
                                Password
                                <input name="password" type="password" />
                            </label>
                            <button disabled={pending}>Log In</button>
                        </form>
                        {error && <p style={{color: 'red'}}>{error}</p>}
                    </div>
                    <div>
                        <Link to="/signup">Sign Up</Link>
                    </div>
                </div>
            }
        </div>
    )
}
