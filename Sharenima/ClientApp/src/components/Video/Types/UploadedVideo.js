import {OnVideoFinished, OnVideoPause, OnVideoPlay} from "../VideoHelper";
import {useEffect, useRef, useState} from "react";
import {Player} from 'video-react';

export default function UploadedVideo(props) {
    let videoPlayer = useRef(null);
    const [initialLoad, setInitialLoad] = useState(true);
    const [muted, setMuted] = useState(false);
    
    /*useEffect(() => {
        console.log(videoPlayer);
        if (props.pauseVideo) {
            videoPlayer.actions.pause();
        } else {
            console.log("playing");
            videoPlayer.actions.mute();
            videoPlayer.actions.play();
        }
    }, [props.pauseVideo, videoPlayer])*/
    
    useEffect(() => {
        if (props.play) {
            videoPlayer.actions.play();
        } else {
            videoPlayer.actions.pause();
        }
    }, [props.play])

    async function handleOnPause() {
        await OnVideoPause(props.signalr, props.instance.name);
        videoPlayer.actions.pause();
    }

    async function handleOnPlay() {
        await OnVideoPlay(props.signalr, props.instance.name);
        videoPlayer.actions.play();
    }

    async function handleOnEnded() {
        await OnVideoFinished(props.videoList, props.setVideoList);
    }

    useEffect(() => {
        if (initialLoad) {
            videoPlayer.seek(props.instance.timeSinceStartOfCurrentVideo);
        }
        setInitialLoad(false);
    }, [])

    return <Player
        onPlay={handleOnPlay}
        onPause={handleOnPause}
        onEnded={handleOnEnded}
        autoPlay={props.autoPlay}
        muted={props.autoPlay}
        ref={(player) => {videoPlayer = player}}
        src={"files/" + props.videoList[0].url}
    />
}