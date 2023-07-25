import React, {useState, useRef} from "react"
import axios from "axios"
import SkinAnalysis from "./SkinAnalysis"
import SearchForProducts from "./SearchForProducts"
import Webcam from "react-webcam"
import { Dna, MagnifyingGlass} from  'react-loader-spinner'
import { TypeAnimation } from 'react-type-animation';

const Main = () => {
    // const url = "https://skintendent-backend.onrender.com"
    const url = ""
    let [image, setImage] = useState('')
    let [skinAnalysis, setSkinAnalysis] = useState([])
    let [aiReccomendation, setAiReccomendation] = useState('')
    let [showSkinAnalysis, setShowSkinAnalysis] = useState(false)
    let [loadingSkinAnalysis, setLoadingSkinAnalysis] = useState(false) 

    let [showProducts, setShowProducts] = useState(false)
    let [loadingSearchForProducts, setLoadingSearchForProducts] = useState(false)
    let [listOfProducts, setListOfProducts] = useState([])
    const scrollToProducts = useRef(null)

    const scrollToSkinAnalysis = useRef(null)
    const webcamRef = useRef(null)
    const errorRef = useRef(null)

    const handleSubmitForSkinAnalysis = async (event) =>{

        event.preventDefault()

        setShowSkinAnalysis(false)
        setShowProducts(false)
        errorRef.current.innerText = ""
        setLoadingSkinAnalysis(true)

        setTimeout(() => {
            scrollToSkinAnalysis.current?.scrollIntoView({behavior: 'smooth'})
        }, 250)

        let usersImage = []
        setImage(webcamRef.current.getScreenshot())
        usersImage.push("webcam")
        usersImage.push(webcamRef.current.getScreenshot())
        
        axios.post(url+"/analyzeSkin", {image: usersImage}).then((apiResponse) => {
            let error = null
            if(apiResponse.data.error_message){
                if(apiResponse.data.error_message.indexOf(":") !== -1){
                    error = apiResponse.data.error_message.substring(0, apiResponse.data.error_message.indexOf(":"))
                } else{
                    error = apiResponse.data.error_message
                }

                switch(error){
                    case "NO_FACE_FOUND":
                        setLoadingSkinAnalysis(false)
                        errorRef.current.innerText = "No face detected"
                        break
                    case "INVALID_IMAGE_FACE":
                        setLoadingSkinAnalysis(false)
                        errorRef.current.innerText = "Make sure image is just your full face"
                        break
                    case "INVALID_IMAGE_SIZE":
                        setLoadingSkinAnalysis(false)
                        errorRef.current.innerText = "Image size is invalid"
                        break
                    case "INVALID_IMAGE_URL":
                        setLoadingSkinAnalysis(false)
                        errorRef.current.innerText = "Image URL is invalid"
                        break
                    case "IMAGE_FILE_TOO_LARGE":
                        setLoadingSkinAnalysis(false)
                        errorRef.current.innerText = "Image file is too large"
                        break
                    case "IMAGE_DOWNLOAD_TIMEOUT":
                        setLoadingSkinAnalysis(false)
                        errorRef.current.innerText = "Error please try again"
                        break
                    case "CONCURRENCY_LIMIT_EXCEEDED":
                        setLoadingSkinAnalysis(false)
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

                axios.post(url+"/skinAdvice", {imperfections: skinAnalysisArrayString}).then((apiResponse) => {
                    setAiReccomendation(apiResponse.data.split("\n"))
                    setLoadingSkinAnalysis(false)
                    setShowSkinAnalysis(true)
                })
            }
        })        
    }
    
    let skinProps = {
        image: image,
        skinAnalysis: skinAnalysis, 
        aiReccomendation: aiReccomendation
    }

    const handleSubmitForProducts = (event) =>{
        event.preventDefault()
        event.target.className += " hidden"
        setLoadingSearchForProducts(true)
        setTimeout(() => {
            scrollToProducts.current?.scrollIntoView({behavior: 'smooth'})
        }, 250)

        let productsToSearchArray = [] 
        for(let i = 0; i < aiReccomendation.length; i++){
            productsToSearchArray.push((aiReccomendation[i].substring(aiReccomendation[i].indexOf("-") + 1, aiReccomendation[i].lastIndexOf("("))).trim())
        }
        axios.post(url+"/searchForProducts", {productsToSearch: productsToSearchArray}).then((apiResponse) => {
            setListOfProducts(apiResponse.data)
            setLoadingSearchForProducts(false)
            setShowProducts(true)
        })
    }

    let productProps = {
        listOfProducts: listOfProducts
    }

    return (
        <div className="bg-slate-50">
            <div className="flex items-center justify-center h-screen">
                <div className="bg-slate-50 grid lg:grid-cols-2 max-w-[1440px] m-auto w-full md:w-[75%] lg:w-full">
                    <div className="flex flex-col justify-center w-full p-10 md:p-9">
                        <h1 className="text-zinc-950 py-3 text-6xl md:text-7xl font-bold animate-flip-up animate-once animate-duration-1500 animate-delay-0 animate-ease-in-out">Skintendent.</h1>
                        <p className="text-zinc-900 text-2xl md:text-3xl pb-10 animate-fade animate-once animate-duration-1500 animate-delay-[250ms] animate-ease-in">get a personalized skin care plan using <TypeAnimation sequence={['Face++',1000, 'ChatGPT',1000, 'Amazon',1000]} wrapper="span" speed={300} className="text-zinc-900 text-2xl md:text-3xl" repeat={Infinity}/></p>
                        <button className="py-3 w-full text-xl md:text-1xl" onClick={handleSubmitForSkinAnalysis}>Get Started</button>
                        <p className="text-red-500 text-center pt-5 font-bold text-xl" ref={errorRef}></p>
                    </div>
                    <div className="m-auto w-[85%]">
                        <Webcam className="rounded-lg animate-fade animate-once animate-duration-2000 animate-delay-[1000ms] animate-ease-out" ref={webcamRef} height={720} width={1280} screenshotFormat="image/jpeg"/>
                    </div>
                </div>
            </div>
            <div className="flex justify-center bg-slate-50">
                {
                    loadingSkinAnalysis ? <div className="h-screen flex items-center"><section ref={scrollToSkinAnalysis}><div className="flex justify-center"><Dna visible={true} height="180" width="180" ariaLabel="dna-loading" wrapperStyle={{}} wrapperClass="dna-wrapper"/></div><p className="text-zinc-900 text-3xl pb-3">analyzing your skin</p></section></div> : null   
                }
            </div>
            <div className="flex justify-center bg-slate-50">
                {
                    showSkinAnalysis ? <div className="h-screen flex items-center"><SkinAnalysis {...skinProps} func={handleSubmitForProducts}/></div>: null
                }
            </div>
            <div className="flex justify-center bg-slate-50">
                {
                    loadingSearchForProducts ? <div className="h-screen flex items-center"><section ref={scrollToProducts}><div className="flex justify-center"><MagnifyingGlass visible={true} height="180" width="180" ariaLabel="MagnifyingGlass-loading" wrapperStyle={{}} wrapperClass="MagnifyingGlass-wrapper" glassColor = '#c0efff' color = '#e15b64'/></div><p className="text-zinc-900 text-3xl pb-3">Finding Best Products</p></section></div> : null   
                }
            </div>
            <div className="flex justify-center bg-slate-50">
                {
                    showProducts ? <div className="flex items-center"><SearchForProducts {...productProps}/></div>: null
                }
            </div>
        </div>
    )
}

export default Main