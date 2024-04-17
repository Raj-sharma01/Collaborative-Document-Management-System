import 'regenerator-runtime/runtime' //it has to be literally at the top 
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useEffect, useState, useRef } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { Box } from '@mui/material'
import styled from '@emotion/styled'
import { io } from 'socket.io-client'
import { useParams } from 'react-router-dom'

import '../App.css'


const Component = styled.div`background:#F5F5F5`

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],

    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction

    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'font': [] }],
    // [{ 'font': Font.whitelist }],
    [{ 'align': [] }],

    ['link', 'image', 'video'],

    ['clean']                                         // remove formatting button
];

const Editor = () => {
    console.log('rendered')

    const [socket, setSocket] = useState()
    const [quill, setQuill] = useState()
    const { id } = useParams()
    // const {
    //     transcript,
    //     listening,
    //     resetTranscript,
    //     browserSupportsSpeechRecognition
    // } = useSpeechRecognition();

    //-----------------------------
    const quillRef = useRef(null);
    const prevTranscriptRef = useRef('');
    //----------------------
    // if (!browserSupportsSpeechRecognition) {
    //     return <span>Browser doesn't support speech recognition.</span>;
    // }

    useEffect(() => {

        const component = document.getElementById('component')

        const quillServer = new Quill('#container', {
            modules: {
                toolbar: toolbarOptions,
            },
            theme: 'snow'
        })
        setQuill(quillServer);
        console.log('quillServer=', quillServer);
        //------------------------
        quillRef.current = quill;

        //--------------------------------
        quillServer.disable()
        /*
        *in the begining the quill is disabled
        *so that we can only write in it after the data loaded into the document(load-document)
        * 
        */
        quillServer?.setText("Loading the Document...")

        return () => {
            component.innerHTML = "";
        }
    }, [])

    useEffect(() => {
        const socketServer = io('http://localhost:9000')
        //after every render the socket connection establishes again
        //thus every socketServer has a new/different id
        setSocket(socketServer)
        console.log("socketServer = ", socketServer)
        return () => {
            socketServer.disconnect();
        }

    }, [])

    useEffect(() => {

        //during first render socket and quill will be undefined
        //this is because their value will be set after the first render
        //this is scheduling not batching
        const handleChange = (delta, oldDelta, source) => {
            if (source !== 'user') {
                return
            }
            socket?.emit('send-changes', delta)
        }

        quill?.on('text-change', handleChange);

        return () => {
            quill?.off('text-change', handleChange)
        }
    }, [quill, socket])


    useEffect(() => {

        const handleChange = (delta) => {
            quill.updateContents(delta)
        }

        socket?.on('receive-changes', handleChange);

        return () => {
            socket?.off('receive-changes', handleChange)
        }
    }, [quill, socket])

    useEffect(() => {
        socket?.once('load-document', (document) => {
            quill?.setContents(document)
            console.log("document= ", document)
            quill?.enable()

        })
        socket?.emit('get-document', id)

    }, [quill, socket, id])

    useEffect(() => {
        const timer = setInterval(() => {
            socket?.emit('save-document', quill?.getContents())
        }, 2000)
        return () => {
            clearInterval(timer)
        }

    }, [socket, quill])

    /*
    * we want event listeners to be registered only once 
    * so we use useEffect 
    * in the first render quill = socket = undefined
    * quill is defined in the 2nd render and socket is defined in the 3rd render
    * event listener and emiter can send and listen to events after quill and socket are defined
    * so in the dependency array both are included
    * 
    * while writing the document if we change the id then 
    * we  can get new document with different data or null data 
    */

    const[script,setScript]=useState("")


    // useEffect(() => {
    //     const len = quill?.getLength()
    //     // const l=transcript.length
    //     const prevScript=script;
    //     const prelen=prevScript.length
    //     // const newTranscript=transcript.slice(prelen)
    //     // const delta = { ops: [{ retain: len }, { insert: `${newTranscript} ` }] };
    //     // quill?.updateContents(delta)
    //     // setScript(transcript)

    // }, [transcript])


    // useEffect(() => {
    //     const len = quill?.getLength()
    //     const l=transcript.length
    //     console.log(l, 'Transcript changed:', transcript);
    //     console.log(script.length, 'prevTranscript changed:', script);
    //     console.log("getLength = ",len," transLength = ",l)
    // }, [transcript]);

    return (
        <>
           
            {/* <div>
                <p>Microphone: {listening ? 'on' : 'off'}</p>
                <button onClick={() => SpeechRecognition.startListening({ continuous: true })}>Start</button>
                <button onClick={SpeechRecognition.stopListening}>Stop</button>
                <button onClick={resetTranscript}>Reset</button>
                <p>{transcript}</p>

                {console.log(transcript)}
            </div> */}

            <Component className='component' id="component">
                <Box className="container" id="container"></Box>
            </Component>
        </>
    )
}

export default Editor
