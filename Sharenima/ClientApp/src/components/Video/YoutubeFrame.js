import React, {useEffect} from 'react';
import YouTube from "react-youtube";
import authService from "../api-authorization/AuthorizeService";
import {instance} from "eslint-plugin-react/lib/util/lifecycleMethods";

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
        if (connection != null) {
            connection.on("ProgressChange", (time) => {
                if (player != null) {
                    var difference = player.getCurrentTime() - time;
                    if (difference < -2 || difference > 2) {
                        player.seekTo(time);
                    }
                }
            })
        }
    }, [connection])

    useEffect(() => {
        if (connection != null) {
            connection.on("StateChange", (state) => {
                if (player != null) {
                    switch (state) {
                        case "Playing":
                            player.playVideo();
                            break;
                        case "Paused":
                            player.pauseVideo();
                            break;
                    }
                }
            })
        }
    }, [connection])

    function _onReady(event) {
        event.target.seekTo(props.instance.timeSinceStartOfCurrentVideo);
        console.log(props.instance.state);
        if (props.instance.state !== 1) {
            event.target.playVideo();
        } else {
            event.target.pauseVideo();
        }
        player = event.target;
    }

    function _onStateChanged(event) {
        if (props.accessToken != null && player != null) {
            switch (event.data) {
                case 1:
                    connection.invoke("StateChange", props.instance.name, props.accessToken, "Playing").catch(function (err) {
                        return console.error(err.toString());
                    });
                    break;
                case 2:
                    connection.invoke("StateChange", props.instance.name, props.accessToken, "Paused").catch(function (err) {
                        return console.error(err.toString());
                    });
                    break;
            }
        }
    }

    return (
        <YouTube videoId={"K1PCl5D-IpU"} onReady={_onReady} onStateChange={_onStateChanged}
                 opts={{playerVars: {origin: window.location.origin}}}/>
    )
}