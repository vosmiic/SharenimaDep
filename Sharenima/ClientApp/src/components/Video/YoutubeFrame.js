import React, {useEffect} from 'react';
import YouTube from "react-youtube";
import authService from "../api-authorization/AuthorizeService";

export default function YoutubeFrame(props) {
    let player = null;
    let connection = props.signlar;
    
    useEffect(() => {
        setInterval(() => {
            async function run() {
                if (player != null && player.getCurrentTime()) {
                    try {
                        connection.invoke("ReceiveClientTime", props.instanceId.instanceName, await authService.getAccessToken(), player.getCurrentTime()).catch(function (err) {
                            return console.error(err.toString());
                        });
                    } catch (err) {
                        console.error(err);
                    }
                }
            }
            run();
        }, 5000)
    }, [])
    
    function _onReady(event) {
        event.target.playVideo();
        player = event.target;
    }
    
    return (
        <YouTube videoId={"K1PCl5D-IpU"} onReady={_onReady} opts={{playerVars: {autoplay: 1, origin: window.location.origin}}}/>
    )
}