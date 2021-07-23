import React, { useState, useEffect, useRef } from 'react'
import { auth, db } from '../firebase'
import { useAuth } from "../contexts/Auth"
import UserList from '../components/dashboard/UserList'
import FileList from '../components/dashboard/FileList'

export default function Dashboard() {
    //const currentUser = useAuth();  
    const [admin, setAdmin] = useState(false);
    const [organization, setOrganization] = useState({});
    const [loading, setLoading] = useState(false);
    const {currentUser, currentPerms, setPermsFlag} = useAuth();

    useEffect(() => {
        console.log(organization)
    }, [organization])

    //get organization and determine if user is admin
    useEffect(() => {
        console.log(currentPerms.roles['test'])
        const getOrg = async () => {
            await db.collectionGroup('users').where('userID', '==', currentUser.uid).get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    var organization = doc.ref.parent.parent;
                    setOrganization(organization.id);
                    organization.get().then((documentSnapshot) => {
                        setOrganization({id: organization.id, ...documentSnapshot.data()});
                    })

                    /*
                    organization.collection("privateData").get().then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            if (doc.data().roles[currentUser.uid] === "owner") {
                                setAdmin(true);
                                console.log("is admin");
                            }
                        })
                    })
                    */
                })
            })
        }

        setLoading(true);
        getOrg();
        setLoading(false);
    }, [])

    const buttonClick2 = () => {
        setPermsFlag(true);
    }

    const buttonClick = () => {
        console.log(currentPerms.orgID);
    }

    return (
        <div>
            <h1>Dashboard</h1>
            { loading &&
                <div>
                    <p>Loading...</p>
                </div>
            }
            { (!loading && auth.currentUser) &&
                <div>
                    <div>
                        <h4>Users</h4>
                        <UserList org={organization} admin={admin}/>
                    </div>
                    <div>
                        <h4>Files</h4>
                        <FileList org={organization} admin={admin}/>
                    </div>
                </div>
            }
            <p>{currentUser.uid}</p>
            <p>{currentPerms.orgID}</p>
            <button onClick={buttonClick}>test</button>
            <button onClick={buttonClick2}>test2</button>
        </div>
    )
}
