import SideBar from "./_components/sideBar";

export default function RootLayout({children}: Readonly<{
  children: React.ReactNode;
}>) { 
    return (
        <div className="flex h-screen w-screen">
            <SideBar/>
            {children}
        </div>
    )
}