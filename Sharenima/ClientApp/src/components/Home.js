import React, {useState} from 'react';
import {TextField} from "@mui/material";
import {useHistory} from "react-router-dom";
import {LoadingButton} from "@mui/lab";

export default function Home() {
    let [buttonLoading, setButtonLoading] = useState(false);
    let history = useHistory();

    async function createNewInstance() {
        setButtonLoading(true);
        await fetch("instance",
            {
                method: "POST",
                body: JSON.stringify({
                    Name: document.getElementById("instanceName").value
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function (response) {
            if (response.ok) {
                response.json().then((json) => history.push("/" + json.name))
            } else {
                console.log("Could not create instance.")
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
        </div>
    );
}
