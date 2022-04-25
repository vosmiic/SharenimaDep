import React, {useEffect, useRef, useState} from 'react';
import YouTube from "react-youtube";
import authService from "../api-authorization/AuthorizeService";
import {instance} from "eslint-plugin-react/lib/util/lifecycleMethods";

export default function YoutubeFrame(props) {
    const playerRef = useRef(null);
    const [currentPlaying, setCurrentlyPlaying] = useState({"videoId": null});

    useEffect(() => {
        if (props.accessToken != null) {
            setInterval(() => {
                async function run() {
                    if (props.signlar != null && playerRef?.current?.internalPlayer) {
                        playerRef?.current?.internalPlayer.getCurrentTime().then(function (time) {
                            try {
                                props.signlar.invoke("ReceiveClientTime", props.instance.name, props.accessToken, time).catch(function (err) {
                                    return console.error(err.toString());
                                });
                            } catch (err) {
                                console.error(err);
                            }
                        })
                    }
                }

                run();
            }, 1000)
        }
    }, [props.accessToken])

    useEffect(() => {
        if (props.signlar != null) {
            props.signlar.on("ProgressChange", (time) => {
                if (playerRef?.current?.internalPlayer) {
                    var difference = playerRef?.current?.internalPlayer.getCurrentTime() - time;
                    if (difference < -2 || difference > 2) {
                        playerRef?.current?.internalPlayer.seekTo(time);
                    }
                }
            })
        }
    }, [props.signlar])

    useEffect(() => {
        if (props.signlar != null) {
            props.signlar.on("StateChange", (state) => {
                if (playerRef?.current?.internalPlayer) {
                    switch (state) {
                        case "Playing":
                            playerRef?.current?.internalPlayer.playVideo();
                            break;
                        case "Paused":
                            playerRef?.current?.internalPlayer.pauseVideo();
                            break;
                    }
                }
            })
        }
    }, [props.signlar])

    useEffect(() => {
        if (props.videoIdList != null) {
            if (props.videoIdList[0] != null) {
                setCurrentlyPlaying(props.videoIdList[0]);
            }
        }
    }, [props.videoIdList])

    function _onReady(event) {
        event.target.seekTo(props.instance.timeSinceStartOfCurrentVideo);
        if (props.instance.state !== 1) {
            event.target.playVideo();
        } else {
            event.target.pauseVideo();
        }
    }

    function _onStateChanged(event) {
        if (props.accessToken != null && playerRef?.current?.internalPlayer) {
            switch (event.data) {
                case 1:
                    props.signlar.invoke("StateChange", props.instance.name, props.accessToken, "Playing").catch(function (err) {
                        return console.error(err.toString());
                    });
                    break;
                case 2:
                    props.signlar.invoke("StateChange", props.instance.name, props.accessToken, "Paused").catch(function (err) {
                        return console.error(err.toString());
                    });
                    break;
                case 0:
                    if (props.videoIdList != null) {
                        const index = props.videoIdList.indexOf(currentPlaying);
                        if (props.videoIdList[index + 1] != null) {
                            setCurrentlyPlaying(props.videoIdList[index + 1]);
                            playerRef?.current?.internalPlayer.loadVideoById(props.videoIdList[index + 1].videoId, 0);
                        }
                        let videoIdListCopy = [...props.videoIdList];
                        videoIdListCopy.splice(index, 1);
                        props.setVideoIdList(videoIdListCopy);
                    }
                    break;
            }
        }
    }

    return (
        <YouTube videoId={currentPlaying.videoId} ref={playerRef} onReady={_onReady} onStateChange={_onStateChanged}
                 opts={{playerVars: {origin: window.location.origin}, width: "100%", height: "500"}}/>
    )
}