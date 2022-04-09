import React, {useEffect} from 'react';
import YouTube from "react-youtube";
import authService from "../api-authorization/AuthorizeService";

export default function YoutubeFrame(props) {
    let player = null;
    let connection = props.signlar;

    useEffect(() => {
        if (props.accessToken != null) {
            setInterval(() => {
                async function run() {
                    if (player != null && player.getCurrentTime()) {
                        try {
                            connection.invoke("ReceiveClientTime", props.instance.name, props.accessToken, player.getCurrentTime()).catch(function (err) {
                                return console.error(err.toString());
                            });
                        } catch (err) {
                            console.error(err);
                        }
                    }
                }

                run();
            }, 1000)
        }
    }, [props.accessToken])

    useEffect(() => {
        connection.on("progress", (time) => {
            if (player != null) {
                var difference = player.getCurrentTime() - time;
                if (difference < -2 || difference > 2) {
                    player.seekTo(time);
                }
            }
        })
    }, [])

    function _onReady(event) {
        event.target.playVideo();
        event.target.seekTo(props.instance.timeSinceStartOfCurrentVideo);
        player = event.target;
    }

    return (
        <YouTube videoId={"K1PCl5D-IpU"} onReady={_onReady}
                 opts={{playerVars: {autoplay: 1, origin: window.location.origin}}}/>
    )
}