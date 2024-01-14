import React from "react"
import Webcam from "react-webcam"

const WebcamComp = React.forwardRef((webcamProps, ref) => {


    return (
        <div className="flex items-center justify-center h-screen">
            <div className="bg-slate-50 grid lg:grid-cols-2 max-w-[1440px]">
                <div className="flex flex-col m-auto">
                    <p className="text-zinc-900 text-2xl md:text-3xl pb-5">For the most accurate results please:</p>
                    <p className="text-zinc-900 text-2xl md:text-3xl animate-fade-right animate-once animate-duration-[2000ms] animate-ease-in-out">- make sure you keep a straight face</p>
                    <p className="text-zinc-900 text-2xl md:text-3xl animate-fade-right animate-once animate-duration-[2000ms] animate-delay-500 animate-ease-in-out">- make sure your camera is in focus</p>
                    <p className="text-zinc-900 text-2xl md:text-3xl animate-fade-right animate-once animate-duration-[2000ms] animate-delay-1000 animate-ease-in-out">- make sure your skin is clean</p>

                </div>
                <div className="m-auto w-[85%] md:w-[65%] lg:w-full">

                    <Webcam className="pt-3 animate-fade animate-once animate-duration-2000 animate-delay-[1000ms] animate-ease-out mb-5" ref={ref} height={720} width={1280} screenshotFormat="image/jpeg"/>
                    <button className="py-3 w-full text-xl md:text-1xl" onClick={webcamProps.func}>Analyze My Skin</button>
                    <p className="text-red-500 text-center pt-5 font-bold text-xl">{webcamProps.error}</p>
                </div>
            </div>
        </div>
    )
})

export default WebcamComp