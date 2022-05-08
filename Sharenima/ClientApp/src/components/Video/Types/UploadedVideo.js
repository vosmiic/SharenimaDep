import {OnVideoFinished, OnVideoPause, OnVideoPlay} from "../VideoHelper";
import {useEffect, useRef, useState} from "react";

export default function UploadedVideo(props) {
    const videoPlayer = useRef(null);
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
    
    async function handleOnLoad() {
        if (props.instance.state !== 1 && props.videoList[0] != null) {
            console.log("playing");
            videoPlayer.current.play().catch(() => {
                videoPlayer.current.mute();
                videoPlayer.current.play();
            });
        } else {
            videoPlayer.current.pause();
        }
    }

    return <video
        onPlay={handleOnPlay}
        onPause={handleOnPause}
        onEnded={handleOnEnded}
        onLoad={handleOnLoad}
        muted={muted}
        controls
        ref={videoPlayer}
        id={"uploadedVideo"}
        src={"files/" + props.videoList[0].url}
    />
}