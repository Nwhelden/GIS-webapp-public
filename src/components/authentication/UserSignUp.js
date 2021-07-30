import React, { useState } from 'react'
import { auth } from '../../firebase'
import { Link } from 'react-router-dom'
import { useAuth } from "../../contexts/Auth"

//REFACTOR: some of the functionality overlapped by UserSignUp and OrgSignup could be handled by a cloud function using authentication triggers
//such a function could also be used to help with the admin site authentication
//ex: adding a document to database for a user when a user is created

export default function SignUp() {
    const [error, setError] = useState('');
    const [pending, setPending] = useState(false); //set true when a signup request is made; prevents multiple signups in a single instance
    const {setPermsFlag, setOrg} = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const { name, email, password } = event.target.elements; //get input from respective form fields
        setError('');
        setPending(true);

        //try to create user and redirect; otherwise display error
        await auth.createUserWithEmailAndPassword(email.value, password.value).then((userCredential) => {
            userCredential.user.updateProfile({displayName: name.value});
            return setOrg(0, "Demo");
        }).then(() => {
            setPermsFlag({redirect: true});
        }).catch((err) => {
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
        }).finally(() => {
            setPending(false);
        })
    }

    return (
        <div>
            <div>
                <h2>New User</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Name
                        <input name="name" type="text" />
                    </label>
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
