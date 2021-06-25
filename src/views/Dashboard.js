import React from 'react'
import { auth } from '../firebase'
import { useAuth } from "../contexts/Auth"

export default function Dashboard() {
    const currentUser = useAuth();  

    return (
        <div>
            <h1>Dashboard</h1>
            <h3>Welcome {currentUser.email}</h3>
            <button onClick={() => auth.signOut()}>Sign out</button>
        </div>
    )
}
