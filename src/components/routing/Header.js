import React from 'react'
import { auth } from '../../firebase'
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/Auth"

export default function Header() {
    const {currentUser, currentPerms} = useAuth();

    return (
        <div>
            { currentUser &&
                <div>
                    <p>{currentUser.displayName}</p>
                    <div>
                        <button onClick={() => auth.signOut()}>Sign out</button>
                        { (currentPerms.orgName === "Demo") &&
                            <Link to="/create">Create organization</Link>
                        }
                    </div>
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
