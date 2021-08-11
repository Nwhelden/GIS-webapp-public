const functions = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();

//firebase deploy --only functions

//REFACTOR: move adding user doc and updating user to a function tiggered by user creation
//also, expand on possible error cases

//HELPER 
//---------------------------------------------------------------

//remove references to user from organization
/*
const removeUserData = (user) => {
    return new Promise((resolve, reject) => {
        admin.firestore().collectionGroup('users').where('userID', '==', user.uid).get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                var data = doc.data();
                admin.firestore().collection(`organizations/${data.orgID}/privateData`).get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        setCurrentData(doc.data());
                    })
                }).then(() => {
                    resolve("Success");
                })
            })
        }).catch((err) => {
            reject(err);
        })
    })
}

//remove associated cloud storage data for organization, then delete organization doc (recursively deletes subcollections)
const deleteOrganization = (org) => {
    return new Promise((resolve, reject) => {

        var listRef = admin.storage().ref(`organizations/${org.name}`);
        listRef.listAll().then((res) => {

            res.items.forEach((itemRef) => {
                itemRef.delete()
            })
        }).catch((err) => {
            reject(err);
        })


        admin.firestore().collection(`organizations/${orgID}/users`).get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {

            })
            
        }).catch((err) => {
            reject(err);
        })
    })
}
*/

//PUBLIC
//---------------------------------------------------------------

//get user by email, then create a respective user document and add it to the specified organization 
exports.addUser = functions.https.onCall((data, context) => {

    //only owners/admins can add users when authenticated
    if (!context.auth || !(['owner', 'admin'].includes(data.contextRole))) {
        throw new functions.https.HttpsError('permission-denied', 'User is not an admin.');
    }

    //throws error if email does not belong to a user
    return admin.auth().getUserByEmail(data.email).then((userRecord) => {

        var userData = {
            userID: userRecord.uid,
            orgID: data.orgID, 
            name: userRecord.displayName, 
            email: data.email, 
            role: data.role, 
            groups: {},
            created: admin.firestore.FieldValue.serverTimestamp()
        }

        return admin.firestore().collection(`organizations/${data.orgID}/users`).doc(userRecord.uid).set(userData)
    }).then(() => {
        return { message: "User successfully added." }
    }).catch((err) => {
        console.log(err);

        switch(err.code) {
            case "auth/internal-error":
                throw new functions.https.HttpsError('unknown', 'Error, could not connect to the database. Please try again later.');
            case "auth/user-not-found":
                throw new functions.https.HttpsError('not-found', 'A user with this email does not exist.');
            default:
                throw new functions.https.HttpsError('unknown', err.message);
        }
    })
})

//modify specified user's data depending on the request
exports.editUser = functions.https.onCall((data, context) => {

    //only owners/admins can edit users when authenticated
    if (!context.auth || !(['owner', 'admin'].includes(data.contextRole))) {
        throw new functions.https.HttpsError('permission-denied', 'User is not an admin.');
    }

    const changedFields = { role: data.role }

    //retrieve and edit field 
    return admin.firestore().collection(`organizations/${data.orgID}/users`).doc(data.uid).update(changedFields).then(() => {
        return { message: "User role updated." }
    }).catch((err) => {
        console.log(err);

        switch(err.code) {
            case "auth/internal-error":
                throw new functions.https.HttpsError('unknown', 'Error, could not connect to the database. Please try again later.');
            default:
                throw new functions.https.HttpsError('unknown', err.message);
        }
    })
})

