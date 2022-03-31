import React, {useEffect} from 'react';
import YouTube from "react-youtube";

export default function YoutubeFrame(props) {
    let player = null;
    let connection = props.signlar;

    connection.on("Test", message => {
        console.log(message);
    })
    
    useEffect(() => {
        setInterval(() => {
            console.log(connection);
            if (player != null && player.getCurrentTime()) {
                try {
                    console.log(player.getCurrentTime());
                    connection.invoke("ReceiveClientTime", player.getCurrentTime()).catch(function (err) {
                        return console.error(err.toString());
                    });
                } catch (err) {
                    console.error(err);
                }
            }
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