import React, {useEffect, useState} from 'react';
import {Backdrop, Box, Button, Tab, Tabs, Typography} from "@mui/material";
import Roles from "./Tabs/Roles";

export default function InstanceSettings(props) {
    const [instanceSettings, setInstanceSettings] = useState(null);
    const [value, setValue] = useState(0);
    const [displayInstanceSettings, setDisplayInstanceSettings] = useState(false);

    function TabPanel(props) {
        const {children, value, index, ...other} = props;

        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box sx={{p: 3}}>
                        <Typography>{children}</Typography>
                    </Box>
                )}
            </div>
        );
    }

    useEffect(() => {
        fetch("instance/" + props.instance.name, {
            method: "GET"
        }).then((response) => {
            if (response.ok) {
                response.json().then((json) => setInstanceSettings(json));
            }
        });
    }, [])

    function handleTabChange(event, newValue) {
        setValue(newValue);
    }


    function handleToggleBackdrop() {
        setDisplayInstanceSettings(!displayInstanceSettings);
    }

    return (
        <>
            <Button onClick={handleToggleBackdrop}>Instance settings</Button>
            <Backdrop open={displayInstanceSettings}>
                <Box sx={{width: "75%", height: "75%", backgroundColor: "darkgray", borderBottom: 1, borderColor: 'divider'}}>
                    <Tabs value={value} onChange={handleTabChange}>
                        <Tab label={"Roles"}/>
                    </Tabs>
                    <TabPanel value={value} index={0}>
                        tab
                    </TabPanel>
                </Box>
                <Button onClick={handleToggleBackdrop}>Close</Button>
            </Backdrop>
        </>
    )
}