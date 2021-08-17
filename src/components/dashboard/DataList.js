import React, { useState, useEffect } from 'react'
import { storage, db } from '../../firebase'

import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer'

export default function DataList(props) {
    const [files, setFiles] = useState([]);

    //get datasets of specified organization into an array
    useEffect(() => {

        if (props.org.id) {

            const unsubscribe = db.collection(`organizations/${props.org.id}/files`).where("type", "==", ".geojson").onSnapshot((querySnapshot) => {
                const newFiles = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }))

                setFiles(newFiles);
            })

            return () => unsubscribe;
        }
    }, [props.org]);

    const addData = async (path) => {
        await storage.ref(path).getDownloadURL().then((url) => {
            const geojsonLayer = new GeoJSONLayer({
                url: url
            });

            props.setLayers(array => [...array, geojsonLayer])
        })
    } 

    return (
        <div>
            <ul>
                {files.map((file) => (
                    <li key={file.id}>
                        { 
                        <div>
                            <p>{file.name}</p>
                            <button onClick={() => addData(file.path)}>Add</button>
                        </div>
                        }
                    </li>
                ))}
            </ul>
        </div>
    )
}
