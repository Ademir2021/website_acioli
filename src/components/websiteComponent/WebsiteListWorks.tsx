// import { checksUserLogged } from '../utils/checksUserLogged/ChecksUserLogged';

import { TWork } from '../../useCases/webSite/types/TWork'
import './css/list-itens.css'

type Props = {
    works: TWork[]
}

export function WebsiteListWorks({ works }: Props) {
    return <>
    <div className='container'>
        {works.map((work: TWork) => (
            <div className='container-itens'>
                <div className='main-itens'>
                    {/* <div key={work.id}>{work.id}</div> */}
                    <b className='work-title' key={work.id}>{work.title}</b>
                    <h1>{work.subject}</h1>
                    <img className='itens-img' src={`./img/works/${work.photo}`} alt="Aguardando Foto da Obra"></img>
                    <dd className='work-description'>{work.description}</dd>
                </div>
            </div>
        ))}
    </div>
    </>
}