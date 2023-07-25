import React from "react"

const SearchForProducts = (productProps) => {

    return (
        <div className="bg-slate-5 py-20 m-auto">
            <section className="w-fit justify-items-center justify-center animate-fade-down animate-once animate-duration-[1500ms] animate-ease-in-out">
                {productProps.listOfProducts.map(products => (
                        <div className="py-10">
                            <h1 key={products[0]} className="text-zinc-950 font-bold text-2xl px-2 pb-2 underline animate-fade-right animate-once animate-duration-[1500ms] animate-delay-1000 animate-ease-in-out">{products[0]}</h1>
                            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10 my-5 items-center">
                                {products[1].map(product =>
                                    <div className="animate-jump animate-duration-[1500ms] animate-delay-750 animate-ease-out">
                                        <a href={product.url} target="_blank" rel="noreferrer">
                                            <div className="w-72 bg-white shadow-md rounded-xl duration-500 hover:scale-105 hover:shadow-xl">
                                                <img src={product.thumbnail} alt="Product" className="h-80 w-72 object-cover rounded-t-xl" />
                                                <div className="px-4 py-3 w-72">
                                                    <span className="text-gray-400 mr-3 uppercase text-xs">{product.reviews.total_reviews} Reviews | {product.reviews.rating}/5</span>
                                                    <p key={product.title} className="text-lg font-bold text-black truncate block capitalize">{product.title}</p>
                                                    <div className="flex items-center">
                                                        <p className="text-lg font-semibold text-black cursor-auto my-3">${product.price.current_price}</p>
                                                        {
                                                            product.price.before_price ? <del><p class="text-sm text-gray-600 cursor-auto ml-2">${product.price.before_price}</p></del> : null
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) 
                )}   
            </section>
        </div>
    )
}

export default SearchForProducts