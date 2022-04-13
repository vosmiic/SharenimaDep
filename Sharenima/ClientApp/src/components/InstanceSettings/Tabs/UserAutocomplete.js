import React, {useEffect, useState} from "react";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import authService from "../../api-authorization/AuthorizeService";

export default function UserAutocomplete() {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const loading = open && options.length === 0;

    useEffect(() => {
        let active = true;

        if (!loading) {
            return undefined;
        }

        (async () => {
            const token = await authService.getAccessToken();

            if (active) {
                fetch("user", {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? 'Bearer ' + token : {}
                    }
                }).then((response) => {
                    if (response.ok) {
                        response.json().then((json) => {
                            setOptions(json);
                        });
                    }
                });
            }
        })();

        return () => {
            active = false;
        };
    }, [loading]);

    useEffect(() => {
        if (!open) {
            setOptions([]);
        }
    }, [open]);

    return (
        <Autocomplete
            sx={{ width: 300 }}
            open={open}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) => option.userName}
            options={options}
            loading={loading}
            multiple
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Asynchronous"
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    );
}