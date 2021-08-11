import React, { useState } from 'react'
import { Button } from 'react-bootstrap';
import { useAuth } from "../../contexts/Auth"
import { functions } from '../../firebase'

export default function UserCard(props) {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [delPrompt, setDelPrompt] = useState(false);
    const [pending, setPending] = useState(false);
    const [updateRender, setUpdateRender] = useState(false);
    const {currentPerms} = useAuth();

    const roles = ["guest", "collaborator", "admin", "owner"]

    const toggleUpdate = () => {
        setUpdateRender(!updateRender);
        setDelPrompt(false);
        setError(false);
        setSuccess(false);
    }

    //not sure if needed? wasn't sure if if/else is synchronous in JS
    const checkRole = (role) => {
        return new Promise((resolve, reject) => {
            if (role.value) {
                if (!roles.includes(role.value)) {
                    reject("Valid roles: owner, admin, collaborator, guest");
                }
                else {
                    resolve();
                }
            }
            else {
                resolve();
            }
        })
    }

    //change user's role
    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setPending(true);
        const { role } = e.target.elements;

        await checkRole(role).then(() => {

            var data = {
                uid: props.user.id,
                orgID: currentPerms.orgID,
                contextRole: currentPerms.role,
                role: role.value
            }

            //right now edit is handled by a cloud function (in case info other than role needs to be updated and may require admin sdk)
            //it could be also be done by querying user document locally then updating a field
            const editUser = functions.httpsCallable('editUser');
            return editUser(data)
        }).then((result) => {
            setSuccess(result.data.message)
            setUpdateRender(false);
        }).catch((err) => {
            console.log(err);
            setError(err.message);
            setPending(false);
        }).finally(() => {
            setPending(false);
        })
    }

    //remove user from organization
    const handleRemove = async () => {
        setError('');
        setSuccess('');
        setUpdateRender(false);

        if (props.user.role === 'owner') {
            setDelPrompt(true);
            setError("Cannot remove the owner account. Please swap ownership permissions before removing user.")
        }
        else if (props.user.role !== 'owner' && !delPrompt) {
            setDelPrompt(true);
            setError("Are you sure? Click 'remove' again to continue.")
        }
        else if (delPrompt) {
            setPending(true);
            setDelPrompt(false);

            var data = {
                uid: props.user.id,
                orgID: currentPerms.orgID,
                contextRole: currentPerms.role
            }

            //removing a user could also be done locally by deleting user document in organization's collection 
            const removeUser = functions.httpsCallable('removeUser');
            await removeUser(data).then((result) => {

                /*
                if you remove yourself
                if (result ) {
                    setOrg(orgRef.id, orgName.value)
                    setPermsFlag({redirect: true});
                }
                */

                setSuccess(result.data.message)
            }).catch((err) => {
                console.log(err);
                setError(err.message);
            }).finally(() => {
                setPending(false);
            })
        }
    }

    //prevents multiple users from having the owner role, and also prevents the owner role from being reassigned
    //FUTURE: modify handleUpdate to allow swapping owner role with a user 
    const disableSelect = (optionRole, userRole) => {

        if (userRole === 'owner') {
            return true;
        }
        else if (optionRole === 'owner') {
            return true;
        }
        else {
            return false;
        }
    }

    //for editing a user's role, have default option of drop-down be the user's current role
    /*
    const defaultSelect = (optionRole, userRole) => {
        return optionRole === userRole;
    }
    */
    //selected={defaultSelect(role, props.user.role)

    return (
        <div>
            <p>{props.user.name}</p>
            <Button variant="outline-success" size="sm" disabled={pending} onClick={() => toggleUpdate()}>Update</Button>
            <Button variant="outline-success" size="sm" disabled={pending} onClick={() => handleRemove()}>Remove</Button>
            { updateRender &&
                <form onSubmit={handleUpdate}>
                    <label>
                        Role
                        <select name="role" defaultValue={props.user.role} >
                            {roles.map((role, index) => 
                                <option 
                                    value={role}
                                    disabled={disableSelect(role, props.user.role)} 
                                    key={index}>
                                {role}</option>)}
                        </select>
                    </label>
                    <button disabled={pending}>Submit</button>
                </form>
            }
            {pending && <p>Loading...</p>}
            {success && <p style={{color: 'green'}}>{success}</p>}
            {(error || delPrompt) && <p style={{color: 'red'}}>{error}</p>}
        </div>
    )
}
