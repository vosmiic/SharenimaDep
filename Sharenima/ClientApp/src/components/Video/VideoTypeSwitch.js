import React from 'react';
import YoutubeFrame from "./YoutubeFrame";
import {Typography} from "@mui/material";

export default function VideoTypeSwitch(props) {

    if (props.videoIdList.length > 0) {
        switch (props.videoIdList[0].type) {
            case "YoutubeVideo":
                return <YoutubeFrame signlar={props.connection} instance={props.instance}
                                     accessToken={props.accessToken}
                                     setVideoIdList={props.setVideoIdList} videoIdList={props.videoIdList}/>
            case "UploadedVideo":
                return "uploaded video";
        }
    } else {
        return <div>
            <Typography>Please add a video to the queue</Typography>
        </div>
    }
}