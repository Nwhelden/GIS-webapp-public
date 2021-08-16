import React from 'react'
import { auth } from '../../firebase'
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/Auth"

export default function Header() {
    const { currentUser } = useAuth();

    return (
        <div>
            { currentUser &&
                <div>
                    <p>{currentUser.displayName}</p>
                    <button onClick={() => auth.signOut()}>Sign out</button>
                    <Link to="/login">Change organization</Link>
                </div>
            }
            { !currentUser &&
                <div>
                    <Link to="/login">Log In</Link>
                    <Link to="/signup">Sign Up</Link>
                </div>
            }
        </div>
    )
}
