import React from 'react'
import Navbar from '@/sharecomponent/navbar/navbar'
import FullScreenImageSlider from '@/component/contain/homeSlider/homeSlider'
import ProductsDashboard from '@/component/contain/product/product'


const page = () => {
  return (
    <div>
      <Navbar/>
      <FullScreenImageSlider/>
            <ProductsDashboard/>

      
    </div>
  )
}

export default page
