import SideBar from "./_components/sideBar";

export default function RootLayout({children}: Readonly<{
  children: React.ReactNode;
}>) { 
    return (
        <div className="flex max-h-screen w-screen">
            <SideBar/>
            <div className="overflow-auto min-h-screen flex-1">
                {children}
            </div>
        </div>
    )
}