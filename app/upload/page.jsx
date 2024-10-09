"use client";

import React, { useState, useEffect, useRef } from "react";
import Loader from "../../components/loader/loader";
import "react-toastify/dist/ReactToastify.css";
import { MdDelete, MdEdit } from "react-icons/md";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { AiOutlinePlus } from "react-icons/ai";
// import socket from "../socket";
import { errorToast, successToast } from "../../utils/toast";

const schema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string().trim().required("Password is required"),
});

export default function Page() {
  const [userError, setUserError] = useState();
  const [userIsLogged, setUserLogging] = useState(false);
  const [images, setImages] = useState([]);
  const [caption, setCaption] = useState("");
  const [director, setDirector] = useState("");
  const [photographer, setPhotographer] = useState("");
  const [year, setYear] = useState("");
  const [alphaname, setAlphaname] = useState("");
  const [dimensions, setDimensions] = useState("");

  const [loader, setLoader] = useState(false);
  const [modal, setModal] = useState(false);
  const [editmodal, setEditModal] = useState(false);
  const [delId, setdelId] = useState();
  const [fetchPhotos, setFetchedPhotos] = useState([]);
  const wasCalled = useRef(false);
  const [nextPageToken, setNextPageToken] = useState(null);

  // initializing socket
  //   useEffect(() => {
  //     socket.emit("firebase-create", "waqas");
  //   }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const changeHandler = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  function formatFileSize(bytes) {
    if (bytes < 1024) {
      return bytes + " B";
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + " KB";
    } else if (bytes < 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    } else {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    }
  }

  const openModal = (name) => {
    setModal(true);
    setdelId(name);
  };

  const openEditModal = (photo) => {
    setEditModal(true);
    setdelId(photo.name);

    setCaption(photo.caption);
    setDirector(photo.director);

    setPhotographer(photo.photographer);
    setYear(photo.year);

    setAlphaname(photo.alphaname);
    setDimensions(photo.dimensions);
  };

  function isObjectMatch(obj1, obj2) {
    var obj1Keys = Object.keys(obj1);
    var obj2Keys = Object.keys(obj2);

    if (obj1Keys.length !== obj2Keys.length) {
      return false;
    }

    for (var i = 0; i < obj1Keys.length; i++) {
      var propName = obj1Keys[i];

      if (obj1[propName] !== obj2[propName]) {
        return false;
      }
    }

    return true;
  }

  const submitHandler = (formData) => {
    const userLogingDetails = {
      username: "Joseph",
      password: "1deaKadet!!!",
    };

    const userDetailsMatched = isObjectMatch(formData, userLogingDetails);

    if (userDetailsMatched && typeof window !== undefined) {
      localStorage.setItem("userIsLogged", JSON.stringify(userDetailsMatched));
      setUserLogging(true);
    } else {
      setUserError("Credentials Are Wrong!");
    }
  };

  const createImage = async (e) => {
    setLoader(true);
    e.preventDefault();

    const formData = new FormData();
    images.forEach((image) => {
      formData.append("file", image);
    });
    formData.append("caption", caption);
    formData.append("director", director);
    formData.append("photographer", photographer);
    formData.append("year", year);
    formData.append("alphaname", alphaname);
    formData.append("dimensions", dimensions);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/firebase/create`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        successToast("Files uploaded successfully!");
        setLoader(false);
      } else {
        errorToast("Failed to upload files!");
        setLoader(false);
      }
    } catch (error) {
      errorToast("Failed to upload files!");
      setLoader(false);
    }

    setLoader(false);
    setImages([]);
  };

  const updateImageData = async () => {
    setLoader(true);

    const formData = new FormData();
    formData.append(`file`, delId);

    formData.append("caption", caption);
    formData.append("director", director);

    formData.append("photographer", photographer);
    formData.append("year", year);

    formData.append("alphaname", alphaname);
    formData.append("dimensions", dimensions);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/firebase/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file: delId,
            caption: caption,
            director: director,
            photographer: photographer,
            year: year,
            alphaname: alphaname,
            dimensions: dimensions,
          }),
        }
      );

      if (response.ok) {
        setEditModal(false);
        successToast("Files updated successfully!");
        setLoader(false);
      } else {
        errorToast("Failed to update file!");
        setLoader(false);
      }
    } catch (error) {
      setEditModal(false);
      errorToast("Failed to update file!");
      setLoader(false);
    }

    setEditModal(false);
    setLoader(false);
  };

  const getImages = async (token) => {
    setLoader(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/firebase/get-all-images`,
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
        setFetchedPhotos(images);

        setLoader(false);
        successToast("Images fetched successfully!");
      } else {
        errorToast("Failed to get files");
        setLoader(false);
      }
    } catch (error) {
      errorToast("Error fetching files");
      setLoader(false);
    }
  };

  const deleteImage = async (name) => {
    setLoader(true);
    setModal(false);

    const form = new FormData();
    form.append("file_name", name);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/firebase/delete`,
        {
          method: "DELETE",
          body: form,
        }
      );

      if (response.ok) {
        successToast("Files deleted successfully");
        setLoader(false);
      } else {
        errorToast("Failed to delete files");
        setLoader(false);
      }
    } catch (error) {
      errorToast("Error deleting file");
      setLoader(false);
    }
  };

  const moreImagesLoadHandler = () => {
    if (nextPageToken) {
      getImages(nextPageToken);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userIsLogged = localStorage.getItem("userIsLogged");
      if (userIsLogged) setUserLogging(true);
    }

    if (wasCalled.current) return;
    wasCalled.current = true;
    getImages(nextPageToken);
  }, []);

  return !userIsLogged ? (
    <>
      <div className="w-full h-screen bg-black grid place-items-center">
        <form
          className="max-w-screen-xl mx-auto rounded-lg border border-solid border-white space-y-4 px-8 py-10 flex flex-col"
          onSubmit={handleSubmit(submitHandler)}
        >
          <h2 className="text-3xl font-bold w-full text-center">
            Sign In First To Upload
          </h2>

          <input
            {...register("username")}
            className="px-2 py-1 rounded-lg border border-solid border-white outline-none text-black"
            placeholder="Username"
          />

          {errors.username && (
            <p className="text-red-400">{errors.username.message}</p>
          )}

          <input
            {...register("password")}
            type="password"
            className="px-2 py-1 rounded-lg border border-solid border-white outline-none text-black"
            placeholder="Password"
          />

          {errors.password && (
            <p className="text-red-400">{errors.password.message}</p>
          )}
          {userError && <p className="text-red-400">{userError}</p>}

          <button className="w-full py-1 bg-white text-black transition-all duration-200 hover:opacity-80 rounded-lg">
            Sign In
          </button>
        </form>
      </div>
    </>
  ) : (
    <>
      {loader && (
        <div className="h-full flex items-center justify-center bg-black bg-opacity-50 fixed w-full z-10">
          <Loader />
        </div>
      )}

      <div className="w-full p-6">
        <form
          onSubmit={createImage}
          className="py-5 px-4 rounded-lg w-1/3 border border-solid border-white mx-auto"
        >
          <h2 className="w-full text-center text-2xl font-bold my-4">
            Upload Images
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="my-2 block">Add Caption</label>
              <input
                type="text"
                onChange={(e) => setCaption(e.target.value)}
                name="caption"
                className="block w-full text-sm border rounded-lg cursor-pointer text-gray-400 focus:outline-none bg-gray-700 border-gray-600 placeholder-gray-400 h-10 p-4"
              />
            </div>

            <div>
              <label className="my-2 block">Add Director</label>
              <input
                type="text"
                onChange={(e) => setDirector(e.target.value)}
                name="director"
                className="block w-full text-sm border rounded-lg cursor-pointer text-gray-400 focus:outline-none bg-gray-700 border-gray-600 placeholder-gray-400 h-10 p-4"
              />
            </div>

            <div>
              <label className="my-2 block">Add Photographer</label>
              <input
                type="text"
                onChange={(e) => setPhotographer(e.target.value)}
                name="photographer"
                className="block w-full text-sm border rounded-lg cursor-pointer text-gray-400 focus:outline-none bg-gray-700 border-gray-600 placeholder-gray-400 h-10 p-4"
              />
            </div>

            <div>
              <label className="my-2 block">Add Year</label>
              <input
                type="text"
                onChange={(e) => setYear(e.target.value)}
                name="year"
                className="block w-full text-sm border rounded-lg cursor-pointer text-gray-400 focus:outline-none bg-gray-700 border-gray-600 placeholder-gray-400 h-10 p-4"
              />
            </div>

            <div>
              <label className="my-2 block">Add Alphaname</label>
              <input
                type="text"
                onChange={(e) => setAlphaname(e.target.value)}
                name="alphaname"
                className="block w-full text-sm border rounded-lg cursor-pointer text-gray-400 focus:outline-none bg-gray-700 border-gray-600 placeholder-gray-400 h-10 p-4"
              />
            </div>

            <div>
              <label className="my-2 block">Add Dimensions</label>
              <input
                type="text"
                onChange={(e) => setDimensions(e.target.value)}
                name="dimensions"
                className="block w-full text-sm border rounded-lg cursor-pointer text-gray-400 focus:outline-none bg-gray-700 border-gray-600 placeholder-gray-400 h-10 p-4"
              />
            </div>

            <div className="col-span-2">
              <label className="my-2 block">Add Files</label>
              <input
                multiple
                onChange={changeHandler}
                className="flex w-full text-sm border rounded-lg cursor-pointer text-gray-400 focus:outline-none bg-gray-700 border-gray-600 placeholder-gray-400 mb-6 py-2"
                id="file_input"
                type="file"
              />
            </div>
            <button
              disabled={images.length === 0}
              type="submit"
              className="bg-white text-black transition-all duration-300 hover:opacity-90 py-2 disabled:bg-gray-200 disabled:cursor-not-allowed col-span-2 rounded-lg"
            >
              Upload
            </button>
          </div>
        </form>
        <h2 className="w-full text-center text-2xl font-bold mt-6 mb-4">
          Your Uploads
        </h2>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {fetchPhotos && fetchPhotos.length > 0 ? (
            fetchPhotos.map((photo, i) => (
              <div
                className="relative break-all p-2 border-2 rounded-xl border-white transition-all duration-300 hover:shadow-md hover:shadow-white"
                key={i}
              >
                <p className="text-white font-bold my-2 mt-10">
                  Name :<span className="font-normal">{photo.name}</span>
                </p>
                <p className="text-white font-bold my-2 truncate">
                  Caption :<span className="font-normal">{photo.caption}</span>
                </p>
                <p className="text-white font-bold my-2 truncate">
                  Director :
                  <span className="font-normal">{photo.director}</span>
                </p>
                <p className="text-white font-bold my-2 truncate">
                  Photographer :
                  <span className="font-normal">{photo.photographer}</span>
                </p>
                <p className="text-white font-bold my-2 truncate">
                  Year :<span className="font-normal">{photo.year}</span>
                </p>
                <p className="text-white font-bold my-2 truncate">
                  Alphaname :
                  <span className="font-normal">{photo.alphaname}</span>
                </p>
                <p className="text-white font-bold my-2 truncate">
                  Image Format :
                  <span className="font-normal">{photo.contentType}</span>
                </p>
                <p className="text-white font-bold my-2 truncate">
                  Dimensions :
                  <span className="font-normal">{photo.dimensions}</span>
                </p>
                <p className="text-white font-bold my-2 truncate">
                  Size :
                  <span className="font-normal">
                    {formatFileSize(photo.size)}
                  </span>
                </p>
                <p className="text-white font-bold my-2 truncate">
                  Created at :
                  <span className="font-normal">
                    {new Date(photo.created_at).toLocaleString("en-US")}
                  </span>
                </p>
                <p className="text-white font-bold my-2 truncate">
                  Updated at :
                  <span className="font-normal">
                    {new Date(photo.updated_at).toLocaleString("en-US")}
                  </span>
                </p>
                <button
                  onClick={() => openModal(photo.name)}
                  className="absolute top-5 right-5 rounded-full p-1 text-white bg-red-500 cursor-pointer"
                >
                  <MdDelete />
                </button>
                <button
                  onClick={() => openEditModal(photo)}
                  className="absolute top-5 right-14 rounded-full p-1 text-white bg-red-500 cursor-pointer"
                >
                  <MdEdit />
                </button>
              </div>
            ))
          ) : (
            <div className="h-[60vh] flex items-center justify-center" />
          )}
        </div>
      </div>

      {modal == true && (
        <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full h-screen  flex bg-black bg-opacity-50">
          <div className="relative p-4 w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <button
                onClick={() => setModal(false)}
                type="button"
                className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg
                  className="w-3 h-3"
                  ariaHidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
              <div className="p-4 md:p-5 text-center">
                <svg
                  className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
                  ariaHidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete this image?
                </h3>
                <button
                  onClick={() => deleteImage(delId)}
                  type="button"
                  className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                >
                  {`Yes, I'm sure`}
                </button>
                <button
                  onClick={() => setModal(false)}
                  type="button"
                  className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  No, cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editmodal == true && (
        <div
          className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full 
        md:inset-0 h-[calc(100%-1rem)] max-h-full h-screen flex bg-gray-900 bg-opacity-75"
        >
          <div className="relative p-4 w-full max-w-xl max-h-full">
            <div className="relative bg-gray-700 rounded-lg shadow w-full">
              <button
                onClick={() => setEditModal(false)}
                type="button"
                className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              >
                <svg
                  className="w-3 h-3"
                  ariaHidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
              <div className="p-4 md:p-5">
                <h2 className="w-full text-white text-center text-2xl font-bold">
                  Edit Image
                </h2>
                <div className="grid grid-cols-2 gap-x-4 rounded-lg text-white my-4">
                  <div>
                    <label className="mb-2 mt-4 block">Add Caption</label>
                    <input
                      type="text"
                      onChange={(e) => setCaption(e.target.value)}
                      name="caption"
                      value={caption}
                      className="block w-full text-sm border rounded-lg cursor-pointer text-white focus:outline-none focus:border-white bg-gray-700 border-gray-600 placeholder-gray-400 h-10 p-4"
                    />
                  </div>

                  <div>
                    <label className="mb-2 mt-4 block">Add Director</label>
                    <input
                      type="text"
                      onChange={(e) => setDirector(e.target.value)}
                      name="director"
                      value={director}
                      className="block w-full text-sm border rounded-lg cursor-pointer text-white focus:outline-none focus:border-white bg-gray-700 border-gray-600 placeholder-gray-400 h-10 p-4"
                    />
                  </div>

                  <div>
                    <label className="mb-2 mt-4 block">Add Photographer</label>
                    <input
                      type="text"
                      onChange={(e) => setPhotographer(e.target.value)}
                      name="photographer"
                      value={photographer}
                      className="block w-full text-sm border rounded-lg cursor-pointer text-white focus:outline-none focus:border-white bg-gray-700 border-gray-600 placeholder-gray-400 h-10 p-4"
                    />
                  </div>

                  <div>
                    <label className="mb-2 mt-4 block">Add Year</label>
                    <input
                      type="text"
                      onChange={(e) => setYear(e.target.value)}
                      name="year"
                      value={year}
                      className="block w-full text-sm border rounded-lg cursor-pointer text-white focus:outline-none focus:border-white bg-gray-700 border-gray-600 placeholder-gray-400 h-10 p-4"
                    />
                  </div>

                  <div>
                    <label className="mb-2 mt-4 block">Add Alphaname</label>
                    <input
                      type="text"
                      onChange={(e) => setAlphaname(e.target.value)}
                      name="alphaname"
                      value={alphaname}
                      className="block w-full text-sm border rounded-lg cursor-pointer text-white focus:outline-none focus:border-white bg-gray-700 border-gray-600 placeholder-gray-400 h-10 p-4"
                    />
                  </div>

                  <div>
                    <label className="mb-2 mt-4 block">Add Dimensions</label>
                    <input
                      type="text"
                      onChange={(e) => setDimensions(e.target.value)}
                      name="dimensions"
                      value={dimensions}
                      className="block w-full text-sm border rounded-lg cursor-pointer text-white focus:outline-none focus:border-white bg-gray-700 border-gray-600 placeholder-gray-400 h-10 p-4"
                    />
                  </div>
                </div>

                <div className="w-full gap-4 flex items-center justify-center mt-8">
                  <button
                    type="button"
                    onClick={() => updateImageData()}
                    className="py-2.5 px-5 text-sm font-medium text-white focus:outline-none bg-green-500 rounded-lg
                  hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setEditModal(false)}
                    type="button"
                    className="py-2.5 px-5 text-sm font-medium text-white focus:outline-none bg-red-500 rounded-lg
                  hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className="grid place-items-center text-[24px] my-10"
        onClick={moreImagesLoadHandler}
      >
        <AiOutlinePlus className="cursor-pointer transition-all duration-300 hover:opacity-80 text-white hover:bg-gray-500" />
      </div>
    </>
  );
}
