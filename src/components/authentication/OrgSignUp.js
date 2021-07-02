import React, { useState } from 'react'
import firebase from 'firebase/app'; //need to import uninitialized firebase object to get timestamp value
import { auth, db } from '../../firebase'
import { Link } from 'react-router-dom'

export default function SignUp() {
    const [error, setError] = useState('');
    const [pending, setPending] = useState(false); //set true when a signup request is made; prevents multiple signups in a single instance
    const [authComplete, setAuthComplete] = useState(false);
    const [msgData, setMsgData] = useState();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const { orgName, ownerName, email, password } = event.target.elements; //get input from respective form fields
        setError('');
        setPending(true);

        await auth.createUserWithEmailAndPassword(email.value, password.value).then((userCredential) => {
            var batch = db.batch();

            //create an organization
            var orgData = {name: orgName.value, created: firebase.firestore.FieldValue.serverTimestamp()}
            var orgRef = db.collection("organizations").doc(); //.doc() creates a doc ref with an auto-generated id, but doesn't write to the database
            batch.set(orgRef, orgData);

            //at the same time, create a user that is an "owner" of the organization
            var userData = {
                orgID: orgRef.id, 
                name: ownerName.value, 
                email: email.value, 
                role: "owner", 
                created: firebase.firestore.FieldValue.serverTimestamp()
            }
            var userRef = db.collection("organizations").doc(orgRef.id).collection("users").doc(userCredential.user.uid);
            batch.set(userRef, userData);

            batch.commit().then(() => {
                setMsgData({oName: orgName.value, uEmail: email.value, oKey: orgRef.id});
                userCredential.user.updateProfile({displayName: ownerName.value});
                setAuthComplete(true);
            }).catch((err) => {

                //if batch fails, don't want a user created
                userCredential.user.delete();
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

    return (
        <div>
            { authComplete &&
                <div>
                    <div>
                        <h1>{`Organization "${msgData.oName}" created!`}</h1>
                        <h2>{`An account with the email ${msgData.uEmail} has been added with ownership permissions.`}</h2>
                        <h2 style={{color: 'red'}}>{`Use this key to add users to your organization: ${msgData.oKey}`}</h2>
                    </div>
                    <div>
                        <Link to="/dashboard">Go to Dashboard</Link>
                    </div>
                </div>
            }
            { !authComplete &&
                <div>
                    <div>
                        <h2>New Organization</h2>
                        <form onSubmit={handleSubmit}>
                            <label>
                                Organization Name
                                <input name="orgName" type="text" />
                            </label>
                            <label>
                                Owner Name
                                <input name="ownerName" type="text" />
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
            }
        </div>
    )
}
