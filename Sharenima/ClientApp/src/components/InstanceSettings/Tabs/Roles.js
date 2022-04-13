import React, {useState} from "react";
import {
    Backdrop,
    Box,
    Button,
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

export default function Roles(props) {
    const [createNewRoleBackdrop, setCreateNewRoleBackdrop] = useState(false);
    const [roles, setRoles] = useState(props.instanceSettings)

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

    function handleCreateNewRoleButton() {
        setCreateNewRoleBackdrop(!createNewRoleBackdrop);
    }

    function handleChangeRole(roleId) {

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
                        {roles.map(function (role) {
                            return <ListItem>
                                <ListItemButton onClick={handleChangeRole(role.id)}>
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
                        <Item><UserAutocomplete users={roles.users}/></Item>
                        <Item>Permissions</Item>
                    </Stack>
                    <Button>Save</Button>
                </Grid>
            </Grid>
        </>
    )
}