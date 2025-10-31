import { useState, useEffect } from "react";
import { RegisterSaleForm } from "../../components/sales/RegisterSaleForm";
import { Itens } from "../../components/sales/Itens";
import { TProduct, TItens } from "../products/type/TProducts";
import { currencyFormat } from "../../components/utils/currentFormat/CurrentFormat";
import { postList } from "../../services/handleService";

export function RegisterSale() {

    const [msg, setMsg] = useState('')
    const [product, setProduct] = useState<TItens>(
        { id: 0, item: 0, descric: "", valor: 0, amount: 1, tItem: 0 });
    const [products, setProducts] = useState<TProduct[]>([]);
    const [itens, setItens] = useState<TItens[]>([]);
    const [id, setId] = useState<number>(1);
    const [editId, setEditId] = useState<number | null | any>(null);
    const [, setPreco] = useState<number>(0);
    const [totalItens, setTotalItens] = useState<number>(0)
    const [statusBtnSaleSubmit, setStatusBtnSaleSubmit] = useState<"Iniciar Pedido" | "Faturar Pedido">("Iniciar Pedido");
    const [statusBtnSaveUpdate, setStatusBtnSaveUpdate] = useState<"Salvar Item" | "Atualizar Item">("Salvar Item");
    const [itemImg, setIemImg] = useState<string>('');
    const [itenStorage, setItenStorage] = useState<TItens[]>([]);
    const [statuStore, setStatuStore] = useState<boolean>(false)

    const handleChange = (e: any) => {
        const name = e.target.name;
        const value = e.target.value;
        setProduct(values => ({ ...values, [name]: value }))
    };

    useEffect(() => {
        postList('products_list', setProducts)
    }, [products]);

    function updateListProduct(item: TItens) {
        setStatusBtnSaveUpdate("Atualizar Item");
        setEditId(item.id);
        product.id = item.id;
        product.item = item.item;
        product.descric = item.descric;
        product.amount = item.amount;
        product.valor = item.valor;
        product.tItem = item.amount * item.valor;
        product.image = item.image;
        if (product.image === null) {
            setIemImg('')
        } else {
            findProducts();
        }
    };

    function findProducts() {
        for (let prod of products) {
            if (product.descric == prod.id_product
                || product.descric === prod.bar_code
                || product.descric === prod.descric_product) {
                if (editId !== null) {
                    product.id = editId;
                } else {
                    product.id = id;
                }
                product.item = prod.id_product;
                product.descric = prod.descric_product;
                product.valor = prod.val_max_product;
                product.tItem = product.valor * product.amount;
                if (prod.image === null) {
                    setIemImg('')
                } else {
                    setIemImg("./img/img_itens/" + prod.image);
                }
            }
        }
    };

    function deleteProduct() {
        for (let i = 0; itens.length > i; i++) {
            setEditId(editId)
            if (itens[i].id === editId) {
                itens.splice(i, 1);
                setEditId(null);
                openClearNewSale();
                setStatusBtnSaleSubmit("Faturar Pedido");
                sumItens();
            }
        }
    };

    function verifItem(product: TItens) {
        if (product.item !== 0) {
            for (let item of itens)
                if (product.item === item.item && editId == null) {
                    return setMsg("Item já foi lançado")
                }
            setId(id + 1);
            return itens.push(product)
        } else {
            setMsg("Item não localizado")
        }
    };

    function verifItemUP(product: TItens) {
        for (let item of itens)
            if (product.item === item.item && editId !== null) {
                item.amount = product.amount
                item.tItem = product.amount * product.valor
                return setMsg("Item já foi lançado ! a quantidade é de " + product.amount + " item(s)")
            }
        deleteProduct();
        setItens(itens);
        return itens.push(product);
    };

    function sumItens() {
        let sum = 0
        for (let item of itens) {
            sum += (item.amount * item.valor)
        }
        setTotalItens(sum)
        return sum
    };

    function handleSaveUpdate(e: Event) {
        e.preventDefault();
        if (editId === null) {
            findProducts();
            verifItem(product);
            sumItens();
            openClearNewSale();
            setStatusBtnSaleSubmit("Faturar Pedido");
        } else {
            findProducts();
            verifItemUP(product);
            sumItens();
            openClearNewSale();
            setEditId(null);
            setPreco(0);
        }
    };

    function handleDelete(e: Event) {
        e.preventDefault();
        if (editId !== null) {
            if (window.confirm(
                "Realmente deseja remover o Item de ID: "
                + editId + " ?")) {
                deleteProduct();
                openClearNewSale();
            }
        } else {
            setMsg("Busque um novo item !");
            openClearNewSale();
        }
    };

    function handleSubmit(e: Event) {
        e.preventDefault();
        if (statusBtnSaleSubmit === "Iniciar Pedido") {
            itens.length === 0 ? setMsg("Iniciar compra !") :
                openClearNewSale();
            setStatusBtnSaleSubmit("Faturar Pedido");
        } else {
            setStatusBtnSaleSubmit("Iniciar Pedido");
            if (itens.length === 0) {
                setMsg("Informe ao menos um item e clique em salvar !");
            } else {
                setMsg("Seu pedido será gravado");
                const sale_store = localStorage.getItem('sl');
                if (!sale_store) {
                    localStorage.setItem("i", JSON.stringify(itens))
                    localStorage.setItem("s", JSON.stringify(sumItens().toFixed(2)));
                    setMsg("Pedido gravado com sucesso")
                    setTimeout(() => {
                        window.location.replace("/invoice_sales");
                    }, 1000);
                } else {
                    setMsg("Aguarde ... ! Existe Venda em Aberto");
                }
            }
        }
    };

    function openClearNewSale() {
        setProduct({ id: 0, item: 0, descric: '', valor: 0, amount: 1, tItem: 0 });
        setStatusBtnSaveUpdate("Salvar Item");
        setStatusBtnSaleSubmit("Iniciar Pedido");
        setEditId(null);
        setPreco(0);
        setIemImg('')
    };

    function searchItem(e: Event) {
        e.preventDefault();
        if (statuStore === false) {
            itensStore()
            setStatuStore(true)
            sumItens()
        }
        findProducts();
        setPreco(product.valor);
    };

    function itensStore() {
        const itens_store_res = localStorage.getItem('i');
        if (itens_store_res) {
            const itens_store: TItens[] = JSON.parse(itens_store_res)
            setItenStorage(itens_store);
            for (let itemStorage of itenStorage) {
                itens.push(itemStorage);
                setItens(itens)
                const res_id = localStorage.getItem('id');
                if (res_id)
                    setId(JSON.parse(res_id))
            }
        }
    };
    useEffect(() => {
        itensStore()
    }, []);

    const clearItensStore = () => {
        if (window.confirm("Deseja Esvaziar o Carrinho ?")) {
            localStorage.removeItem('sl')
            localStorage.removeItem('i')
            localStorage.removeItem('t')
            localStorage.removeItem('c')
            localStorage.removeItem('s')
            setItens([])
            setTotalItens(0)
        } else {
            return
        }
    }

    return (
        <>
            <RegisterSaleForm
                handleChange={handleChange}
                handleSaveUpdate={handleSaveUpdate}
                handleSubmit={handleSubmit}
                handleDelete={handleDelete}
                clearItensStore={clearItensStore}
                handleSearchItem={searchItem}
                products={products}
                item={(product.descric)}
                statusBtnSaveUpdate={statusBtnSaveUpdate}
                statusBtnSaleSubmit={statusBtnSaleSubmit}
                item_img={itemImg}
                msg={msg}
                totalItens={totalItens <= 0 ? '' : currencyFormat(totalItens)}
                loadItens={itens.length === 0 ? "Carregando" :
                    <Itens
                        itens={itens}
                        updateListProduct={updateListProduct}
                    />}
            >
                {product}
            </RegisterSaleForm>
        </>
    )
}