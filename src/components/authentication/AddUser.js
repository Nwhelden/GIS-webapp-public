            //after creating a user, create a user document with additional information for the database
            /*
            var userData = {
                userID: userCredential.user.uid,
                orgID: "", 
                name: name.value, 
                email: email.value, 
                role: "", 
                groups: {},
                created: firebase.firestore.FieldValue.serverTimestamp()
            }

            //try adding the user document to the database and redirect to dashboard
            db.collection(`organizations/${key.value}/users`).doc(userCredential.user.uid).set(userData).then(() => {
                userCredential.user.updateProfile({displayName: name.value});
                return db.collection(`organizations/${key.value}/privateData`).get()
            }).then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    doc.ref.update({[`roles.${userCredential.user.uid}`]: "guest"})
                })
                ---
                return new Promise((resolve, reject) => {
                    db.collectionGroup('users').where('userID', '==', userCredential.user.uid).get().then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            var data = doc.data();
                            db.collection(`organizations/${data.orgID}/privateData`).get().then((querySnapshot) => {
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
                ---
                console.log("redirecting...");
                setPermsFlag(true);
                //history.push('/');
            }).catch((err) => {

                //if user can't be added to the database, delete the user
                userCredential.user.delete();
                console.log(err);
                setError("Could not connect with the database. Please try again later.");
            })
            */