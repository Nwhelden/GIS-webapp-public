import React, { useState } from 'react'
import { auth, db } from '../firebase'
import { Link, useHistory } from 'react-router-dom'

export default function SignUp() {
    const [error, setError] = useState('');
    const [pending, setPending] = useState(false); //set true when a signup request is made; prevents multiple signups in a single instance
    const history = useHistory();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const { email, password } = event.target.elements; //get input from respective form fields

        //try to create user and redirect; otherwise display error
        try {
            setError('');
            setPending(true);
            await auth.createUserWithEmailAndPassword(email.value, password.value); //need to wait on so currentUser updates

            //after creating user, create document 
            //??? for some reason useAuth() to get currentUser returns null
            db.collection('user-info').doc(auth.currentUser.uid).set({admin: true}) //!!! potential problem: success on createUser, fail on set()

            //redirect on success
            history.push('/');
        } catch(err) {
            switch(err.code) {
                case "auth/email-already-in-use":
                    setError("A user with this email already exists.");
                   break;
                case "auth/invalid-email":
                    setError("Invalid email.");
                    break;
                case "auth/weak-password":
                    setError("Password must be at least 6 characters.");
                    break;
                default:
                    setError("Could not create account. Please try again later.");
                    break;
            }
            console.log(err);
        } finally {
            setPending(false);
        }
    }

    return (
        <div>
            <div>
                <h2>Sign Up</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Email
                        <input name="email" type="text" />
                    </label>
                    <label>
                        Password
                        <input name="password" type="password" />
                    </label>
                    <button disabled={pending}>Sign Up</button>
                </form>
                {error && <p style={{color: 'red'}}>{error}</p>}
            </div>
            <div>
                <Link to="/login">Log In</Link>
            </div>
        </div>
    )
}
