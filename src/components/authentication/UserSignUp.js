import React, { useState } from 'react'
import firebase from 'firebase/app'; //need to import uninitialized firebase object to get timestamp value
import { auth, db } from '../../firebase'
import { Link, useHistory } from 'react-router-dom'

export default function SignUp() {
    const [error, setError] = useState('');
    const [pending, setPending] = useState(false); //set true when a signup request is made; prevents multiple signups in a single instance
    const history = useHistory();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const { name, email, password, key } = event.target.elements; //get input from respective form fields
        setError('');
        setPending(true);
        var keyInvalid = false;

        //check to see if key belongs to an organization
        //don't want admin accounts registered on the client page (only add admin accounts through the admin site)
        const test = db.collection("organizations").doc(key.value)
        await test.get().then((doc) => {
            if (!doc.exists || key.value === process.env.REACT_APP_ADMIN_KEY) {
                setError("Organization associated with key not found.")
                keyInvalid = true;
            }
        }).catch((err) => {
            console.log(err);
            setError("Could not connect with the database. Please try again later.")
            keyInvalid = true;
        });

        if (keyInvalid) {
            setPending(false);
            return;
        }
        else {

            //try to create user and redirect; otherwise display error
            //need to wait on so currentUser updates
            await auth.createUserWithEmailAndPassword(email.value, password.value).then((userCredential) => {

                //auth.currentUser.uid
                //??? for some reason useAuth() to get currentUser returns null

                //after creating user, create document 
                var userData = {
                    orgID: key.value, 
                    name: name.value, 
                    email: email.value, 
                    role: "collaborator", 
                    created: firebase.firestore.FieldValue.serverTimestamp()
                }
                db.collection(`organizations/${key.value}/users`).doc(userCredential.user.id).set(userData).then(() => {
                    history.push('/');
                }).catch((err) => {
                    console.log(err);
                    setError("Could not connect with the database. Please try again later.");
                })
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
                    <label>
                        Organization Key
                        <input name="key" type="password" />
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
