import React, {useState, useRef, useEffect} from "react"
import axios from "axios"
import SkinAnalysis from "./SkinAnalysis"
import WebcamComp from "./WebcamComp"
import SearchForProducts from "./SearchForProducts"
import hand from "../assets/hand.png"
import product from "../assets/product.png"
import defaultPic from "../assets/defaultPic.jpg"
import { Dna, MagnifyingGlass} from  'react-loader-spinner'
import { TypeAnimation } from 'react-type-animation'
import { auth, googleProvider} from "../config/firebase"
import { signInWithPopup, signOut, onAuthStateChanged} from "firebase/auth"
import { db } from "../config/firebase"
import { addDoc, collection, doc, setDoc} from "firebase/firestore"

const Main = () => {
    const url = "https://skintendent-backend.onrender.com"
    let [image, setImage] = useState('')
    let [skinAnalysis, setSkinAnalysis] = useState([])
    let [aiReccomendation, setAiReccomendation] = useState('')
    let [error, setError] = useState('')

    let [isSignedIn, setIsSignedIn] = useState(false)

    let [showSkinAnalysis, setShowSkinAnalysis] = useState(false)
    let [loadingSkinAnalysis, setLoadingSkinAnalysis] = useState(false) 
    let [showWebcamComp, setShowWebcamComp] = useState(false) 

    let [showProducts, setShowProducts] = useState(false)
    let [loadingSearchForProducts, setLoadingSearchForProducts] = useState(false)
    let [listOfProducts, setListOfProducts] = useState([])

    const scrollToProducts = useRef(null)
    const scrollToSkinAnalysis = useRef(null)
    const scrollToWebcam = useRef(null)
    const webcamRef = useRef(null)

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
              setIsSignedIn(true)
            } else {
              setIsSignedIn(false)
            }
          });
    }, []);

    const handleGetStarted = () => {
        setShowWebcamComp(true)
        setTimeout(() => {
            scrollToWebcam.current?.scrollIntoView({behavior: 'smooth'})
        }, 250)
    }

    const handleSignIn = async () => {
        try {
            await signInWithPopup(auth, googleProvider)
            await setDoc(doc(db, "userData/" + auth?.currentUser?.email),{})
            setIsSignedIn(true)
        } catch (err){
            console.error(err)
        }
    }

    const handleLogout = async () => {
        try {
            await signOut(auth)
            setIsSignedIn(false)
        } catch (err){
            console.error(err)
        }
    }

    const handleSubmitForSkinAnalysis = async (event) =>{

        event.preventDefault()

        setShowSkinAnalysis(false)
        setShowProducts(false)
        setError("")
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
                        setError("No face detected")
                        break
                    case "INVALID_IMAGE_FACE":
                        setLoadingSkinAnalysis(false)
                        setError("Make sure image is just your full face")
                        break
                    case "INVALID_IMAGE_SIZE":
                        setLoadingSkinAnalysis(false)
                        setError("Image size is invalid")
                        break
                    case "INVALID_IMAGE_URL":
                        setLoadingSkinAnalysis(false)
                        setError("Image URL is invalid")
                        break
                    case "IMAGE_FILE_TOO_LARGE":
                        setLoadingSkinAnalysis(false)
                        setError("Image file is too large")
                        break
                    case "IMAGE_DOWNLOAD_TIMEOUT":
                        setLoadingSkinAnalysis(false)
                        setError("Error please try again")
                        break
                    case "CONCURRENCY_LIMIT_EXCEEDED":
                        setLoadingSkinAnalysis(false)
                        setError("Error please try again")
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
                                    skinAnalysisArray.push("mixed skin")
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
                axios.post(url+"/skinAdvice", {imperfections: skinAnalysisArrayString}).then(async (apiResponse) => {
                    setAiReccomendation(apiResponse.data.split("\n"))
                    await addDoc(collection(db, "userData/" + auth?.currentUser?.email + "/skinHistory"), {
                        image: usersImage[1],
                        skinAnalysis: skinAnalysisArray,
                        aiReccomendation: apiResponse.data.split("\n")
                    })
                    setLoadingSkinAnalysis(false)
                    setShowSkinAnalysis(true)
                })
            }
        })        
    }

    let webcamProps = {
        error: error
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
            productsToSearchArray.push((aiReccomendation[i].substring(aiReccomendation[i].indexOf("-") + 1, aiReccomendation[i].lastIndexOf("(")).trim()))
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
                        <p className="text-zinc-900 text-2xl md:text-3xl pb-10 animate-fade animate-once animate-duration-1500 animate-delay-[250ms] animate-ease-in">get a personalized skin care plan using <TypeAnimation sequence={['Face++',1000, 'OpenAI',1000, 'Amazon',1000]} wrapper="span" speed={300} className="text-zinc-900 text-2xl md:text-3xl" repeat={Infinity}/></p>
                        <button className="py-3 mb-5 w-full text-xl md:text-1xl" onClick={handleGetStarted}>Get Started</button>
                        {
                            isSignedIn ? 
                                <div className="flex justify-between border-2 items-center border-zinc-500 rounded-lg">
                                    <img src={auth?.currentUser?.photoURL} alt="placeholder" className="m-2 rounded-full"/>
                                    <p className="text-zinc-900 text-2xl md:text-3xl truncate m-2">{auth?.currentUser?.email}</p>
                                    <button className="py-3 w-[20%] h-[50%] text-xl md:text-1xl m-2" onClick={handleLogout}>Logout</button>
                                </div>
                            :
                                <div className="flex justify-between border-2 items-center border-zinc-500 rounded-lg ">
                                    <img src={defaultPic} alt="placeholder" className="m-2 rounded-full max-w-[14%] "/>
                                    <p className="text-zinc-900 text-2xl md:text-3xl truncate m-2 ">Proceed as Guest</p>
                                    <button className="py-3 w-[20%] h-[50%] text-xl md:text-1xl m-2 p-auto" onClick={handleSignIn}>Sign in</button>
                                </div>
                        }
                    </div>
                    <div className="relative m-auto w-[75%]">

                        
                        <img src={hand} alt="placeholder" className="pt-20 mt-20"/>

                        <img src={product} alt="placeholder" className="absolute top-20 left-20 w-[45%] md:top-12 lg:top-10 animate-wiggle animate-infinite animate-duration-[3000ms] animate-ease-linear"/>
                    
                    </div>
                </div>
            </div>
            <div className="flex justify-center bg-slate-50">
                {
                    showWebcamComp ? <div className="flex items-center"><section ref={scrollToWebcam}><WebcamComp {...webcamProps} func={handleSubmitForSkinAnalysis} ref={webcamRef}/></section></div> : null
                }
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