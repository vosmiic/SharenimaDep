import React, {useEffect, useState} from 'react';
import YoutubeFrame from "./Types/YoutubeFrame";
import {Typography} from "@mui/material";
import UploadedVideo from "./Types/UploadedVideo";

export default function VideoTypeSwitch(props) {
    const [autoPlay, setAutoPlay] = useState(props.instance.state !== 1);
    const [play, setPlay] = useState(props.instance.state !== 1);

    useEffect(() => {
        if (props.signalr != null) {
            props.signalr.on("StateChange", (state) => {
                switch (state) {
                    case "Playing":
                        setPlay(true);
                        break;
                    case "Paused":
                        setPlay(false);
                        break;
                }
            })
        }
    }, [props.signalr])

    if (props.videoList.length > 0) {
        switch (props.videoList[0].type) {
            case "YoutubeVideo":
                return <YoutubeFrame signalr={props.signalr}
                                     instance={props.instance}
                                     accessToken={props.accessToken}
                                     setVideoList={props.setVideoList}
                                     videoList={props.videoList}
                />
            case "UploadedVideo":
                return <UploadedVideo signalr={props.signalr}
                                      instance={props.instance}
                                      setVideoList={props.setVideoList}
                                      videoList={props.videoList}
                                      autoPlay={autoPlay}
                                      play={play}
                />
        }
    } else {
        return <div>
            <Typography>Please add a video to the queue</Typography>
        </div>
    }
}