//remove user from the organization (delete their user document from the organization's users collection, and any other data pertaining to the user)
exports.removeUser = functions.https.onCall((data, context) => {

    //only owners/admins can remove users from their org
    if (!context.auth || !(['owner', 'admin'].includes(data.contextRole))) {
        throw new functions.https.HttpsError('permission-denied', 'User is not an admin.');
    }

    var docRef = admin.firestore().collection(`organizations/${data.orgID}/users`).doc(data.uid);
    return docRef.get().then((doc) => {

        //remove user from all groups they were part of 
        //(expand on this code and add to promises to remove any additional references to user from the group)
        var promises = [];
        for (i = 0; i < doc.data().groups.length; i++) {
            promises.push(admin.firestore().collection(`organizations/${data.orgID}/groups`).doc(doc.data().groups[i]).update({
                [`members.${data.uid}`]: admin.firestore.FieldValue.delete()
            }))
        }
        return Promise.allSettled(promises);
    }).then(() => {
        return docRef.delete();
    }).then(() => {
        return { message: "User successfully removed." }
    }).catch((err) => {
        console.log(err);

        switch(err.code) {
            case "auth/internal-error":
                throw new functions.https.HttpsError('unknown', 'Error, could not connect to the database. Please try again later.');
            default:
                throw new functions.https.HttpsError('unknown', err.message);
        }
    })
})

/*
exports.deleteOrg = functions.https.onCall((data, context) => {

    //only owners can delete their organization
    if (!context.auth || !(data.contextRole in ['owner'])) {
        throw new functions.https.HttpsError('permission-denied', 'User is not an admin.');
    }

    return deleteOrganization().then(() => {

    }).catch((err) => { 

    })
})
*/

//AUTOMATIC 
//---------------------------------------------------------------

//TEMP
exports.deleteUserDoc = functions.auth.user().onDelete((user) => {

    //use a collection group query to search through all the 'users' subcollections to find the document of the user that was deleted
    //all background functions need to return a promise
    return admin.firestore().collectionGroup('users').where('userID', '==', user.uid).get().then((querySnapshot) => {
        console.log(user.uid);
        querySnapshot.forEach((doc) => {
            doc.ref.delete();
        })
    });
})

/*
//when a user is deleted from authentication/console, want to automatically delete the corresponding user documents
exports.deleteUserDoc = functions.auth.user().onDelete((user) => {

    //use a collection group query to search through all the 'users' subcollections to find the documents of the user that was deleted
    //all background functions need to return a promise
    return admin.firestore().collectionGroup('users').where('userID', '==', user.uid).get().then((querySnapshot) => {
        console.log(user.uid);
        var promises = [];
        querySnapshot.forEach((userRef) => {

            //check if user is the owner of an organization; if so, delete the organization
            if (userRef.data().role === 'owner') {

                //if you delete organization, no need to individually delete user data
                var orgRef = doc.ref.parent.parent.get();
                promises.push(deleteOrganization({id: orgRef.id, name: userRef.data().name}));
            }
            else {

                promises.push(removeUserData({id: user.uid, doc.id}));
            }

            //if you delete organization, no need to individually delete user data
            //add deleteOrganization, custom promise, to promise.all with doc.ref.delete(), which returns a promise
            //

            removeUserData(user.uid, doc.id);
            //doc.ref.delete();
        })

        //code inside Promise executes synchronously; all promises should be in array before execution
        return Promise.all(promises)     
    }).then(() => {

    }).catch((err) => {

    })
})
*/

//deleting user from database/console

//deleting org from database/console

//when an organization is deleted, want to automatically delete all corresponding data and files
//deleting a document does not recursively delete all the subcollections
//(only real usecase is deleting an organization document from the firebase console)
/*
exports.deleteOrgData = functions.firestore.document('organizations/{orgID}').onDelete((snap, context) => {
    
})
*/

//outdated vvv

//SUPER ADMIN 
//---------------------------------------------------------------

