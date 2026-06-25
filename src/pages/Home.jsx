import React from 'react'
import Navbar from '../components/Navbar'
import HeroCarousel from '../components/HeroCarousel'
import OfferSection from '../components/OfferSection'
import BrandGrid from '../components/BrandGrid'
import BikeGrid from '../components/BikeGrid'
import NewLaunches from '../components/NewLaunches'
import CategoryGrid from '../components/CategoryGrid'
import Footer from '../components/Footer'

function Home() {
    return (
        <div className="Home" style={{ backgroundColor: '#050505', color: 'white', minHeight: '100vh' }}>
            <Navbar />
            <main>
                {/* Intro */}
                <HeroCarousel />

                {/* 1. Offers Section */}
                <OfferSection />


                {/* 3. Bikes Section */}
                <BikeGrid />

                {/* 4. New Launches Section */}
                <NewLaunches />

                {/* 5. Riding Gears Section */}
                <CategoryGrid />

                {/* 2. Brand Section */}
                <BrandGrid />

            </main>
            <Footer />
        </div>
    )
}

export default Home
