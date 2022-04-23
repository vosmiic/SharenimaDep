import {Box, IconButton, InputBase, List, Paper, Stack, Typography} from "@mui/material";
import {AddCircle} from "@mui/icons-material";
import React, {useEffect, useState} from "react";
import authService from "../api-authorization/AuthorizeService";

export default function Queue(props) {
    const [queuedVideos, setQueuedVideos] = useState([]);

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
                props.setVideoIdList([...queuedVideos, videos]);
            })
        }
    }, [props.signalr])

    return (<>
            <Paper>
                <InputBase id={"videoLink"} placeholder={"Enter video link"}/>
                <IconButton onClick={onVideoAdd}>
                    <AddCircle color={"primary"}/>
                </IconButton>
            </Paper>
            <List spacing={2}>
                {props.videoIdList.map((video) => {
                    return <Box>
                        <img src={video.thumbnailUrl}/>
                        <Typography>{video.title}</Typography>
                    </Box>
                })}
            </List>
        </>
    )
}