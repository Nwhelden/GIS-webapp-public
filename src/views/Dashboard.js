import React from 'react'
//import { auth, db } from '../firebase'
import { useAuth } from "../contexts/Auth"
import UserList from '../components/dashboard/UserList'
import FileList from '../components/dashboard/FileList'
import { WebMap } from '@esri/react-arcgis';

export default function Dashboard() {
    const {currentUser, currentPerms} = useAuth();
    const admins = ["owner", "admin"]

    //render different dashboards depending on user role
    return (
        <div>
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
            <div>
                <WebMap id="c129310b39f64947b2450f2dd37b65dc" style={{ width: '65vw', height: '80vh' }} basemap="dark-gray"
                    viewProperties={{
                        center: [-82.55972065626271, 27.326698622848458],
                        zoom: 15
                    }}
                />
            </div>
        </div>
    )
}
