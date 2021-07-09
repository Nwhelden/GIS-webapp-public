import React, { useState } from 'react'
import UserSignUp from '../components/authentication/UserSignUp'
import OrgSignUp from '../components/authentication/OrgSignUp'

export default function SignUp() {
    const [userRender, setUserRender] = useState(false);
    const [orgRender, setOrgRender] = useState(false);
    const [signPrompt, setSignPrompt] = useState(true);

    const toggleUserRender = (e) => {
        e.preventDefault();
        setUserRender(true);
        setSignPrompt(false);
    }

    const toggleOrgRender = (e) => {
        e.preventDefault();
        setOrgRender(true);
        setSignPrompt(false);
    }

    //Render different signup options based on user input 
    return (
        <div>
            { signPrompt &&
                <div>
                    <h1>Sign up as...</h1>
                    <button onClick={toggleUserRender}>User</button>
                    <button onClick={toggleOrgRender}>Organization</button>
                </div>
            }
            { userRender &&
                <UserSignUp />
            }
            { orgRender &&
                <OrgSignUp />
            }
        </div>
    )
}
