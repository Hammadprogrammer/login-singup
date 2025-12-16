import React from 'react'
import Navbar from '@/sharecomponent/navbar/navbar'
import FullScreenImageSlider from '@/component/contain/homeSlider/homeSlider'
import ProductsDashboard from '@/component/contain/product/product'
// import Footer from '@/sharecomponent/footer/footer'


const page = () => {
  return (
    <div>
      <Navbar/>
      <FullScreenImageSlider/>
            <ProductsDashboard/>
            {/* <Footer/> */}

      
    </div>
  )
}

export default page
