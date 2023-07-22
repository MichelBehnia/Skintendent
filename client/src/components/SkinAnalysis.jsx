import React from "react"

const SkinAnalysis = (props) => {
//TRY AND FIND A WAY TO CROP IMAGE
    return (
        <div className="bg-slate-950">
            <div className="max-w-[1240px] mx-auto pt-20 pb-2 animate-fade-down animate-once animate-duration-[1500ms] animate-ease-in-out">
                <div className="grid lg:grid-cols-2 gap-5 px-2 items-center">
                    <div className="flex flex-col justify-center mx-auto">
                        <img className="w-full m-auto max-w-md rounded-lg animate-fade animate-once animate-duration-[2000ms] animate-ease-in-out" src={props.image} alt="placeholder"/>
                    </div>
                    <div className="flex flex-col justify-center h-[50%] text-lg pl-3 ">
                        <div className="mx-auto lg:mx-0">
                            <div className="pb-20">
                                <p className="text-white font-bold text-xl px-2 pb-2">Analysis of your skin</p>
                                {props.skinAnalysis.map(imperfection => <p key={imperfection} className="text-white px-2 py-0 animate-fade-right animate-once animate-duration-[1500ms] animate-delay-1000 animate-ease-in-out">- {imperfection}</p>)}
                            </div>
                            <div>
                                <p className="text-white font-bold text-xl px-2 pb-2">What we recommend</p>
                                {props.aiReccomendation.map(reccomendation => <p key={reccomendation} className="text-white px-2 py-0 animate-fade-right animate-once animate-duration-[2500ms] animate-delay-1000 animate-ease-in-out">{reccomendation}</p>)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SkinAnalysis