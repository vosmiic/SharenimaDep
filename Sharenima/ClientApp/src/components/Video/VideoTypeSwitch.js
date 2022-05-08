import React, {useEffect, useState} from 'react';
import YoutubeFrame from "./Types/YoutubeFrame";
import {Typography} from "@mui/material";
import UploadedVideo from "./Types/UploadedVideo";

export default function VideoTypeSwitch(props) {
    const [pauseVideo, setPauseVideo] = useState(false);

    useEffect(() => {
        if (props.signalr != null) {
            props.signalr.on("StateChange", (state) => {
                switch (state) {
                    case "Playing":
                        setPauseVideo(true);
                        break;
                    case "Paused":
                        setPauseVideo(false);
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
                                      pauseVideo={pauseVideo}
                />
        }
    } else {
        return <div>
            <Typography>Please add a video to the queue</Typography>
        </div>
    }
}