import React, { useEffect, useState, useRef } from 'react'
import { useAuth } from "../contexts/Auth"
import UserList from '../components/dashboard/UserList'
import FileList from '../components/dashboard/FileList'
import DataList from '../components/dashboard/DataList'
import StyleCard from '../components/dashboard/StyleCard'
import MapView from '@arcgis/core/views/MapView'
import WebMap from '@arcgis/core/WebMap'
import { Col, Container, Row } from 'react-bootstrap'

export default function Dashboard() {
    const [layers, setLayers] = useState([]);
    const MapContainer = useRef(null);
    const {currentUser, currentPerms} = useAuth();
    const admins = ["owner", "admin"]

    useEffect(() => {
        const webmap = new WebMap({
            basemap: 'topo-vector',
            layers: layers
        })

        let view = new MapView({
            map: webmap,
            container: MapContainer.current
        })

        view.center = [-82.5, 27.3];
        view.zoom = 11;

        return() => {
            if (!!view) {
                view.destroy();
                view = null;
            }
        }

    }, [layers])

    /*
        let view;
        var path = storage.ref('organizations/vvYk7BzZr5PnGevtCy6W/skateboard_parks.geojson')
        path.getDownloadURL().then((url) => {
            const geojsonLayer = new GeoJSONLayer({
                url: url
            });
    
            const webmap = new WebMap({
                basemap: 'topo-vector',
                layers: layers
            })
    
            view = new MapView({
                map: webmap,
                container: MapContainer.current
            })
    
            view.center = [-82.5, 27.3];
            view.zoom = 11;

            webmap.add(geojsonLayer)
        })
    */

    //import { WebMap } from '@esri/react-arcgis'
    //old react-arcgis map
    /*
                <WebMap id="c129310b39f64947b2450f2dd37b65dc" style={{ width: '65vw', height: '80vh' }} basemap="dark-gray"
                    viewProperties={{
                        center: [-82.55972065626271, 27.326698622848458],
                        zoom: 15
                    }}
                />
    */

    /*
    const test = () => {
        console.log("Testing layer add");
        const template = {
            title: "Crime Information",
            content: "Crime Category: {offense_description} at {address}"
        }
        const geojsonLayer = new GeoJSONLayer({
            url: "https://raw.githubusercontent.com/adarshvarma15/mygeojson/main/RMS_Crime_Incidents%20edited.geojson",
            popupTemplate: template
        });

        //const array = [];
        //array.push(geojsonLayer)
        setLayers(array => [...array, geojsonLayer]);

        //layers.add(geojsonLayer);
    }
    */

    //render different dashboards depending on user role
    return (
        <Container fluid className="App">
            <Row>
            <Col style={{height:"10vh", textAlign: "center"}}>
                <h1 className="title">
                    Proformit
                </h1>
            </Col>    
            </Row>

            <Row>
            <Col style={{height:"90vh"}}>
                { (currentUser && !admins.includes(currentPerms.role)) &&
                    <div>
                        <h1>Dashboard</h1>
                        <p>User dashboard... Nothing here yet!</p>
                    </div>
                }
                { (currentUser && admins.includes(currentPerms.role)) &&
                    <div>
                        <h1>Dashboard</h1>
                        <div className="Card">
                            <h4>Users</h4>
                            <UserList org={{id: currentPerms.orgID, name: currentPerms.orgName}} />
                        </div>
                        <br></br>
                        <div className="Card">
                            <h4>Files</h4>
                            <FileList org={{id: currentPerms.orgID, name: currentPerms.orgName}} />
                        </div>
                    </div>
                }
            </Col>
            <Col style={{height:"90vh"}}>
                <div style={{width: '65vw', height: '80vh'}} ref={MapContainer}/>
            </Col>
            <Col style={{height:"90vh"}}>
                <Row className="Card">
                    <h4>
                        Data Selector
                    </h4>
                    <DataList org={{id: currentPerms.orgID, name: currentPerms.orgName}} setLayers={setLayers} />
                </Row>
                <br>
                </br>
                <Row className="Card">
                    <h4>
                        Styles
                    </h4>
                    <StyleCard org={{id: currentPerms.orgID, name: currentPerms.orgName}} />
                </Row>
            </Col>
            </Row>
        </Container>
    )
}
