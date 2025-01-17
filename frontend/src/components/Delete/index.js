import React, { useEffect, useRef, useState } from 'react';
import { withStyles } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import MicRecorder from 'mic-recorder-to-mp3';
import Icon from '@material-ui/core/Icon';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Toolbar from '@material-ui/core/Toolbar';
import Divider from '@material-ui/core/Divider';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';


import DataService from "../../services/DataService";
import { BASE_API_URL } from "../../services/Common";
import styles from './styles';

const recorder = new MicRecorder({
    bitRate: 128
});

const Delete = (props) => {
    const { classes } = props;

    console.log("================================== Delete ======================================");


    // Component States
    const [isRecording, setIsRecording] = useState(false);
    const [blobURL, setBlobURL] = useState(null);
    const [isBlocked, setIsBlocked] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [inputAudios, setInputAudios] = useState([]);
    const loadInputAudios = () => {
        DataService.GetInputAudios()
            .then(function (response) {
                console.log(response.data);
                setInputAudios(response.data);
            })
    }


    // Setup Component
    useEffect(() => {
        loadInputAudios();
    }, []);
    //Get permission from user to use mic
    try {
        navigator.mediaDevices.getUserMedia({ audio: true },
            () => {
                console.log('Permission Granted');
                setIsBlocked(false);
            },
            () => {
                console.log('Permission Denied');
                setIsBlocked(true);
            },
        );
    }
    catch (err) {
        //setIsBlocked(true);
        console.log('Could not get navigator.mediaDevices.getUserMedia');
        console.log(err.message);
    }


    // Handlers
    const handleOnStartRecording = () => {
        if (isBlocked) {
            console.log('Permission Denied');
        } else {
            recorder
                .start()
                .then(() => {
                    setIsRecording(true);
                })
                .catch((e) => console.error(e));
        }
    }
    const handleOnStopRecording = () => {
        recorder
            .stop()
            .getMp3()
            .then(([buffer, blob]) => {
                setBlobURL(URL.createObjectURL(blob));
                setIsRecording(false);
                setAudioBlob(blob);

                var formData = new FormData();
                formData.append("file", blob);
                DataService.SaveAudio(formData)
                    .then(function (response) {
                        console.log(response.data);
                        loadInputAudios();
                    })

            }).catch((e) => console.log(e));
    }
    const handleOnDeleteClick = (item) => {
        console.log(item)
        DataService.DeleteAudio(item.input_audio)
            .then(function (response) {
                console.log(response.data);
                loadInputAudios();
            })
    }

    function useInterval(callback, delay) {
        const savedCallback = useRef();

        // Remember the latest function.
        useEffect(() => {
            savedCallback.current = callback;
        }, [callback]);

        // Set up the interval.
        useEffect(() => {
            function tick() {
                savedCallback.current();
            }
            if (delay !== null) {
                let id = setInterval(tick, delay);
                return () => clearInterval(id);
            }
        }, [callback, delay]);
    }

    useInterval(async () => {
        loadInputAudios();
    }, 10000)


    return (
        <div className={classes.root}>
            <main className={classes.main}>
                <Container maxWidth={false} className={classes.container}>
                    {!isBlocked &&
                        <Toolbar className={classes.toolBar}>
                            <Typography>
                                Click mic to record a Prompt:
                            </Typography>
                            <div className={classes.recordingContainer}>
                                {/* <span className={classes.audioContainer}>
                                <audio src={blobURL} controls="controls" />
                            </span> */}
                                <span className={classes.buttonsContainer}>
                                    {!isRecording &&
                                        <Icon className={classes.startRecording} onClick={() => handleOnStartRecording()}>mic</Icon>
                                    }
                                    {isRecording &&
                                        <Icon className={classes.stopRecording} onClick={() => handleOnStopRecording()}>stop_circle</Icon>
                                    }
                                </span>
                            </div>
                            <div className={classes.grow} />
                        </Toolbar>
                    }

                    {/* <Stepper activeStep={-1}>
                        <Step>
                            <StepLabel><Typography variant="h4">🎙️</Typography><Typography variant="caption">Record Prompt</Typography></StepLabel>
                        </Step>
                        <Step>
                            <StepLabel><Typography variant="h4">📝</Typography><Typography variant="caption">Transcribe Audio</Typography></StepLabel>
                        </Step>
                        <Step>
                            <StepLabel><Typography variant="h4">🗒️</Typography><Typography variant="caption">Generate Text</Typography></StepLabel>
                        </Step>
                        <Step>
                            <StepLabel><Typography variant="h4">🇫🇷</Typography><Typography variant="caption">Translate Text</Typography></StepLabel>
                        </Step>
                        <Step>
                            <StepLabel><Typography variant="h4">🔊</Typography><Typography variant="caption">Synthesis Audio</Typography></StepLabel>
                        </Step>
                    </Stepper> */}
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell align={'center'}></TableCell>
                                    <TableCell align={'center'}>
                                        <Step>
                                            <StepLabel><Typography variant="h4">🎙️</Typography><Typography variant="caption">Audio Prompts</Typography></StepLabel>
                                        </Step>

                                    </TableCell>
                                    <TableCell align={'center'} className={classes.textColumn}>
                                        <Step>
                                            <StepLabel><Typography variant="h4">📝</Typography><Typography variant="caption">Transcribed Audio</Typography></StepLabel>
                                        </Step>
                                    </TableCell>
                                    <TableCell align={'center'}>
                                        <Step>
                                            <StepLabel><Typography variant="h4">🗒️</Typography><Typography variant="caption">Generated Text</Typography></StepLabel>
                                        </Step>
                                    </TableCell>
                                    <TableCell align={'center'}>
                                        <Step>
                                            <StepLabel><Typography variant="h4">🔊</Typography><Typography variant="caption">Synthesised Audio</Typography></StepLabel>
                                        </Step>
                                    </TableCell>
                                    <TableCell align={'center'}>
                                        <Step>
                                            <StepLabel><Typography variant="h4">🇫🇷</Typography><Typography variant="caption">Translated Text</Typography></StepLabel>
                                        </Step>
                                    </TableCell>
                                    <TableCell align={'center'}>
                                        <Step>
                                            <StepLabel><Typography variant="h4">🔊</Typography><Typography variant="caption">Synthesised Audio</Typography></StepLabel>
                                        </Step>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {inputAudios && inputAudios.map((item, idx) =>
                                    <TableRow key={idx}>
                                        <TableCell>
                                            <Icon onClick={() => handleOnDeleteClick(item)}>delete_forever</Icon>
                                        </TableCell>
                                        <TableCell>
                                            <audio controls>
                                                <source src={BASE_API_URL + "/get_audio_data?path=" + item.input_audio} type="audio/mp3" />
                                                Your browser does not support the audio element.
                                            </audio>
                                        </TableCell>
                                        <TableCell>{item.text_prompt}</TableCell>
                                        <TableCell>{item.text_paragraph}</TableCell>
                                        <TableCell>
                                            {item.text_audio &&
                                                <audio controls>
                                                    <source src={BASE_API_URL + "/get_audio_data?path=" + item.text_audio} type="audio/mp3" />
                                                    Your browser does not support the audio element.
                                                </audio>
                                            }
                                        </TableCell>
                                        <TableCell>{item.text_translate}</TableCell>
                                        <TableCell>
                                            {item.output_audio &&
                                                <audio controls>
                                                    <source src={BASE_API_URL + "/get_audio_data?path=" + item.output_audio} type="audio/mp3" />
                                                    Your browser does not support the audio element.
                                                </audio>
                                            }
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Container>
            </main>
        </div>
    );
};

export default withStyles(styles)(Delete);