import { HandleFinanceiro } from "../utils/financeiro/HandleFinanceiro";
import { TContaAreceber, TValsRecebidos } from "../../useCases/contasAReceber/type/TContasAReceber"
import { currencyFormat } from '../utils/currentFormat/CurrentFormat';
import { checkAdminPrivilege } from "../utils/checksUserLogged/ChecksUserLogged";
import { handleLinksDir } from "../utils/backHome/BackHome";
import { NavBar } from "../navbar/Navbar";


type Props = {
    contasAReceber: TContaAreceber[]
    valoresRecebidos: TValsRecebidos[]
    receberValor: any
    handleChangeValor: React.ChangeEventHandler<HTMLInputElement>
    handleChangeDesconto: React.ChangeEventHandler<HTMLInputElement>
    msg: string
    submitContasAReceberRegister: any
    submitInserirValor: any
    submitfluxoDeCaixa: any
    saldo: number
    printValorRecebido: any
    token: string | any
}

export function ContasAreceberForm({
    contasAReceber,
    receberValor,
    handleChangeValor,
    handleChangeDesconto,
    valoresRecebidos,
    msg,
    submitContasAReceberRegister,
    submitInserirValor,
    submitfluxoDeCaixa,
    saldo,
    printValorRecebido,
    token
}: Props) {

    const handleContasAReceber = new HandleFinanceiro()

    const links = <>    {handleLinksDir(
        'dashboardefault',
        'Painel',
        '##',
        'Financeiro',
        '##',
        'Contas a receber'
    )}</>

    const headerContasReceber =
        <b>Contas a Receber em Aberto</b>

    const sumbit = <>
        <a href="##"
            id='m-2'
            onClick={submitContasAReceberRegister}
        >Emitir Título</a>
        <a href="##"
            id='m-2'
            onClick={submitInserirValor}
        >Receber Valor</a>
        <a href="##"
            id='m-2'
            onClick={submitfluxoDeCaixa}
        >Fluxo de caixa</a>
        <div id="m-2"><b>Saldo à receber </b>{currencyFormat(saldo)}</div>
    </>

    const inputReceberValor = <div
        id="main-inputs-row">
        <input
            id="main-input-number"
            min={0}
            max={999}
            type="number"
            placeholder="Valor Receber"
            onChange={handleChangeValor}
        />
        <input
            id="main-input-number"
            min={0}
            max={999}
            type="number"
            placeholder="Desconto"
            onChange={handleChangeDesconto}
        />
    </div>

    const listaContasReceber = <table className="table">
        <thead>
            <tr>
                <th id="center">ID</th>
                <td>Tipo</td>
                <td id="center">Pagador</td>
                <td id="center">Origem</td>
                <td>Emissão</td>
                <td>Valor</td>
                <td>Vencimento</td>
                <td>Juros</td>
                <td>Multa</td>
                <td>Desconto</td>
                <td>Saldo</td>
                <td>Pagamento</td>
                <td>Recebimento</td>
                <td>Observação</td>
                <td>Receber</td>
            </tr>
        </thead>
        <tbody>
            {contasAReceber.map((conta: TContaAreceber) => (
                <tr key={conta.id_conta}>
                    <th id="center">{conta.id_conta}</th>
                    <td>{conta.tipo}</td>
                    <td id="center">{conta.fk_pagador}</td>
                    <td id="center">{conta.fk_venda}</td>
                    <td>{handleContasAReceber.formatDate(conta.emissao)}</td>
                    <td>{parseFloat(conta.valor).toFixed(3)}</td>
                    <td>{handleContasAReceber.formatDate(conta.vencimento)}</td>
                    <td>{parseFloat(conta.juros).toFixed(3)}</td>
                    <td>{parseFloat(conta.multa).toFixed(3)}</td>
                    <td>{parseFloat(conta.desconto).toFixed(3)}</td>
                    <td>{parseFloat(conta.saldo).toFixed(2)}</td>
                    <td>{conta.pagamento !== null ? handleContasAReceber.formatDate(conta.pagamento) : null}</td>
                    <td>{parseFloat(conta.recebimento).toFixed(2)}</td>
                    <td>{conta.observacao}</td>
                    <td>{checkAdminPrivilege() === "2" ?
                        <a href="##" onClick={() => receberValor(conta)}
                        >Receber</a> : null}</td>
                </tr>
            ))}
        </tbody>
    </table>

    const listaValoresRecebidos = <table className='table'>
        <thead>
            <tr>
                <th id="center">ID</th>
                <td id="center">Conta</td>
                <td id="center">Venda</td>
                <td id="center">User</td>
                <td>Recebido</td>
                <td>Pagamento</td>
                <td>Descrição</td>
                <td>Recibo</td>
            </tr>
        </thead>
        <tbody>{valoresRecebidos.map((valRec: TValsRecebidos) => (
            <tr key={valRec.id_val}>
                <th id="center">{valRec.id_val}</th>
                <td id="center">{valRec.fk_conta}</td>
                <td id="center">{valRec.fk_venda}</td>
                <td id="center">{valRec.fk_user}</td>
                <td>{valRec.valor}</td>
                <td>{handleContasAReceber.formatDate(valRec.data_recebimento)}</td>
                <td>{valRec.descricao}</td>
                <td><a href="##" onClick={() => printValorRecebido(valRec)}>Recibo</a></td>
            </tr>
        ))}</tbody>
    </table>
    return <><NavBar />
        <div className="form">
            {links}
            {checkAdminPrivilege() === '2' && sumbit}
            {headerContasReceber}
            {token}
            {checkAdminPrivilege() === '2' ? inputReceberValor : <div>Contas em aberto do cliente</div>}
            {<div>{msg}</div>}
        </div>
        {contasAReceber.length > 0 ? <div className="table-container" >{listaContasReceber}</div> : <h1 className="text-center">Cliente sem título para pagar !</h1>}
        {valoresRecebidos.length > 0 && <div className="table-container">{listaValoresRecebidos}</div>}
    </>
}