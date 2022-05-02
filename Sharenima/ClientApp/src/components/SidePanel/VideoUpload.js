import {Backdrop, Box, IconButton} from "@mui/material";
import {UploadFile} from "@mui/icons-material";
import React, {useEffect, useState} from "react";
import {Uppy} from "@uppy/core";
import {DropzoneAreaBase, DropzoneDialogBase} from "material-ui-dropzone";
import {DragDrop} from "@uppy/react";
import Tus from "@uppy/tus";
import authService from "../api-authorization/AuthorizeService";


export default function VideoUpload(props) {
    const [displayVideoUpload, setDisplayVideoUpload] = useState(false);
    const [fileObjects, setFileObjects] = useState([]);

    const uppy = new Uppy({
        meta: { type: 'avatar' },
        restrictions: { maxNumberOfFiles: 1 },
        autoProceed: true,
    })

    useEffect(() => {
        async function run() {
            const token = await authService.getAccessToken();
            uppy.use(Tus, {
                endpoint: '/upload',
                headers: {
                    Authorization: "Bearer " + token,
                    instance: props.instance.name
                }
            })
        }
        run();
        
    }, [uppy])

    
    async function getToken() {
        await authService.getAccessToken().then((value) => {
            return value;
        });
    }
    
    uppy.on('complete', (result) => {
        const url = result.successful[0].uploadURL
    })

    function handleToggleBackdrop() {
        setDisplayVideoUpload(!displayVideoUpload);
    }
    
    return (
        <>
            <IconButton onClick={handleToggleBackdrop}>
                <UploadFile color={"primary"} />
            </IconButton>
            <DragDrop 
                uppy={uppy}
            />
        </>
    )
    
    /*
                <DropzoneAreaBase
                open={displayVideoUpload} 
                fileObjects={fileObjects}
                maxFileSize={99999999999}
                onAdd={(file) => {
                    console.log(file);
                    setFileObjects(file);
                }}
            />
     */
}