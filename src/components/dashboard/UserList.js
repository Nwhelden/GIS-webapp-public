import React, { useState, useEffect } from 'react'
import { useAuth } from "../../contexts/Auth"
import { db, functions } from '../../firebase'
import UserCard from './UserCard'

export default function UserList(props) {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [pending, setPending] = useState(false);
    const [users, setUsers] = useState([]);
    const [addRender, setAddRender] = useState(false);
    const {currentPerms} = useAuth();
    const roles = ["guest", "collaborator", "admin"]

    //get users of specified organization
    useEffect(() => {

        if (props.org.id) {
            console.log(`Getting users for ${props.org.name}`);
            setLoading(true);
            setPending(true);
            
            //because onSnapshot is used, when a new user is added to the organization it will be added to the rendered list in realtime
            const unsubscribe = db.collection(`organizations/${props.org.id}/users`).orderBy("name").onSnapshot((querySnapshot) => {
                const newUsers = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }))

                console.log(newUsers);
                setUsers(newUsers);
                setPending(false);
                setLoading(false);
            })

            return () => unsubscribe;
        }
    }, [props.org]);

    const toggleAdd = () => {
        setAddRender(!addRender);
        setError(false);
        setSuccess(false);
    }

    //pass relevent data to a cloud function that handles adding a user
    const handleAdd = async (event) => {
        event.preventDefault();
        const { email, role } = event.target.elements;
        setError('');
        setSuccess('');
        setPending(true);

        var data = {
            email: email.value,
            role: role.value,
            contextRole: currentPerms.role,
            orgID: props.org.id
        }

        const addUser = functions.httpsCallable('addUser');
        await addUser(data).then((result) => {
            setSuccess(result.data.message);
            setAddRender(false);
        }).catch((err) => {
            console.log(err);
            setError(err.message);
        }).finally(() => {
            setPending(false);
        })
    }

    return (
        <div>
            { !loading &&
                <div>
                    <ul>
                        {users.map((user) => (
                            <li key={user.id}>
                                <UserCard user={user} />
                            </li>
                        ))}
                    </ul>
                    <div>
                        <button disabled={pending} onClick={() => toggleAdd()}>Add User</button>
                        { addRender &&
                            <div>
                                <form onSubmit={handleAdd}>
                                    <label>
                                        Email
                                        <input name="email" type="text" />
                                    </label>
                                    <label>
                                        Role
                                        <select name="role">{roles.map((role, index) => <option key={index}>{role}</option>)}</select>
                                    </label>
                                    <button disabled={pending}>Submit</button>
                                </form>
                            </div>
                        }
                        {pending && <p>Loading...</p>}
                        {success && <p style={{color: 'green'}}>{success}</p>}
                        {error && <p style={{color: 'red'}}>{error}</p>}
                    </div>
                </div>
            }
        </div>
    )
}
