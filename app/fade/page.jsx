'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import RootLayout from '../layout'
import Link from 'next/link'
import { RxCaretSort } from 'react-icons/rx'
import { IoMdShuffle } from 'react-icons/io'
import Loader from '../../components/loader/loader'

export default function FadeGallery() {
    const [slots, setSlots] = useState(Array(9).fill(null))
    const poolRef = useRef([])
    const intervalRef = useRef(null)
    const loadingRef = useRef(false)
    const [loader, __loader] = useState(true)

    const fetchImages = async () => {
        if (loadingRef.current) return
        loadingRef.current = true

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/firebase/get-fade-images`)
            const data = await res.json()
            const images = data.images

            if (images.length >= 9) {
                setSlots(images.slice(0, 9))
                poolRef.current = images.slice(9)
            }
        } catch (err) {
            console.error('Failed to fetch fade images:', err)
        } finally {
            loadingRef.current = false
            __loader(false)
        }
    }

    useEffect(() => {
        fetchImages()

        intervalRef.current = setInterval(() => {
            setSlots(prev => {
                const updatedSlots = [...prev]

                if (poolRef.current.length === 0) {
                    fetchImages()
                    return updatedSlots
                }

                const randomIndex = Math.floor(Math.random() * 9)
                const nextImage = poolRef.current.shift()
                if (nextImage) {
                    updatedSlots[randomIndex] = nextImage
                }

                return updatedSlots
            })
        }, 5000)

        return () => clearInterval(intervalRef.current)
    }, [])

    return (
        <RootLayout>
            <div className='px-4 lg:px-16 pb-10'>
                {/* Navigation */}
                <div className='w-full flex justify-center items-center py-9'>
                    <div className='w-full grid place-items-center space-y-6'>
                        <img
                            src='/assets/logo.svg'
                            className='object-contain w-40'
                            alt=''
                        />

                        <div className='flex gap-8 items-center'>
                            <Link href={'/fade'}>
                                {/* <IoMdList className='cursor-pointer transition-all duration-200 hover:scale-105 text-2xl' /> */}
                                <img src="/assets/crossfade.svg" className='w-[1.4rem] object-contain' alt="" />
                            </Link>

                            <Link href={'/ordr'}>
                                <RxCaretSort className='cursor-pointer transition-all duration-200 hover:scale-105 text-3xl' />
                            </Link>

                            <IoMdShuffle
                                // onClick={getRandmImages}
                                className='cursor-pointer transition-all duration-200 hover:scale-105 text-2xl'
                            />
                        </div>
                    </div>
                </div>

                {loader ? (
                    <Loader />
                ) : (<div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[10px] place-items-center'>
                    {slots.map((image, idx) => (
                        <div key={idx} className='w-full h-[33vh] relative overflow-hidden rounded-md'>
                            <ImageWithFade image={image} />
                        </div>
                    ))}
                </div>
                )}
            </div >
        </RootLayout>
    )
}

function ImageWithFade({ image }) {
    const [currentImage, setCurrentImage] = useState(image)
    const [visible, setVisible] = useState(!!image)

    useEffect(() => {
        if (!image || image.id === currentImage?.id) return

        const img = new Image()
        img.src = image.src
        img.onload = () => {
            setCurrentImage(image)
            setVisible(true)
        }
    }, [image])

    return (
        <div className="relative w-full h-full">
            <AnimatePresence mode="wait">
                {visible && currentImage && (
                    <motion.img
                        key={currentImage.id}
                        src={currentImage.src}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute top-0 left-0 w-full h-full object-cover rounded-md"
                        alt={currentImage.caption || ''}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
