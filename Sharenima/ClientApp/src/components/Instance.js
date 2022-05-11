import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import {HubConnectionBuilder, LogLevel} from "@microsoft/signalr"
import authService from "./api-authorization/AuthorizeService";
import InstanceSettings from "./InstanceSettings/InstanceSettings";
import {Grid, IconButton, InputBase, Paper} from "@mui/material";
import {AddCircle} from "@mui/icons-material";
import SidePanel from "./SidePanel/SidePanel";
import Video from "./Video/Video";

export default function Instance() {
    let [instance, setInstance] = useState(null);
    let instanceId = useParams();
    const [hubDisconnected, setHubDisconnected] = useState(false);
    const [connection, setConnection] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [videoList, setVideoList] = useState([]);

    useEffect(() => {
        async function run() {
            const accessToken = await authService.getAccessToken();
            let hubConnection = await new HubConnectionBuilder().withUrl('https://localhost:7198/hub', {accessTokenFactory: async () => accessToken}) // todo change on prod
                .configureLogging(LogLevel.Information)
                .withAutomaticReconnect()
                .build();

            setAccessToken(accessToken);
            setConnection(hubConnection);
        }

        run();
    }, [])

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(result => {
                    console.log('Connected!');

                    connection.invoke("JoinGroup", instanceId.instanceName).catch(function (err) {
                        return console.error(err.toString());
                    });
                })
                .catch(e => console.log('Connection failed: ', e));
        }
    }, [connection]);

    useEffect(() => {
        fetch("instance/" + instanceId.instanceName, {
            method: "GET"
        }).then((response) => {
            if (response.ok) {
                response.json().then((json) => {
                        setInstance(json.instance)
                        setVideoList(json.videoQueue);
                    }
                );
            }
        })
    }, [])

    function checkInstanceExists() {
        if (instance !== null) {
            return <div>
                <h1>{instance.name}</h1>
                <InstanceSettings instance={instance}/>
                <p>Welcome to {instance.name} created on {instance.createdDate}</p>
                <Grid container spacing={2}>
                    <Grid item xs={8}>
                        <Video signalr={connection}
                               instance={instance}
                               setInstance={setInstance}
                               setVideoList={setVideoList}
                               videoList={videoList}/>
                    </Grid>
                    <Grid item xs={4}>
                        <SidePanel signalr={connection} instance={instance} setVideoIdList={setVideoList}
                                   videoIdList={videoList}/>
                    </Grid>
                </Grid>
            </div>
        } else {
            return <h1>Instance does not exist</h1>
        }
    }

    return checkInstanceExists();
}
