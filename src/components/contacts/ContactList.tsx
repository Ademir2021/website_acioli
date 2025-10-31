import ListComponent from '../listComponent/ListComponent';
import { FormatDate } from '../utils/formatDate/index';

export type Props = {
    id?: number
    created_at?: Date | any
    name: string
    email: string
    phone?: string
    comments: string
}

export function ContactList(props: Props) {
    return <><ListComponent
        list={<>
            <div><b>ID:</b> {props.id}</div>
            <div><b>Post:</b> {FormatDate(props.created_at)}</div>
            <div><b>Nome:</b> {props.name}</div>
            <div><b>Email:</b> {props.email}</div>
            <div><b>Telefone:</b> {props.phone}</div>
            <div><b>Assunto:</b> {props.comments}</div>
        </>}
    />
    </>
}