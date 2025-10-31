import { useEffect, useState, useContext } from "react"
import { ContasAreceberForm } from "../../components/contasAReceber/ContasAReceberForm"
import { FormatDate } from "../../components/utils/formatDate"
import { HandleFinanceiro } from "../../components/utils/financeiro/HandleFinanceiro"
import { handleTokenMessage } from "../../services/handleEnsureAuth"
import { postAuthHandle } from "../../services/handleService"
import { TContaAreceber, TValsRecebidos } from "./type/TContasAReceber"
import { TPerson } from "../persons/type/TPerson"
import { TSaleList } from "../sales/type/TSale"

import { AuthContext } from '../../context/auth'

import api from "../../services/api/api"

function ContasAReceber() {

    const { user: isLogged }: any = useContext(AuthContext);

    const handleContasAReceber = new HandleFinanceiro()

    const [msg, setMsg] = useState('')
    const [valor, setValor] = useState(0)
    const [desconto, setDesconto] = useState(0)
    const [contasAReceber, setContasAReceber] = useState<TContaAreceber[]>([])
    const [openAccounts, setOpenAccounts] = useState<TContaAreceber[]>([])
    const [valsRecebido] = useState<TValsRecebidos[]>([])
    const [valsRecebidos, setValsRecebidos] = useState<TValsRecebidos[]>([])
    const [valsRecebidosAll, setValsRecebidosAll] = useState<TValsRecebidos[]>([])
    const [persons, setPersons] = useState<TPerson[]>([])
    const [sales, setSales] = useState<TSaleList[]>([]);
    const [tokenMessage, setTokenMessage] = useState<string>("Usuário Autenticado !")

    useEffect(() => {
        setTimeout(() => {
            setMsg('')
        }, 9000);
    }, [msg])

    useEffect(() => {
        async function getContasAReceber() {
            await postAuthHandle('contas_receber_list', setTokenMessage, setContasAReceber, isLogged)
            const NewOpenAccounts: TContaAreceber[] = []
            for (let conta of contasAReceber)
                if (conta.saldo > 0 || conta.recebimento == 0) {
                    NewOpenAccounts.push(conta)
                }
            setOpenAccounts(NewOpenAccounts)
        }
        if (openAccounts.length === 0) {
            getContasAReceber()
        }
    }, [contasAReceber])

    useEffect(() => {
        async function getValsRecebidos() {
            await postAuthHandle('vals_recebidos_list', setTokenMessage, setValsRecebidosAll, isLogged)
            const vals: TValsRecebidos[] = []
            for (let val of valsRecebidosAll)
                if (val.fk_user)
                    vals.push(val)
            setValsRecebidos(vals)
        }
        getValsRecebidos()
    }, [valsRecebidosAll])

    const updateContaReceber = async (conta: TContaAreceber) => {
        await api.put<TContaAreceber>('contas_receber', conta)
            .then(response => {
                console.log(response.data)
            })
            .catch(err => console.log(err))
    }

    const getSaldo = (contaAReceber: TContaAreceber) => {
        const saldo = parseFloat(contaAReceber.valor || 0) -
            parseFloat(contaAReceber.recebimento || 0) +
            parseFloat(contaAReceber.juros || 0) +
            parseFloat(contaAReceber.multa || 0)
        contaAReceber.saldo = saldo.toFixed(3)
    }

    useEffect(() => {
        function calcContasAReceber() {
            for (let contaAReceber of openAccounts) {

                const venc_original = new Date(contaAReceber.vencimento).getTime();
                const diaPagamento = new Date().getTime()

                if (venc_original < diaPagamento) { // se vencer calcular juros e multa
                    const difference = handleContasAReceber.dateDifference(venc_original, diaPagamento);

                    if (parseInt(difference.diffInDays.toFixed(0)) < 500) { // calcula juros e multa por determindado tempo somente.
                        const diasCalcJuros: number | any = (difference.diffInDays).toFixed(0)
                        contaAReceber.juros = contaAReceber.valor !== 0.00 ? contaAReceber.valor * diasCalcJuros * (0.10 / 100) : 0.00
                        contaAReceber.multa = diasCalcJuros > 5 ? contaAReceber.valor * (3 / 100) : 0.00
                    }
                }
                getSaldo(contaAReceber)
            }
        }
        calcContasAReceber();
    }, [openAccounts])

    async function registerValRecebido(valRecebido: TValsRecebidos) {
        await api.post<TValsRecebidos>('val_recebido', valRecebido)
            .then(response => {
                console.log(response.data)
            })
            .catch(error => console.log((error)))
    }

    async function valsReceber(conta: TContaAreceber) {
        let id = 1
        let newValueReceived: TValsRecebidos = {
            id_val: 0,
            fk_conta: 0,
            fk_venda: 0,
            fk_user: 0,
            valor: 0,
            data_recebimento: "",
            descricao: "",
            fk_person: 0
        }
        newValueReceived.id_val = id++
        newValueReceived.fk_conta = conta.id_conta
        if (conta.fk_venda !== null) {
            newValueReceived.fk_venda = conta.fk_venda
        }
        else if (conta.fk_venda === null) {
            newValueReceived.fk_venda = 0
        }
        newValueReceived.fk_user = isLogged[0].id
        newValueReceived.data_recebimento = new Date()
        newValueReceived.valor = valor
        newValueReceived.descricao = 'Venda'
        newValueReceived.fk_person = 0
        valsRecebido.push(newValueReceived)
        await registerValRecebido(newValueReceived)
    }

    async function somaValsRecebidos(conta: TContaAreceber) {
        let valRec: any = 0
        let soma = 0
        for (let valRecebido of valsRecebidos) {
            if (valRecebido.fk_conta === conta.id_conta)
                valRec = valRecebido.valor
            soma += parseFloat(valRec)
        }
        return soma + valor
    }

    const receberValores = async (conta: TContaAreceber) => {
        for (let contaAReceber of contasAReceber) {
            if (contaAReceber.id_conta === conta.id_conta) {
                const recebimento = await somaValsRecebidos(conta)
                contaAReceber.recebimento = recebimento
                contaAReceber.desconto = desconto
                const saldo =
                    parseFloat(contaAReceber.valor) -
                    parseFloat(contaAReceber.recebimento) +
                    parseFloat(contaAReceber.juros) +
                    parseFloat(contaAReceber.multa) -
                    parseFloat(contaAReceber.desconto)
                contaAReceber.saldo = saldo.toFixed(2)
                contaAReceber.juros = parseFloat(contaAReceber.juros).toFixed(2)
                contaAReceber.multa = parseFloat(contaAReceber.multa).toFixed(2)
                contaAReceber.desconto = parseFloat(contaAReceber.desconto).toFixed(2)
                contaAReceber.pagamento = handleContasAReceber.newData()
                await updateContaReceber(contaAReceber)
            }
        }
    }

    function handleSumbit(conta: TContaAreceber) {
        setMsg('')
        valsReceber(conta)
        receberValores(conta)
        setValor(0)
    }

    function sumSaldoAReceber() {
        let saldo: number | any = 0
        if (openAccounts) {
            for (let contaReceber_ of openAccounts)
                saldo += parseFloat(contaReceber_.saldo)
            return saldo
        }
        else if (!openAccounts)
            return 0
    }

    useEffect(() => {
        postAuthHandle('persons_user', setTokenMessage, setPersons, isLogged)
    }, [persons])

    useEffect(() => {
        postAuthHandle('sale_user', setTokenMessage, setSales, isLogged)
    }, [sales])

    function findPerson(id_pers: number, id_conta: number, id_venda: number) {
        for (let pers of persons)
            if (pers.id_person === id_pers) {
                return [pers.id_person, pers.name_pers, pers.cpf_pers]
            }
        for (let conta of contasAReceber)
            if (conta.id_conta === id_conta) {
                for (let pers of persons)
                    if (pers.id_person === conta.fk_pagador) {
                        return [pers.id_person, pers.name_pers, pers.cpf_pers]
                    }
            }
        for (let sale of sales)
            if (sale.id_sale === id_venda) {
                for (let pers of persons)
                    if (pers.id_person == sale.fk_name_pers) {
                        return [pers.id_person, pers.name_pers, pers.cpf_pers]
                    }
            }
    }

    function printValorRecebido(valRec: TValsRecebidos) {
        const recibo = {
            id: 0, conta: 0, venda: 0, user: 0, valor: 0, data_rec: '',
            descricao: '', id_cliente: 0, nome_cliente: '', cpf: ''
        }
        for (let val of valsRecebidos) {
            if (val.id_val === valRec.id_val) {
                recibo.id = valRec.id_val
                recibo.conta = valRec.fk_conta
                recibo.venda = valRec.fk_venda
                recibo.user = valRec.fk_user
                recibo.valor = valRec.valor
                recibo.data_rec = FormatDate(valRec.data_recebimento)
                recibo.descricao = valRec.descricao
                const pers = findPerson(valRec.fk_person, valRec.fk_conta, valRec.fk_venda)
                if (pers)
                    recibo.id_cliente = pers[0]
                if (pers)
                    recibo.nome_cliente = pers[1]
                if (pers)
                    recibo.cpf = pers[2]
                localStorage.setItem("recibo_val_rec", JSON.stringify(recibo))
                window.location.replace('recibo_val_rec')
            }
        }
    }

    return (
        <>
            <ContasAreceberForm
                token={handleTokenMessage('contas_receber', tokenMessage)}
                contasAReceber={openAccounts}
                valoresRecebidos={valsRecebidos}
                receberValor={valor > 0 ? handleSumbit : () => { setMsg('Informe um novo valor') }}
                handleChangeValor={(e: any) => {
                    setValor(parseFloat(e.target.value))
                }}
                handleChangeDesconto={(e: any) => {
                    setDesconto(parseFloat(e.target.value))
                }}
                msg={msg}
                submitContasAReceberRegister={() => { window.location.assign("/contas_receber_register") }}
                submitInserirValor={() => { window.location.assign("receber_valor") }}
                submitfluxoDeCaixa={() => { window.location.assign("caixa_mov") }}
                saldo={sumSaldoAReceber()}
                printValorRecebido={printValorRecebido}
            />
        </>
    )
}

export { ContasAReceber }