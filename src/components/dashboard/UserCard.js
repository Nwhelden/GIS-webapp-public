import React, { useState } from 'react'
import { functions } from '../../firebase'

export default function UserCard(props) {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [delPrompt, setDelPrompt] = useState(false);
    const [pending, setPending] = useState(false);
    const [updateRender, setUpdateRender] = useState(false);

    const toggleUpdate = () => {
        setUpdateRender(!updateRender);
        setDelPrompt(false);
        setError(false);
        setSuccess(false);
    }

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setPending(true);
        const { name, role } = e.target.elements;
        const roles = ["editor", "collaborator", "guest"];

        //check to see if role is valid
        if (role.value) {
            if (!roles.includes(role.value)) {
                setError(true);
                setPending(false);
                setError("Valid roles: owner, editor, collaborator, guest");
                return;
            }
        }

        var data = {
            uid: props.user.id,
            doc: false,
            auth: false,
            docData: {},
            authData: {}
        };

        //variable update; don't need to update all fields, only whatever you provide input to
        if (name) {
            data.auth = true;
            data.doc = true;
            data.authData.displayName = name.value;
            data.docData.name = name.value;
        }
        if (role) {
            data.doc = true;
            data.docData.role = role.value;
        }

        const userEdit = functions.httpsCallable('userEdit');
        await userEdit(data).then((result) => {
            setSuccess(result.data.message)
            setUpdateRender(false);
        }).catch((err) => {
            console.log(err);
            setError(err.message);
        }).finally(() => {
            setPending(false);
        })
    }

    const handleDelete = async () => {
        setError('');
        setSuccess('');
        setUpdateRender(false);

        if (props.user.role === 'owner' && !delPrompt) {
            setDelPrompt(true);
            setError("Deleting the owner account will delete the entire organizaiton. Click delete again to continue.")
        }
        else if (props.user.role !== 'owner' && !delPrompt) {
            setDelPrompt(true);
            setError("Are you sure? Click delete again to continue.")
        }
        else if (delPrompt) {
            setPending(true);
            setDelPrompt(false);

            console.log(props.user);

            var data = {
                uid: props.user.id
            }

            //const uid = props.user.id;
            //if you are deleting an owner account, delete the whole organization along with the other accounts in it

            const userDelete = functions.httpsCallable('userDelete');
            await userDelete(data).then((result) => {
                setSuccess(result.data.message)
            }).catch((err) => {
                console.log(err);
                setError(err.message);
            }).finally(() => {
                setPending(false);
            })
        }
    }

    return (
        <div>
            <p>{props.user.name}</p>
            <button disabled={pending} onClick={() => toggleUpdate()}>Update</button>
            <button disabled={pending} onClick={() => handleDelete()}>Delete</button>
            { updateRender &&
                <form onSubmit={handleUpdate}>
                    <label>
                        Name
                        <input name="name" type="text" />
                    </label>
                    <label>
                        Role
                        <input name="role" type="text" />
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
