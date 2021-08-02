import React, { useState, useEffect } from 'react'
import { db} from '../../firebase'
import { useAuth } from '../../contexts/Auth';

export default function OrgList() {
    const [orgs, setOrgs] = useState([]);
    const [membership, setMembership] = useState(true);
    const [loading, setLoading] = useState(true);
    const [pending, setPending] = useState(false);
    const {currentUser, setPermsFlag, setOrg} = useAuth();

    //get all the organizations a user is part of on initial render
    useEffect(() => {
        const getOrgs = async () => {
            console.log("Getting organizations...")
            await db.collectionGroup('users').where('userID', '==', currentUser.uid).get().then((querySnapshot) => {
                if (querySnapshot.size === 0) {
                    setMembership(false)
                }
                else {
                    querySnapshot.forEach((doc) => {
                        var organization = doc.ref.parent.parent;
                        organization.get().then((documentSnapshot) => {
                            setOrgs(oldArray => [...oldArray, {id: organization.id, ...documentSnapshot.data()}]);
                        })
                    })
                }
            }).catch((err) => {
                console.log(err);
                setOrgs([]);
                setMembership(false)
            })
            setLoading(false);
        }

        getOrgs()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    //if available, user can login to an organization
    const toggleOrg = async (orgID, orgName) => {
        setPending(true);
        await setOrg(orgID, orgName).then(() => {
            setPermsFlag({redirect: true});
        })
    }

    //user can continue login without being part of an organization
    const toggleDemo = async () => {
        setPending(true);
        await setOrg(0, "Demo").then(() => {
            setPermsFlag({redirect: true});
        })
    }

    return (
        <div>
            <h2>Organizations</h2>
            {loading &&
                <p>Loading...</p>
            }
            {!loading &&
                <div>
                    {!membership &&
                        <p>You are not part of an organization</p>
                    }
                    {membership &&
                        <ul>
                            {orgs.map((org) => (
                                <li key={org.id}>
                                    <button disabled={pending} onClick={() => toggleOrg(org.id, org.name)}>{org.name}</button>
                                </li>
                            ))}
                        </ul>
                    }
                </div>
            }
            <button disabled={pending} onClick={() => toggleDemo()}>Continue with demo version</button>
            <p>Create an organization</p>
        </div>
    )
}
