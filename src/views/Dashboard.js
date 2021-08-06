import React, { useState } from 'react'
//import { auth, db } from '../firebase'
import { useAuth } from "../contexts/Auth"
import UserList from '../components/dashboard/UserList'
import FileList from '../components/dashboard/FileList'

export default function Dashboard() {
    //const [admin, setAdmin] = useState(false);
    //const [organization, setOrganization] = useState({});
    //const [loading, setLoading] = useState(false);
    const {currentUser, currentPerms} = useAuth();
    const admins = ["owner", "admin"]

    /*
    useEffect(() => {
        console.log(organization)
    }, [organization])
    */

    //get organization and determine if user is admin
    /*
    useEffect(() => {
        //console.log(currentPerms.roles['test'])
        console.log("testing dashboard")
        const getOrg = async () => {
            await db.collectionGroup('users').where('userID', '==', currentUser.uid).get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    var organization = doc.ref.parent.parent;
                    setOrganization(organization.id);
                    organization.get().then((documentSnapshot) => {
                        setOrganization({id: organization.id, ...documentSnapshot.data()});
                    })

                                //db.collectionGroup('users').where('userID', '==', user.uid).get().then((querySnapshot) => {

                    ---
                    organization.collection("privateData").get().then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            if (doc.data().roles[currentUser.uid] === "owner") {
                                setAdmin(true);
                                console.log("is admin");
                            }
                        })
                    })
                    ---
                })
            })
        }

        setLoading(true);
        getOrg();
        setLoading(false);
    }, []) // eslint-disable-line react-hooks/exhaustive-deps
    */

    const [test2, setTest2] = useState("default");
    const [test1, setTest1] = useState("default");

    const changeThing3 = () => {
        return new Promise((resolve, reject) => {
            resolve(testArr.push("success3"))
        })
    }

    const failThing = () => {
        return new Promise((resolve, reject) => {
            reject("FAILED");
        })
    }

    var testArr = [];

    const changeThing2 = () => {
        return new Promise((resolve, reject) => {
            resolve(testArr.push("success2"))
        })
    }

    const changeThing1 = () => {
        return new Promise((resolve, reject) => {
            resolve(testArr.push("success1"))
        })
    }

    const handleTest = async () => {
        console.log(testArr);
        var promises = [];
        promises.push(failThing())
        promises.push(changeThing1())
        promises.push(changeThing2())
        promises.push(changeThing3())

        await Promise.all(promises).then((result => {
            console.log(result);
            console.log(testArr);
        })).catch((e) => {
            console.log(e)
            console.log(testArr);
        })
    }

    //render different dashboards depending on user role
    return (
        <div>
            { (currentUser && !admins.includes(currentPerms.role)) &&
                <div>
                    <h1>Dashboard</h1>
                    <p>User dashboard... Nothing here yet!</p>
                </div>
            }
            { (currentUser && admins.includes(currentPerms.role)) &&
                <div>
                    <h1>Dashboard</h1>
                    <div>
                        <h4>Users</h4>
                        <UserList org={{id: currentPerms.orgID, name: currentPerms.orgName}} />
                    </div>
                    <div>
                        <h4>Files</h4>
                        <FileList org={{id: currentPerms.orgID, name: currentPerms.orgName}} />
                    </div>
                </div>
            }
            <button onClick={handleTest}>Test</button>
            <div>{test1}</div>
            <div>{test2}</div>
        </div>
    )
}
