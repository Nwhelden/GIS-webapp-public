import React, { useState, useEffect } from 'react'
import { auth, db } from '../firebase'
import { useAuth } from "../contexts/Auth"
import UserList from '../components/dashboard/UserList'
import FileList from '../components/dashboard/FileList'

export default function Dashboard() {
    //const currentUser = useAuth();  
    const [admin, setAdmin] = useState(false);
    const [organization, setOrganization] = useState({});
    const [loading, setLoading] = useState(false);
    const {currentUser, currentData} = useAuth();

    //get organization and determine if user is admin
    useEffect(() => {
        console.log("loaded")
        console.log(currentData);
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

    const buttonClick = () => {
        console.log(currentData.orgID);
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
            <p>{currentData.orgID}</p>
            <button onClick={buttonClick}>test</button>
        </div>
    )
}
