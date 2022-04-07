import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import YoutubeFrame from "./Video/YoutubeFrame";
import {HubConnectionBuilder, LogLevel} from "@microsoft/signalr"
import authService from "./api-authorization/AuthorizeService";

export default function Instance() {
    let [instance, setInstance] = useState(null);
    let instanceId = useParams();
    const [hubDisconnected, setHubDisconnected] = useState(false);
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        async function run() {
            let hubConnection = await new HubConnectionBuilder().withUrl('https://localhost:7198/hub', {accessTokenFactory: async () => await authService.getAccessToken()}) // todo change on prod
                .configureLogging(LogLevel.Information)
                .withAutomaticReconnect()
                .build();

            setConnection(hubConnection);
        }
        run();
    }, [])

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(result => {
                    console.log('Connected!');
                })
                .catch(e => console.log('Connection failed: ', e));
        }
    }, [connection]);

    useEffect(() => {
        instance = fetch("instance/" + instanceId.instanceName, {
            method: "GET"
        }).then((response) => {
            if (response.ok) {
                response.json().then((json) => setInstance(json));
            }
        })
    }, [])

    function checkInstanceExists() {
        if (instance !== null) {
            return <div>
                <h1>{instance.name}</h1>
                <div>
                    <p>Welcome to {instance.name} created on {instance.createdDate}</p>
                    <YoutubeFrame signlar={connection} instanceId={instanceId} />
                </div>
            </div>
        } else {
            return <h1>Instance does not exist</h1>
        }
    }

    return checkInstanceExists();
}
