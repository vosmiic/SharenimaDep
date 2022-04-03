import React, {useState} from 'react';
import {Alert, Snackbar, TextField} from "@mui/material";
import {useHistory} from "react-router-dom";
import {LoadingButton} from "@mui/lab";
import authService from "./api-authorization/AuthorizeService";

export default function Home() {
    let [buttonLoading, setButtonLoading] = useState(false);
    let [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
    let history = useHistory();

    async function createNewInstance() {
        setButtonLoading(true);
        const token = await authService.getAccessToken();
        await fetch("instance",
            {
                method: "POST",
                body: JSON.stringify({
                    Name: document.getElementById("instanceName").value
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? 'Bearer ' + token : {}
                }
            }).then(function (response) {
            if (response.ok) {
                response.json().then((json) => history.push("/" + json.name))
            } else if (response.status === 401) {
                setErrorSnackbarOpen(true);
            }
        })
        setButtonLoading(false);
    }


    return (
        <div>
            <h1>Home page</h1>
            <div>
                <p>You can create a new Sharenima instance below, just enter the name:</p>
                <TextField id={"instanceName"}/>
                <LoadingButton loading={buttonLoading} onClick={createNewInstance}>Create instance</LoadingButton>
            </div>
            <Snackbar open={errorSnackbarOpen} autoHideDuration={5000}>
                <Alert severity={"error"}>You must login before creating an instance.</Alert>
            </Snackbar>
        </div>
    );
}
