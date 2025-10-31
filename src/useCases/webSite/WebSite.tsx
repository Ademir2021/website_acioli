import { useState } from "react"
import ControlledCarousel from "../../components/carousel/ControlledCarousel"
import { NavBarWebsite } from "../../components/navbarWebsite/NavbarWebsite"
import { WebsiteComponent } from "../../components/websiteComponent/WebsiteComponent"
import { WebsiteFooter } from "../../components/websiteComponent/WebsiteFooter"
import  worksJSON from "./JSON/works.json"
import { TWork } from "./types/TWork"
import { WebsiteListWorks } from "../../components/websiteComponent/WebsiteListWorks"

const Website = () =>{

    const respWorks:any = worksJSON
    const [works, setWorks] = useState<TWork[]>(respWorks.works)

    return <>
    {/* <p>{JSON.stringify(works)}</p> */}
    <NavBarWebsite/>
    <ControlledCarousel/>
    <WebsiteComponent />
    <WebsiteListWorks
    works={works}
    />
    <WebsiteFooter/>
    </>
}

export {Website}