'use client'

import Link from "next/link";

import { useState, useEffect, useRef } from "react";

import { RxCaretSort } from "react-icons/rx";
import { BsSortAlphaDown } from "react-icons/bs";
import { TbClockDown } from "react-icons/tb";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import { AiOutlinePlus } from "react-icons/ai";
import { getAllImagesA_Z } from "../../utils/getImages";

import MoreImageLoader from '../../components/MoreImageLoader/index';
import Footer from "../../components/Footer"
import Loader from "../../components/loader/loader";
import { TbClockUp } from "react-icons/tb";

export default function Order() {
    const descriptionTextAlign = "end";
    const descriptionMaxLines = 3;
    const isOpen = true;

    const [isSorted, setSorted] = useState(false);
    const [index, setIndex] = useState(-1);
    const [fetchPhotos, setFetchedPhotos] = useState([]);
    const [slides, setSlides] = useState([]);
    const [skeleton, setSkeleton] = useState(false);
    const [Images, setImages] = useState([]);
    const [moreImageLoader, setLoader] = useState(false);
    const wasCalled = useRef(false);

    const getImages = async () => {
        setSkeleton(true);

        try {
            // if (typeof window !== 'undefined' && !localStorage.getItem('alpha_images_data')) {
                const response = await getAllImagesA_Z();

            if (response.ok) {
                const data = await response.json();
                const images = data.images;

                // localStorage.setItem("alpha_images_data", JSON.stringify(images));

                setImages(images);
                const newSlides = images.map((photo) => {
                    const width = 1080 * 4;
                    const height = 1620 * 4;
                    return {
                        src: photo.src,
                        width,
                        height,
                        title: `${photo.caption}`,
                        description: photo.dimensions
                    };
                });

                    setSlides(newSlides);
                    setSkeleton(false);
                } else {
                    console.error("Failed to get files");
                    setSkeleton(false);
                }
            // } else {
            //     setSkeleton(true);
            //     let data = typeof window !== 'undefined' && localStorage.getItem('alpha_images_data');
            //     if (data) {
            //         data = JSON.parse(data);
            //         setImages(data);
            //         const newSlides = data.map((photo) => {
            //             const width = 1080 * 4;
            //             const height = 1620 * 4;
            //             return {
            //                 src: photo.src,
            //                 width,
            //                 height,
            //                 title: `${photo.caption}`,
            //                 description: photo.dimensions
            //             };
            //         });
            //         setSlides(newSlides);
            //         setSkeleton(false);
            //     }
            // }
        } catch (error) {
            console.error("Error fetching files:", error);
            setSkeleton(false);
        }
    };

    const sortImagesByYear = () => {
        // Assuming your image data has a property called 'year'
        const sortedImages = [...Images].sort((a, b) => {
            // Assuming 'year' is a string in the format 'YYYY'
            const yearA = parseInt(a.year);
            const yearB = parseInt(b.year);
            return yearB - yearA; // Sort in descending order (newest first)
        });
        console.log(sortedImages);
        setSorted(true);
        setImages(sortedImages);
        setSlides(sortedImages.map((photo) => {
            const width = 1080 * 4;
            const height = 1620 * 4;
            return {
                src: photo.src,
                width,
                height,
                title: `${photo.caption}`,
                description: photo.dimensions
            };
        }));
    };

    const sortImagesOldestFirst = () => {
        const sortedImages = [...Images].sort((a, b) => {
            const yearA = parseInt(a.year);
            const yearB = parseInt(b.year);
            return yearA - yearB; // Sort in ascending order (oldest first)
        });

        console.log(sortedImages);
        setSorted(false);
        setImages(sortedImages);
        setSlides(sortedImages.map((photo) => {
            const width = 1080 * 4;
            const height = 1620 * 4;
            return {
                src: photo.src,
                width,
                height,
                title: `${photo.caption}`,
                description: photo.dimensions
            };
        }));
    };

    const sortImagesAlphabetically = () => {
        const sortedImages = [...Images].sort((a, b) => {
            const nameA = a.alphaname.toLowerCase(); // Convert to lowercase for case-insensitive sorting
            const nameB = b.alphaname.toLowerCase();
            return nameA.localeCompare(nameB); // Sort alphabetically (A to Z)
        });

        setImages(sortedImages);
        setSlides(sortedImages.map((photo) => {
            const width = 1080 * 4;
            const height = 1620 * 4;
            return {
                src: photo.src,
                width,
                height,
                title: `${photo.caption}`,
                description: photo.dimensions
            };
        }));
    };

    useEffect(() => {
        if (wasCalled.current) return;
        wasCalled.current = true;
        getImages();
        setSorted(true);
    }, []);

    return (
        <>
            {/* Navigation */}
            <div className="w-full flex justify-center items-center py-9">
                <div className="w-full grid place-items-center space-y-6">

                    <Link href={"/"} >
                        <img src="/assets/logo.svg" className="object-contain w-40" alt="" />
                    </Link>

                    <div className="flex gap-8 items-center">
                        <BsSortAlphaDown className="cursor-pointer transition-all duration-200 hover:scale-105 text-2xl" onClick={sortImagesAlphabetically} />

                        <Link href={"/ordr"}>
                            <RxCaretSort className="cursor-pointer transition-all duration-200 hover:scale-105 text-3xl" />
                        </Link>

                        {!isSorted ?
                            <TbClockDown className="cursor-pointer transition-all duration-200 hover:scale-105 text-2xl" onClick={sortImagesByYear} />
                            :
                            <TbClockUp className="cursor-pointer transition-all duration-200 hover:scale-105 text-2xl" onClick={sortImagesOldestFirst} />
                        }
                    </div>
                </div>
            </div>

            <div className="px-4 lg:px-16 pb-10">
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[10px] place-items-center">
                    {Images.map((photo, i) => (
                        <figure className="relative" key={i}>
                            <img
                                src={photo.src}
                                alt={'images'}
                                className="aspect-[16/9] object-cover cursor-zoom-in"
                                onClick={() => setIndex(i)}
                                loading="lazy"
                            />
                        </figure>
                    ))}
                </div>

                {/* Skeleton */}
                {
                    skeleton && <Loader />
                }

                {/* Lightbox Component */}
                {slides &&
                    <Lightbox
                        plugins={[Captions]}
                        index={index}
                        slides={slides}
                        open={index >= 0}
                        close={() => setIndex(-1)}
                        captions={{ isOpen, descriptionTextAlign, descriptionMaxLines }}
                    />
                }
            </div>

            {!skeleton && <Footer />}
        </>
    );
}
