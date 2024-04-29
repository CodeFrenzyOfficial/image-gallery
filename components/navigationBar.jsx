import Link from "next/link";

export default function NavigationBar() {
    return (
        <div className="w-full flex justify-center items-center py-9">
            <div className="w-full grid place-items-center space-y-4">
                
                <Link href={"/"} >
                    <img src="/assets/logo.svg" className="object-contain w-40" alt="" />
                </Link>

                <a href="https://letterboxd.com/tndrbtns/" target="_blank">
                    <img src="/assets/bottom-logo.svg"
                        className="object-contain w-20"
                        alt="" />
                </a>
            </div>
        </div>
    )
}