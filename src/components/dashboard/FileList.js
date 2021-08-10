import React, { useState, useEffect } from 'react'
import { useAuth } from "../../contexts/Auth"
import { storage, db } from '../../firebase'
import FileCard from './FileCard'

export default function FileList(props) {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [pending, setPending] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploadRender, setUploadRender] = useState(false);
    const [fileObj, setFileObj] = useState(null);
    const {currentPerms} = useAuth();
    const supportedTypes = ["geojson", "png", "jpg", "svg", "gltf"]

    //get files of specified organization into an array
    useEffect(() => {

        if (props.org.id) {
            setPending(true);

            const unsubscribe = db.collection(`organizations/${props.org.id}/files`).orderBy("name").onSnapshot((querySnapshot) => {
                const newFiles = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }))

                setFiles(newFiles);
                setPending(false);
            })

            return () => unsubscribe;
        }
    }, [props.org]);

    const uploadFile = (event) => {
        setFileObj(event.target.files[0])
    }

    const toggleUpload = () => {
        setUploadRender(!uploadRender);
    }

    const handleUpload = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        setPending(true);

        const { name } = event.target.elements; //get input from respective form fields
        console.log(fileObj);

        //make sure that the file type and size is supported before upload
        var extension = fileObj.name.split('.').pop();
        if (!supportedTypes.includes(extension)) {
            setError("File type not supported.")
            setPending(false);
            return;
        }
        else if (fileObj.size > 2147483648) {
            setError("Maximum file size is 2GB")
            setPending(false);
            return;
        }
        else {

            //entering a name is optional; if a name isn't entered, use the original name of the file without the extension
            var filename = fileObj.name.split('.')[0];
            if (name.value) {
                filename = name.value;
            }

            var fileRef = storage.ref().child(`organizations/${props.org.id}/${filename}`)
            //const url = await fileRef.getDownloadURL();

            var fileData = {
                name: filename,
                size: fileObj.size,
                type: '.' + extension
            }

            console.log(fileData);

            console.log("test");

            //upload the file to the organization's storage, then create a corresponding doucment in the database with relative information
            fileRef.put(fileObj).then((snapshot) => {
                console.log("Uploaded a file")
                return db.collection(`organizations/${props.org.id}/files`).add(fileData)
            }).then(() => {
                console.log("Uploaded a file")
            }).catch((err) => {
                console.log("Upload failed")
                console.log(err);
            })
        }
    }

    const testFunc = async () => {
        var storageRef = storage.ref();
        var listRef = storageRef.child(`organizations/${props.org.name}`)
        listRef.listAll().then((res) => {
            res.prefixes.forEach((folderRef) => {
                console.log(folderRef);
            })
            res.items.forEach((itemRef) => {
                console.log(itemRef);
            })
        })
    }
    //<button onClick={() => testFunc()}>Test</button>

    return (
        <div>
            <ul>
                {files.map((file) => (
                    <li key={file.id}>
                        <FileCard file={file} />
                    </li>
                ))}
            </ul>
            <div>
                <button disabled={pending} onClick={() => toggleUpload()}>Add File</button>
                { uploadRender &&
                    <form onSubmit={handleUpload}>
                        <label>
                            Name
                            <input name="name" type="text" />
                        </label>
                        <label>
                            File
                            <input name="file" type="file" accept=".geojson,.png,.jpg,.svg,.gltf" required onChange={uploadFile}/>
                        </label>
                        <button disabled={pending}>Upload</button>
                    </form>
                }
                {pending && <p>Loading...</p>}
                {success && <p style={{color: 'green'}}>{success}</p>}
                {error && <p style={{color: 'red'}}>{error}</p>}
            </div>
        </div>
    )
}
