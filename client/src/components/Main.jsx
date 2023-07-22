import React, {useState, useRef} from "react"
import axios from "axios"
import SkinAnalysis from "./SkinAnalysis"
import Webcam from "react-webcam"
import { Dna } from  'react-loader-spinner'
import { TypeAnimation } from 'react-type-animation';

const Main = () => {

    let [image, setImage] = useState('')
    let [skinAnalysis, setSkinAnalysis] = useState([])
    let [aiReccomendation, setAiReccomendation] = useState('')
    let [show, setShow] = useState(false)
    let [loading, setLoading] = useState(false) 

    const refToScroll = useRef(null)
    const webcamRef = useRef(null)
    const errorRef = useRef(null)

    const convertBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader()
            fileReader.readAsDataURL(file)

            fileReader.onload = () => {
                resolve(fileReader.result)
            }
        })
    }

    const handleSubmit = async (event) =>{

        event.preventDefault()

        setShow(false)
        errorRef.current.innerText = ""
        setLoading(true)
        setTimeout(() => {
            refToScroll.current?.scrollIntoView({behavior: 'smooth'})
        }, 250)

        let usersImage = []

        if(event.target.userInputtedURL.value !== ""){
            setImage(event.target.userInputtedURL.value)
            usersImage.push("url")
            usersImage.push(event.target.userInputtedURL.value)
            event.target.userInputtedURL.value = null
        } else if(event.target.userUploadedImage.files[0]){
            const convertedImage = await convertBase64(event.target.userUploadedImage.files[0])
            setImage(convertedImage)
            usersImage.push("file")
            usersImage.push(convertedImage)
            event.target.userUploadedImage.value = null
        } else{
            setImage(webcamRef.current.getScreenshot())
            usersImage.push("webcam")
            usersImage.push(webcamRef.current.getScreenshot())
        }

        axios.post("https://skintendent-backend.onrender.com/analyzeSkin", {image: usersImage}).then((apiResponse) => {
            let error = null
            if(apiResponse.data.error_message){
                if(apiResponse.data.error_message.indexOf(":") !== -1){
                    error = apiResponse.data.error_message.substring(0, apiResponse.data.error_message.indexOf(":"))
                } else{
                    error = apiResponse.data.error_message
                }

                switch(error){
                    case "NO_FACE_FOUND":
                        setLoading(false)
                        errorRef.current.innerText = "No face detected in image"
                        break
                    case "INVALID_IMAGE_FACE":
                        setLoading(false)
                        errorRef.current.innerText = "Make sure image is just your full face"
                        break
                    case "INVALID_IMAGE_SIZE":
                        setLoading(false)
                        errorRef.current.innerText = "Image too small or large"
                        break
                    case "INVALID_IMAGE_URL":
                        setLoading(false)
                        errorRef.current.innerText = "Image URL is invalid"
                        break
                    case "IMAGE_FILE_TOO_LARGE":
                        setLoading(false)
                        errorRef.current.innerText = "Image file too large"
                        break
                    case "IMAGE_DOWNLOAD_TIMEOUT":
                        setLoading(false)
                        errorRef.current.innerText = "Error please try again"
                        break
                    case "CONCURRENCY_LIMIT_EXCEEDED":
                        setLoading(false)
                        errorRef.current.innerText = "Error please try again"
                        break
                    default:
                        break
                }

            } else {
                let skinAnalysisArray = [] 
                for (var key in apiResponse.data.result) {
                    if (apiResponse.data.result.hasOwnProperty(key)) {
                        if(key === "left_eyelids" || key === "right_eyelids"){
                            continue
                        } else if(key === "skin_type"){
                            switch(apiResponse.data.result[key].skin_type){
                                case 0:
                                    skinAnalysisArray.push("oily skin")
                                    break
                                case 1:
                                    skinAnalysisArray.push("dry skin")
                                    break
                                case 3:
                                    skinAnalysisArray.push("oily and dry skin")
                                    break
                                default:
                                    skinAnalysisArray.push("normal skin")
                            }
                        } else {
                            if(apiResponse.data.result[key].value === 1){
                                if(key.includes("pores")){
                                    skinAnalysisArray.push("large " + key.replaceAll("_"," "))
                                } else {
                                    skinAnalysisArray.push(key.replaceAll("_"," "))
                                }
                            }
                        }
                    }
                }


                setSkinAnalysis(skinAnalysisArray)
                let skinAnalysisArrayString = skinAnalysisArray.toString()

                axios.post("https://skintendent-backend.onrender.com/skinAdvice", {imperfections: skinAnalysisArrayString}).then((apiResponse) => {
                    setAiReccomendation(apiResponse.data.split("\n"))
                    setLoading(false)
                    setShow(true)
                })
            }
        })        
    }
    
    let props = {
        image: image,
        skinAnalysis: skinAnalysis, 
        aiReccomendation: aiReccomendation
    }

    return (
        <div className="w-full h-screen bg-slate-950 flex flex-col pt-5">
            <div className="bg-slate-950 grid lg:grid-cols-2 max-w-[1440px] m-auto">
                <div className="flex flex-col justify-center items-center w-full px-2 py-8">
                    <div className="mx-auto">
                        <h1 className="text-gray-200 py-3 text-6xl md:text-7xl font-bold animate-flip-up animate-once animate-duration-1000 animate-delay-0 animate-ease-in-out">Skintendent.</h1>
                        <p className="text-gray-300 text-2xl md:text-3xl pb-3 animate-fade animate-once animate-duration-1000 animate-delay-[250ms] animate-ease-in">personalized skin care using <TypeAnimation sequence={['Face++',1000, 'ChatGPT',1000]} wrapper="span" speed={300} className="text-gray-300 text-2xl md:text-3xl" repeat={Infinity}/></p>

                        <form onSubmit={handleSubmit}>
                            <input className="py-3 px-2 w-[100%] my-2 text-xl md:text-1xl" type="text" placeholder="Enter an image URL" name="userInputtedURL"/>
                            <input className="text-white pb-3 pt-2 w-[100%] my-2 text-xl md:text-1xl" type="file" accept=".jpeg, .jpg" name="userUploadedImage"/>
                            <button className="transition ease-in-out delay-75 py-3 px-6 w-[100%] text-xl md:text-1xl">Get Started</button>
                            <p className="text-red-500 text-center pt-5 font-bold text-xl" ref={errorRef}></p>
                        </form>
                    </div>
                </div>
                <div className="justify-center mx-auto w-[90%] md:w-[60%] lg:w-[80%]">
                    <Webcam className="rounded-lg animate-fade animate-once animate-duration-2000 animate-delay-[500ms] animate-ease-out" ref={webcamRef} height={720} width={1280} screenshotFormat="image/jpeg"/>
                </div>

            </div>
            <div className="flex justify-center bg-slate-950">
                {
                    loading ? <div className="h-[1080px] flex items-center"><section ref={refToScroll}><Dna visible={true} height="180" width="180" ariaLabel="dna-loading" wrapperStyle={{}} wrapperClass="dna-wrapper"/></section></div> : null   
                }
            </div>
            <div className="bg-slate-950">
                {
                    show ? <div className="h-[1080px] flex justify-center items-center"><SkinAnalysis {...props}/></div>: null
                }
            </div>
        </div>
    )
}

export default Main