//onCall returns a promise and is asynchronous
exports.adminCreate = functions.https.onCall((data, context) => {
    var uid = null;

    //only admins can create admins
    if (context.auth.token.admin !== true) {
        throw new functions.https.HttpsError('permission-denied', 'User is not an admin.');
    }

    //create user, add custom claims to make admin, then add user document to admin organization; if anything fails, delete the incomplete user
    //in contrast to createUserWithEmailAndPassword, createUser does not sign you in as the user
    return admin.auth().createUser({
        email: data.userData.email,
        password: data.password,
        displayName: data.userData.name
    }).then((userRecord) => {  
        uid = userRecord.uid;
        console.log("Adding custom claims...");
        return admin.auth().setCustomUserClaims(uid, {admin: true});
    }).then(() => {
        console.log("Creating user document...");
        data.userData.created = admin.firestore.FieldValue.serverTimestamp();
        data.userData.userID = uid;
        return admin.firestore().collection(`organizations/${data.userData.orgID}/users`).doc(uid).set(data.userData);
    }).then(() => {
        console.log("Updating profile...");
        admin.auth().updateUser(uid, {displayName: data.userData.name});

        //message is accessible in 'result' passed to .then callback function (for promise returned by createAdmin on the client-side)
        return { message: "Admin successfully created." }
    }).catch((err) => {
        console.log(err);

        if (uid !== null) {
            console.log("Authentication failed. Deleting incomplete user...");
            admin.auth().deleteUser(uid);
        }

        //throw HttpsError to send an error to .catch callback function
        switch(err.code) {
            case "auth/internal-error":
                throw new functions.https.HttpsError('unknown', 'Error, could not connect to the database. Please try again later.');
            default:
                throw new functions.https.HttpsError('unknown', err.message);
        }
    })
})

//when a user is signed-in/created, want to automatically add the corresponding user document
//when a user is signed-in/created, want to automatically update profile
//[ADD FUNCTION]

//add a user to any organization
exports.userCreate = functions.https.onCall((data, context) => {
    var uid = null;

    //only admins can add a user to any organization 
    if (context.auth.token.admin !== true) {
        throw new functions.https.HttpsError('permission-denied', 'User is not an admin.');
    }

    //create user, then add user document to admin organization; if anything fails, delete the incomplete user
    return admin.auth().createUser({
        email: data.userData.email,
        password: data.password,
        displayName: data.userData.name
    }).then((userRecord) => {
        console.log("Creating user document...");
        uid = userRecord.uid;
        data.userData.created = admin.firestore.FieldValue.serverTimestamp();
        data.userData.userID = uid;
        return admin.firestore().collection(`organizations/${data.userData.orgID}/users`).doc(uid).set(data.userData);
    }).then(() => {
        console.log("Updating profile...");
        admin.auth().updateUser(uid, {displayName: data.userData.name});
        return { message: "User successfully created." }
    }).catch((err) => {
        console.log(err);
        if (uid !== null) {
            console.log("Authentication failed. Deleting incomplete user...");
            admin.auth().deleteUser(uid);
        }

        switch(err.code) {
            case "auth/internal-error":
                throw new functions.https.HttpsError('unknown', 'Error, could not connect to the database. Please try again later.');
            default:
                throw new functions.https.HttpsError('unknown', err.message);
        }
    })
})

//delete a user from authentication
exports.userDelete = functions.https.onCall((data, context) => {

    //only admins can delete any user
    if (context.auth.token.admin !== true) {
        throw new functions.https.HttpsError('permission-denied', 'User is not an admin.');
    }

    return admin.auth().deleteUser(data.uid).then(() => {
        return { message: "User successfully deleted." }
    }).catch((err) => {

        switch(err.code) {
            case "auth/internal-error":
                throw new functions.https.HttpsError('unknown', 'Error, could not connect to the database. Please try again later.');
            default:
                throw new functions.https.HttpsError('unknown', err.message);
        }
    })
})

//edit a user's authentication and document data
exports.userEdit = functions.https.onCall((data, context) => {

    //only admins can edit any user
    if (context.auth.token.admin !== true) {
        throw new functions.https.HttpsError('permission-denied', 'User is not an admin.');
    }

    //query user by ID then edit the respective fields of the user document
    return admin.firestore().collectionGroup('users').where('userID', '==', data.uid).get().then((querySnapshot) => {
        if (data.doc) {
            console.log("Updating user document...");
            querySnapshot.forEach((doc) => {
                doc.ref.update(data.docData);
            })
        }

        //edit authentication data
        if (data.auth) {
            console.log("Updating user authentication...");
            return admin.auth().updateUser(data.uid, data.authData)
        }
    }).then(() => {
        return { message: "User successfully updated." }
    }).catch((err) => {

        switch(err.code) {
            case "auth/internal-error":
                throw new functions.https.HttpsError('unknown', 'Error, could not connect to the database. Please try again later.');
            default:
                throw new functions.https.HttpsError('unknown', err.message);
        }
    })
})