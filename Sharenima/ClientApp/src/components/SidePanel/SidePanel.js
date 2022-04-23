import React, {useState} from "react";
import {Box, Tab, Tabs, Typography} from "@mui/material";
import Queue from "./Queue";

export default function SidePanel(props) {
    const [value, setValue] = useState(0);
    
    function TabPanel(props) {
        const { children, value, index, ...other } = props;

        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box sx={{ p: 3 }}>
                        <Typography>{children}</Typography>
                    </Box>
                )}
            </div>
        );
    }

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }
    
    function handleChange(event, newValue) {
        setValue(newValue);
    }
    
    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Chat" {...a11yProps(0)} />
                    <Tab label="Queue" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                Chat
            </TabPanel>
            <TabPanel value={value} index={1}>
                <Queue signalr={props.signalr} instance={props.instance} setVideoIdList={props.setVideoIdList} videoIdList={props.videoIdList}/>
            </TabPanel>
        </Box>
    )
}