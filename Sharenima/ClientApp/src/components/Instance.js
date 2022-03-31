import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import YoutubeFrame from "./Video/YoutubeFrame";
import {HubConnectionBuilder, LogLevel} from "@microsoft/signalr"

export default function Instance() {
    let [instance, setInstance] = useState(null);
    let instanceId = useParams();
    const [hubDisconnected, setHubDisconnected] = useState(false);
    var hubConnection = new HubConnectionBuilder().withUrl('https://localhost:7198/hub') // todo change on prod
        .configureLogging(LogLevel.Information)
        .build();


    useEffect(() => {
        async function start() {
            try {
                await hubConnection.start();
                console.log("SignalR Connected.");
            } catch (err) {
                console.log(err);
                setTimeout(start, 5000);
            }
        }

        hubConnection.onclose(() => {
            setHubDisconnected(true);
            start();
        });
        hubConnection.onreconnected(() => {
            setHubDisconnected(false);
        });
        start();
    })

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
                    <YoutubeFrame signlar={hubConnection}/>
                </div>
            </div>
        } else {
            return <h1>Instance does not exist</h1>
        }
    }

    return checkInstanceExists();
}
