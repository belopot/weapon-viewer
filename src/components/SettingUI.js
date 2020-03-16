import React from 'react';
import './SettingUI.scss';
import { Typography, makeStyles, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

const useStyles = makeStyles(theme => ({
    margin: {
        height: theme.spacing(3),
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 230,
    },
}));


export default function SettingUI() {


    const classes = useStyles();
    const [tableID, setTable] = React.useState('');
    const [open, setOpen] = React.useState(false);


    const handleChange = event => {
        window.mainScene.loadTable(event.target.value);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    return (
        <div className='overlay-ui'>
            <div className='root-ui'>

                <ExpansionPanel>
                    <ExpansionPanelSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography className={classes.heading}>Setting</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className="list">
                        <FormControl className={classes.formControl}>
                            <InputLabel id="demo-controlled-open-select-label">Select a gun</InputLabel>
                            <Select
                                labelId="demo-controlled-open-select-label"
                                id="demo-controlled-open-select"
                                open={open}
                                onClose={handleClose}
                                onOpen={handleOpen}
                                value={tableID}
                                onChange={handleChange}
                            >
                                <MenuItem value={0}>AKM</MenuItem>
                                <MenuItem value={1}>FAL</MenuItem>
                            </Select>
                        </FormControl>
                    </ExpansionPanelDetails>
                </ExpansionPanel>


            </div>
        </div >
    );

}
