import axios from "axios";
import React, { useState, useEffect } from "react";
import uuid from "./uuid";

const Cart = (props) => {
    let [items, setItems] = useState([]);
    let [cartList, setCartList] = useState([]);
    let [preTax, setPreTax] = useState(0.00);
    let [itemSearch, setItemSearch] = useState("");
    let [toggle, setToggle] = useState("");


    const tax = .08;



    const calculate = (tempCart) => {
        let tempPreTax = 0;
        for (let i = 0; i < tempCart.length; i++) {
            tempPreTax = Number(tempPreTax) + Number(tempCart[i].price);
        }
        setPreTax((preTax) => tempPreTax);
    }


    const addCartItem = (itemName, price) => {
        let tempCart = cartList;
        tempCart = [...cartList, { itemName, price }];
        setCartList((cartList) => tempCart);
        calculate(tempCart);

    }

    const removeCartItem = (whichItem) => {
        let tempCart = [];
        for (let i = 0; i < cartList.length; i++) {
            if (i !== whichItem) {
                tempCart.push(cartList[i])
            }
        }
        setCartList((cartList) => tempCart);
        calculate(tempCart);

    }

    const filterItems = () => {
        let searchTxt = document.querySelector("[name='filterItems']").value;
        searchTxt = searchTxt.toLowerCase();
        setItemSearch((itemSearch) => searchTxt);
    }





    const submitCart = () => {
        //save locally for now
        //https://stackoverflow.com/questions/10830357/javascript-toisostring-ignores-timezone-offset
        let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        let timeStamp = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
        timeStamp = timeStamp.substring(0, timeStamp.indexOf("."));


        let currentCart = [];
        /* if (localStorage.getItem("purchaseLog")) {
             currentCart = JSON.parse(localStorage.getItem("purchaseLog"))
         }*/
        let tempCart = [];
        for (let i = 0; i < cartList.length; i++) {
            tempCart.push({
                saleId: props.userEmail + ":" + timeStamp,
                itemName: cartList[i].itemName,
                price: cartList[i].price,
                uuid: uuid()
            });

            //START CLIENT SIDE MAKE PURCHASE

            axios.post("/api/purchaseLog/post-purchase",
                {
                    saleId: props.userEmail + ":" + timeStamp,
                    itemName: cartList[i].itemName,
                    price: Number(cartList[i].price),
                    uuid: uuid()
                }, props.config).then(
                    (res) => {
                        console.log("sold: " + cartList[i].itemName);
                    }, (error) => {
                        props.showAlert("Something wen't wrong: " + error);
                    }
                )



        }



        tempCart = [...currentCart, ...tempCart];
        // localStorage.setItem("purchaseLog", JSON.stringify(tempCart));
        setCartList((cartList) => []);
        props.showAlert("Purchase Submitted!", "success");
        setToggle((toggle) => "");

    }





    return (

        <div className="row cartPanel">
            <div className="col-md-6">
                <h2 className="mt-3">Items</h2>
                <input type="text" name="filterItems" placeholder="Search Items" className="form-control" onChange={() => filterItems()} />
                <div className="list-group">
                    {props.items.length > 0 ? props.items.map((item, i) => {
                        let tempName = item.itemName.toLowerCase();

                        return <button type="button" key={i} className={tempName.indexOf(itemSearch) !== -1 ? "list-group-item list-group-item-action capitalize" : "hide"}
                            onClick={() => addCartItem(item.itemName, item.price)}>{item.itemName + " - $" + item.price}</button>

                    })
                        : null}
                </div>
            </div>
            <div className="col-md-6">
                <h2 className="mt-3">Cart</h2>
                <div className="list-group">
                    {cartList.length > 0 ? cartList.map((cartItem, i) => {
                        return (<li key={i} className="list-group-item ">
                            <i className="fa fa-trash pointer" onClick={() => removeCartItem(i)}></i>{" "}
                            <span className="capitalize">{cartItem.itemName + " - $" + cartItem.price}</span></li>)
                    }) : null}
                </div>
                {cartList.length > 0 ?
                    <ul className="list-unstyled">
                        <li>Tax ${tax.toFixed(2)}</li>
                        <li><h4>Pre Tax ${preTax.toFixed(2)}</h4></li>
                        <li><div className="alert alert-success" role="alert"><h3 className="">Total ${((preTax * tax) + preTax).toFixed(2)}</h3></div>
                        </li>
                        <li>

                            {toggle !== "submitCart" ? <button className="btn btn-block btn-danger" onClick={() => setToggle((toggle) => "submitCart")}>Submit Cart</button> :
                                <div className="alert alert-danger" role="alert">
                                    <p>Are you sure you want to submit cart?</p>
                                    <button className="btn btn-warning" onClick={() => submitCart()}>Yes</button>
                                    <button className="btn btn-dark" onClick={() => setToggle((toggle) => "")}>No</button>
                                </div>}

                        </li>
                    </ul>
                    : null}
            </div>

        </div>





    )
}

export default Cart;