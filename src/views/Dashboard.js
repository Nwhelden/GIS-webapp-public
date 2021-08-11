import React from 'react'
//import { auth, db } from '../firebase'
import { useAuth } from "../contexts/Auth"
import UserList from '../components/dashboard/UserList'
import FileList from '../components/dashboard/FileList'
import { WebMap } from '@esri/react-arcgis';
import { Col, Container, Row } from 'react-bootstrap';


export default function Dashboard() {
    const {currentUser, currentPerms} = useAuth();
    const admins = ["owner", "admin"]

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
                <WebMap id="c129310b39f64947b2450f2dd37b65dc" style={{ width: '65vw', height: '80vh' }} basemap="dark-gray"
                    viewProperties={{
                        center: [-82.55972065626271, 27.326698622848458],
                        zoom: 15
                    }}
                />
            </Col>
            <Col style={{height:"90vh"}}>
                <Row className="Card">
                    <h4>
                        Data Selector
                    </h4>
                </Row>
                <br>
                </br>
                <Row className="Card">
                    <h4>
                        Styles
                    </h4>
                </Row>
            </Col>
            </Row>
        </Container>
    )
}
