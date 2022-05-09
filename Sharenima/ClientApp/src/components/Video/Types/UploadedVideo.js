import {OnVideoFinished, OnVideoPause, OnVideoPlay} from "../VideoHelper";
import {useEffect, useRef, useState} from "react";

export default function UploadedVideo(props) {
    const videoPlayer = useRef(null);
    const [initialLoad, setInitialLoad] = useState(true);
    const [muted, setMuted] = useState(false);

    useEffect(() => {
        if (props.pauseVideo) {
            videoPlayer.current.pause();
        } else {
            videoPlayer.current.play().catch(() => {
                setMuted(true);
                videoPlayer.current.play();
            });
        }
    }, [props.pauseVideo])

    async function handleOnPause() {
        await OnVideoPause(props.signalr, props.instance.name);
    }

    async function handleOnPlay() {
        await OnVideoPlay(props.signalr, props.instance.name);
    }

    async function handleOnEnded() {
        await OnVideoFinished(props.videoList, props.setVideoList);
    }

    useEffect(() => {
        if (initialLoad) {
            videoPlayer.current.currentTime = props.instance.timeSinceStartOfCurrentVideo;
        }
        setInitialLoad(false);
    }, [])

    return <video
        onPlay={handleOnPlay}
        onPause={handleOnPause}
        onEnded={handleOnEnded}
        autoPlay={props.pauseVideo}
        muted={muted}
        controls
        ref={videoPlayer}
        id={"uploadedVideo"}
        src={"files/" + props.videoList[0].url}
    />
}