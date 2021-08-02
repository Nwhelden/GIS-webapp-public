import React from 'react'
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
        </div>
    )
}
