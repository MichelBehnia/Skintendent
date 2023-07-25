import React from "react"

const SkinAnalysis = (skinProps) => {

    return (
        <div className="bg-slate-5 m-auto py-20">
            <div className="max-w-[1240px] animate-fade-down animate-once animate-duration-[1500ms] animate-ease-in-out">
                <div className="grid lg:grid-cols-2 px-2 gap-10 items-center">
                    <div className="flex flex-col justify-center">
                        <img className="w-full max-w-md m-auto rounded-lg animate-fade animate-once animate-duration-[2000ms] animate-ease-in-out" src={skinProps.image} alt="placeholder"/>
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className="pb-20">
                            <p className="text-zinc-950 font-bold text-2xl px-2 pb-2">Analysis of your skin</p>
                            {skinProps.skinAnalysis.map(imperfection => <p key={imperfection} className="text-zinc-950 text-xl px-2 animate-fade-right animate-once animate-duration-[1500ms] animate-delay-1000 animate-ease-in-out">- {imperfection}</p>)}
                        </div>
                        <div className="pb-10">
                            <p className="text-zinc-950 font-bold text-2xl px-2 pb-2">What we recommend</p>
                            {skinProps.aiReccomendation.map(reccomendation => <p key={reccomendation} className="text-zinc-950 text-xl px-2 animate-fade-right animate-once animate-duration-[2500ms] animate-delay-1000 animate-ease-in-out">{reccomendation}</p>)}
                        </div>
                        <div>
                            <button className="py-3 px-6 w-[100%] text-xl md:text-1xl" onClick={skinProps.func}>Get Products</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SkinAnalysis