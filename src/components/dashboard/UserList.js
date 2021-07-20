import React, { useState, useEffect } from 'react'
import { auth, db } from '../../firebase'
import UserCard from './UserCard'

export default function UserList(props) {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [pending, setPending] = useState(false);
    const [users, setUsers] = useState([]);
    const [addRender, setAddRender] = useState(false);

    //get users of specified organization
    useEffect(() => {

        if (props.org.id) {
            console.log(`Getting users for ${props.org.name}`);
            setLoading(true);
            setPending(true);
            
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
    }

    const handleAdd = async (event) => {
        event.preventDefault();
        console.log(users);
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
                                        Name
                                        <input name="name" type="text" />
                                    </label>
                                    <label>
                                        Email
                                        <input name="email" type="text" />
                                    </label>
                                    <label>
                                        Password
                                        <input name="password" type="password" />
                                    </label>
                                    <button disabled={pending}>Submit</button>
                                </form>
                            </div>
                        }
                    </div>
                </div>
            }
        </div>
    )
}