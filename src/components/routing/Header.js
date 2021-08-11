import React from 'react'
import { auth } from '../../firebase'
import { Link } from "react-router-dom"

export default function Header() {
    return (
        <div>
            { auth.currentUser &&
                <div>
                    <p>{auth.currentUser.displayName}</p>
                    <div>
                        <button onClick={() => auth.signOut()}>Sign out</button>
                    </div>
                </div>
            }
            { !auth.currentUser &&
                <div>
                    <Link to="/login">Log In</Link>
                    <Link to="/signup">Sign Up</Link>
                </div>
            }
        </div>
    )
}
