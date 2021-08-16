import React, { useState } from 'react'
import firebase from 'firebase/app'; //need to import uninitialized firebase object to get timestamp value
import { db } from '../firebase'
import { Link } from 'react-router-dom'
import { useAuth } from "../contexts/Auth"

export default function SignUp() {
    const [error, setError] = useState('');
    const [pending, setPending] = useState(false); //set true when a signup request is made; prevents multiple signups in a single instance
    const {setPermsFlag, setOrg, currentUser} = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const { orgName } = event.target.elements; //get input from respective form fields
        setError('');
        setPending(true);
        var batch = db.batch();

        //create an organization
        var orgRef = db.collection("organizations").doc(); //.doc() creates a doc ref with an auto-generated id, but doesn't write to the database
        var dataRef = db.collection("organizations").doc(orgRef.id).collection("privateData").doc();
        var orgData = {name: orgName.value, dataID: dataRef.id, created: firebase.firestore.FieldValue.serverTimestamp()}
        batch.set(orgRef, orgData);

        //at the same time, create a document for the user that created and is an "owner" of the organization
        var userData = {
            userID: currentUser.uid,
            orgID: orgRef.id, 
            name: currentUser.displayName, 
            email: currentUser.email, 
            role: "owner",
            groups: {},
            joined: firebase.firestore.FieldValue.serverTimestamp()
        }
        var userRef = db.collection("organizations").doc(orgRef.id).collection("users").doc(currentUser.uid);
        batch.set(userRef, userData);

        //privateData document contains sensitive information that only the owner can read
        var privateData = {orgID: orgRef.id};
        batch.set(dataRef, privateData);

        //use a batch write to create the organization and an entry in the database for the owner account at the same time
        batch.commit().then(() => {

            //set the org of the authenticated user to the one they created
            return setOrg(orgRef.id, orgName.value);
        }).then(() => {

            //get perms and redirect
            setPermsFlag({redirect: true});
        }).catch((err) => {

            //if batch fails, don't want an owner assigned to an organization that isn't in the database
            console.log(err);
            setError("Could not connect with the database. Please try again later.");
        }).finally(() => {
            setPending(false);
        })
    }

    return (
        <div>
            <div>
                <h2>New Organization</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Organization Name
                        <input name="orgName" type="text" />
                    </label>
                    <button disabled={pending}>Create</button>
                </form>
                {error && <p style={{color: 'red'}}>{error}</p>}
            </div>
            <div>
                <Link to="/login">Return to organizations</Link>
            </div>
        </div>
    )
}
