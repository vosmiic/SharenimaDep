import {Box, Button, IconButton, InputBase, List, Paper, Stack, Typography} from "@mui/material";
import {AddCircle} from "@mui/icons-material";
import React, {useEffect} from "react";
import authService from "../api-authorization/AuthorizeService";
import VideoUpload from "./VideoUpload";

export default function Queue(props) {
    async function onVideoAdd() {
        const token = await authService.getAccessToken();

        fetch("video/" + props.instance.name + "?url=" + document.getElementById("videoLink").value, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? 'Bearer ' + token : {}
            }
        }).then((response) => {
            if (response.ok) {

            }
        });
    }

    useEffect(() => {
        if (props.signalr != null) {
            props.signalr.on("VideoAddedToQueue", (videos) => {
                props.setVideoIdList([...props.videoIdList, videos]);
            })
        }
    }, [props.signalr])

    useEffect(() => {
        if (props.signalr != null) {
            props.signalr.on("VideoRemovedFromQueue", (video) => {
                let videoIdListCopy = [...props.videoIdList];
                videoIdListCopy.splice(video, 1);
                props.setVideoIdList(videoIdListCopy);
            })
        }
    }, [props.signalr])

    async function skipVideo() {
        const token = await authService.getAccessToken();

        fetch("video/" + props.instance.name + "?url=" + document.getElementById("videoLink").value + "&videoId=" + props.videoIdList[0].id, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? 'Bearer ' + token : {}
            }
        }).then((response) => {
            if (!response.ok) {
                // could not skip video
            }
        });
    }

    return (<>
            <Paper>
                <InputBase id={"videoLink"} placeholder={"Enter video link"}/>
                <IconButton onClick={onVideoAdd}>
                    <AddCircle color={"primary"}/>
                </IconButton>
                <VideoUpload instance={props.instance}/>
            </Paper>
            <List spacing={2}>
                {props.videoIdList.map((video) => {
                    return <Box>
                        <img src={video.thumbnailUrl}/>
                        <Typography>{video.title}</Typography>
                    </Box>
                })}
            </List>
            <Button onClick={skipVideo}>
                Skip
            </Button>
        </>
    )
}