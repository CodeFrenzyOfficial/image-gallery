"use client";

import { useState, useEffect, useRef } from "react";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import { AiOutlinePlus } from "react-icons/ai";
import { getImagesAPI } from "../utils/getImages";
import Loader from "./loader/loader";
import Footer from "./Footer";
import MoreImageLoader from "../components/MoreImageLoader/index";

import io from "socket.io-client";
import { errorToast, successToast } from "../utils/toast";
let socket;

export default function MasonaryGrid() {
  const descriptionTextAlign = "start";
  const descriptionMaxLines = 3;
  const isOpen = true;

  const [index, setIndex] = useState(-1);
  const [slides, setSlides] = useState([]);
  const [skeleton, setSkeleton] = useState(false);
  const [moreImageLoader, setLoader] = useState(false);
  const [Images, setImages] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const wasCalled = useRef(false);

  const getImages = async (token) => {
    token ? setLoader(true) : setSkeleton(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/firebase/get-images`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pageToken: token }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const images = data.images;

        setNextPageToken(data.nextPageToken);
        setImages((prevImages) => [...prevImages, ...images]);

        const newSlides = images.map((photo) => {
          const width = 1080 * 4;
          const height = 1620 * 4;
          return {
            src: photo.src,
            width,
            height,
            title: `${photo.caption}`,
            description: photo.dimensions,
          };
        });

        setSlides((prevSlides) => [...prevSlides, ...newSlides]);
        setSkeleton(false);

        setLoader(false);
        successToast("Images fetched successfuly!");
      } else {
        errorToast("Failed to get files");
        setSkeleton(false);
        setLoader(false);
      }
    } catch (error) {
      errorToast("Error fetching files");
      setSkeleton(false);
      setLoader(false);
    }
  };

  const moreImagesLoadHandler = () => {
    if (nextPageToken) {
      getImages(nextPageToken);
    }
  };

  useEffect(() => {
    if (wasCalled.current) return;
    wasCalled.current = true;
    getImages(nextPageToken);
  }, []);

  /*useEffect(() => {
        // Initialize Socket.IO connection when the component mounts
        socket = io(); // Automatically connects to the server

        socket.on('connect', () => {
            console.log('Connected to the server with ID:', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from the server');
        });

        socket.on('upload', (data) => {
            console.log("Recieved from SERVER ::", data);

            setImages((prevImages) => [data, ...prevImages]);
            setSlides((prevSlides) => [data, ...prevSlides]);
        })

        // Cleanup: Disconnect when the component is unmounted
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);*/

  return (
    <>
      <div className="px-4 lg:px-16 pb-10">
        {/* Images */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[10px] place-items-center">
          {Images.map((photo, i) => (
            <figure className="relative" key={i}>
              <img
                src={photo.src}
                alt={"images"}
                className="aspect-[16/9] object-cover cursor-zoom-in"
                onClick={() => setIndex(i)}
                loading="lazy"
              />
            </figure>
          ))}
        </div>

        {/* Skeleton */}
        {skeleton && <Loader />}

        {/* Loading More Images Icon */}
        {!skeleton &&
          (!moreImageLoader ? (
            <div
              className="grid place-items-center text-[24px] pt-10 "
              onClick={moreImagesLoadHandler}
            >
              <AiOutlinePlus className="cursor-pointer transition-all duration-300 hover:opacity-80 text-[#CECECF]" />
            </div>
          ) : (
            <MoreImageLoader />
          ))}

        {/* Lightbox Component */}
        {slides && (
          <Lightbox
            plugins={[Captions]}
            index={index}
            slides={slides}
            open={index >= 0}
            close={() => setIndex(-1)}
            captions={{ isOpen, descriptionTextAlign, descriptionMaxLines }}
          />
        )}
      </div>

      {!skeleton && <Footer />}
    </>
  );
}
