import React, {useEffect, useState} from "react";
import {
    Backdrop,
    Box,
    Button, Checkbox, FormControl, FormControlLabel,
    Grid,
    List,
    ListItem,
    ListItemButton,
    ListItemText, Paper,
    Stack, styled,
    TextField
} from "@mui/material";
import authService from "../../api-authorization/AuthorizeService";
import UserAutocomplete from "./UserAutocomplete";
import {Save} from "@mui/icons-material";

export default function Roles(props) {
    const [createNewRoleBackdrop, setCreateNewRoleBackdrop] = useState(false);
    const [roles, setRoles] = useState(props.instanceSettings)
    const [currentRoleId, setCurrentRoleId] = useState(null);
    const [rolePermissions, setRolePermissions] = useState([]);
    let roleUsers = [];
    
    const Item = styled(Paper)(({theme}) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary
    }));

    async function createNewRole() {
        const token = await authService.getAccessToken();

        fetch("instance/" + props.instance.name + "/roles?roleName=" + document.getElementById('roleName').value, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? 'Bearer ' + token : {}
            }
        }).then((response) => {
            if (response.ok) {
                response.json().then((json) => {
                    setRoles([...roles, json]);
                    handleCreateNewRoleButton();
                });
            }
        });
    }
    
    async function saveRole() {
        const token = await authService.getAccessToken();
        
        rolePermissions.forEach((item) => {
            item.value = item.value.toString();
        });
        
        fetch("/roles?roleId=" + currentRoleId, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? 'Bearer ' + token : {}
            },
            body: JSON.stringify({
                users: roleUsers,
                permissions: rolePermissions
            })
        }).then((response) => {
            if (response.ok) {
                
            }
        });
    }

    function handleCreateNewRoleButton() {
        setCreateNewRoleBackdrop(!createNewRoleBackdrop);
    }
    
    async function getRolePermissions(roleId) {
        const token = await authService.getAccessToken();

        fetch("instance/" + props.instance.name + "/permissions?roleId=" + roleId, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? 'Bearer ' + token : {}
            }
        }).then((response) => {
            if (response.ok) {
                response.json().then((json) => {
                    setRolePermissions(json);
                });
            }
        });
    }
    
    function changeRolePermissions(event, name) {
        if (rolePermissions != null) {
            var newRolePermissions = rolePermissions.slice();
            for (let x = 0; x < newRolePermissions.length; x++) {
                if (newRolePermissions[x].name === name) {
                    newRolePermissions[x].value = event.target.checked
                }
            }
            setRolePermissions(newRolePermissions);
        }
    }
    
    function setRolesUsers(users) {
        roleUsers = users;
    }

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={6} md={4} style={{backgroundColor: "red"}}>
                    <Button onClick={handleCreateNewRoleButton}>Create new role</Button>
                    <Backdrop open={createNewRoleBackdrop}>
                        <Box sx={{width: 200, height: 100, backgroundColor: "purple"}}>
                            <TextField label={"Role Name"} variant={"standard"} id={"roleName"}/>
                            <Button onClick={createNewRole}>Create</Button>
                            <Button onClick={handleCreateNewRoleButton}>Cancel</Button>
                        </Box>
                    </Backdrop>
                    <List>
                        {roles.map((role) => {
                            return <ListItem key={role.id}>
                                <ListItemButton onClick={() => {
                                    getRolePermissions(role.id);
                                    setCurrentRoleId(role.id);
                                }}>
                                    <ListItemText primary={role.roleName} id={role.id}/>
                                </ListItemButton>
                            </ListItem>
                        })}
                    </List>
                </Grid>
                <Grid item xs={6} md={8} style={{backgroundColor: "blue"}}>
                    scopes to be set here
                    <Stack
                        direction="column"
                        justifyContent="center"
                        alignItems="stretch"
                        spacing={2}
                    >
                        <Item><UserAutocomplete setRoleUsers={setRolesUsers}/></Item>
                        <Item>{rolePermissions.map((permission) => {
                            return <FormControlLabel control={<Checkbox checked={permission.value === "true" || permission.value === true} onChange={(event) => changeRolePermissions(event, permission.name,)}/>} label={permission.friendlyName} />
                        })}</Item>
                    </Stack>
                    <Button onClick={saveRole}>Save</Button>
                </Grid>
            </Grid>
        </>
    )
}