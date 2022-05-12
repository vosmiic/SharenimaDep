import {OnProgress, OnVideoFinished, OnVideoPause, OnVideoPlay} from "./VideoHelper";
import React, {useEffect, useRef, useState} from "react";
import ReactPlayer from "react-player";
import {Typography} from "@mui/material";
import authService from "../api-authorization/AuthorizeService";

export default function Video(props) {
    let videoPlayer = useRef(null);
    const [initialLoad, setInitialLoad] = useState(true);
    const [videoSettings, setVideoSettings] = useState({
        "playing": props.instance.state !== 1
    })

    useEffect(() => {
        if (props.signalr != null) {
            props.signalr.on("StateChange", (state) => {
                let newVideoSettings = {...videoSettings};
                let newInstance = props.instance;

                switch (state) {
                    case "Playing":
                        newInstance.state = 0;
                        newVideoSettings.playing = true;
                        break;
                    case "Paused":
                        newInstance.state = 1;
                        newVideoSettings.playing = false;
                        break;
                }

                setVideoSettings(newVideoSettings);
                props.setInstance(newInstance);
            })
        }
    }, [props.signalr])

    useEffect(() => {
        if (props.signalr != null) {
            props.signalr.on("ProgressChange", (time) => {
                if (videoPlayer && videoPlayer.getCurrentTime) {
                    const difference = videoPlayer.getCurrentTime - time;
                    console.log(difference);
                    if (difference < -2 || difference > 2) {
                        videoPlayer.seekTo(time);
                    }
                }
            })
        }
    }, [props.signalr])

    async function handleOnPause() {
        if (videoPlayer.getCurrentTime() !== videoPlayer.getDuration()) {
            // prevent pausing at the end of a video
            await OnVideoPause(props.signalr, props.instance.name);
        }
    }

    async function handleOnPlay() {
        await OnVideoPlay(props.signalr, props.instance.name);
    }

    async function handleOnEnded() {
        await OnVideoFinished(props.videoList, props.setVideoList);
    }

    function onReady() {
        console.log(videoPlayer);
        if (initialLoad) {
            videoPlayer.seekTo(props.instance.timeSinceStartOfCurrentVideo, 'seconds');
            setInitialLoad(false);
        }
    }

    async function handleOnProgress(event) {
        const token = await authService.getAccessToken();
        if (props.signalr != null && videoPlayer) {
            try {
                props.signalr.invoke("ReceiveClientTime", props.instance.name, token, event.playedSeconds).catch(function (err) {
                    return console.error(err.toString());
                });
            } catch (err) {
                console.error(err);
            }
        }
    }

    if (props.videoList.length > 0) {
        return <ReactPlayer
            onPlay={handleOnPlay}
            onPause={handleOnPause}
            onEnded={handleOnEnded}
            onReady={onReady}
            onProgress={(event) => {
                handleOnProgress(event)
            }}
            controls
            playing={videoSettings.playing}
            muted={true}
            ref={(player) => {
                videoPlayer = player
            }}
            url={props.videoList[0].type === "UploadedVideo" ? "files/" + props.videoList[0].url : props.videoList[0].url}/>
    } else {
        return <div>
            <Typography>Please add a video to the queue</Typography>
        </div>
    }
}