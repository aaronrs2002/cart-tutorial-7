import React, { useState, useEffect } from "react";
import './App.css';
import axios from "axios";
import Login from "./components/Login";
import Nav from "./components/Nav";
import ChangePassword from "./components/ChangePassword";
import DeleteUser from "./components/DeleteUser";
import uuid from "./components/uuid";
import Validate from "./components/Validate.js";
import Cart from "./components/Cart"
import PurchaseLog from './components/PurchaseLog';
import CMS from "./components/CMS";
import TimeSelector from "./components/TimeSelector";
import PurchasingChart from "./components/PurchasingChart";


function App() {
  let [loaded, setLoaded] = useState(false);
  let [userEmail, setUserEmail] = useState(null);
  let [isValidUser, setIsValidUser] = useState(false);
  let [token, setToken] = useState("");
  let [activeModule, setActiveModule] = useState("cart");
  let [alert, setAlert] = useState("default");
  let [alertType, setAlertType] = useState("danger");
  let [checkedToken, setCheckedToken] = useState(false);
  let [infoMessage, setInfoMessage] = useState("");
  let [newUser, setNewUser] = useState(false);
  //hooks for point of sale cart tutorial (from lesson 5)
  let [timeSelected, setTimeSelected] = useState([]);
  let [compareTime, setCompareTime] = useState("");
  let [items, setItems] = useState([]);



  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`
    }
  }

  const showAlert = (theMessage, theType) => {
    setAlertType((alertType) => theType);
    setAlert((alert) => theMessage);
    setTimeout(() => {
      setAlert((alert) => "default");
    }, 3000)
  }

  ///START TIME SEARCH JS


  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth();
  month = (Number(month) + 1);
  if (Number(month) < 10) {
    month = "0" + month;
  }
  let day = date.getDate();
  if (Number(day) < 10) {
    day = "0" + day;
  }

  let hours = date.getUTCHours();
  if (Number(hours) < 10) {
    hours = "0" + hours;
  }


  const timeSearch = () => {
    if (activeModule === "analytics") {
      document.querySelector("select[name='itemSelect']").selectedIndex = 0;

    }

    let selectYr = document.querySelector("select[name='purchaseYr']").value;
    let selectMo = document.querySelector("select[name='purchaseMo']").value;
    if (selectMo === "default") {
      selectMo = "";
    } else {
      selectMo = "-" + selectMo;
    }
    let selectDy = document.querySelector("select[name='purchaseDay']").value;
    if (selectMo === "default" || selectDy == "default") {
      selectDy = "";
    } else {
      selectDy = "-" + selectDy;
    }
    let selectHr = document.querySelector("select[name='purchaseHr']").value;
    if (selectMo === "default" || selectDy === "default" || selectHr == "default") {
      selectHr = "";

    } else {
      selectHr = "T" + selectHr + ":";
    }

    let tempTime = selectYr + selectMo + selectDy + selectHr;
    let tempPurchaseLog = [];
    let tempTimeSelected = [];

    //START CLIENT SIDE GET PURCHASE LOG DATA BASE ON TIME SELECTED
    axios.get("/api/purchaseLog/ordersFrom/" + tempTime, config).then(
      (res) => {
        setTimeSelected((timeSelected) => res.data);
      }, (error) => {
        showAlert("That did not work.", "danger");
      }
    )

  }


  //CLIENT SIDE GET ALL ITEMS
  const GrabAllItems = (token) => {
    axios.get("/api/items/all-items/",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ` + token
        }
      }

    ).then(
      (res) => {
        if (res.data.success === 0) {
          showAlert("That didn't work: " + res.data.message, "danger");
        } else {
          setItems((items) => res.data);
        }

      }, (error) => {
        showAlert("That didn't work: " + error, "danger");
      }
    )
  }


  //CLIENT SIDE VALIDATE USER
  const validateUser = (success, token, email, msg) => {
    if (success === 1) {
      setIsValidUser((isValidUser) => true);
      setToken((token) => token);
      sessionStorage.setItem("token", token);
      setCheckedToken((setCheckedToken) => true);
      setUserEmail((userEmail) => email);
      sessionStorage.setItem("email", email);
      GrabAllItems(token);

    } else {
      console.log("Validate user success 0 here!");
      setIsValidUser((isValidUser) => false);
      setToken((token) => token);
      sessionStorage.removeItem("token");
      setUserEmail((userEmail) => null);
      showAlert("That didn't work: " + msg, "danger");
    }

  }


  //CLIENT SIDE CREAT USER
  const createUser = () => {
    const email = localStorage.getItem("email");
    const password = localStorage.getItem("password");
    const level = document.querySelector("select[name='level']").value;

    axios.post("/newUser",
      { "email": email, "level": level, "password": password },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }).then(
        (res) => {
          if (res.data.success !== 0) {
            setNewUser((newUser) => false);
            if (document.querySelector("button.ckValidate")) {
              document.querySelector("button.ckValidate").classList.remove("hide");
            }
            showAlert(email + " has been added", "success");
            localStorage.removeItem("email");

          } else {
            showAlert("That didn't work: " + res.data.message, "danger");
          }

        }, (error) => {
          showAlert("That didn't work: " + error, "danger");
        }
      )
  }


  //CLIENT SIDE START LOGIN 
  const login = () => {
    setUserEmail((userEmail) => null);
    Validate(["email", "password"]);

    if (document.querySelector(".error")) {
      showAlert("There is an error in your form.", "danger");
      return false
    } else {
      const email = document.querySelector("input[name='email']").value.toLowerCase();
      const password = document.querySelector("input[name='password']").value;

      axios.post("/login", { email, password }, {
        headers: {
          "Content-Type": "application/json"
        }
      }).then(
        (res) => {
          if (res.data.success === 1) {
            showAlert(email + " logged in.", "success");
            validateUser(res.data.success, res.data.token, email, "logged in");
            localStorage.removeItem("password");
          } else {
            showAlert("That didn't work: " + res.data.succes, "danger")
          }
        },
        (error) => {
          showAlert("That didn't work: " + error, "danger");
        }
      )

    }
  }


  //CLIENT SIDE START LOG OUT
  const logout = () => {
    setIsValidUser((isValidUser) => false);
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("token");

    axios.put("/logout-uuid", {
      email: userEmail,
      uuid: "logged-out" + uuid()
    }).then(
      (res) => {
        console.log("logged out");
      }, (error) => {
        showAlert("Something happend while logging out: " + error, "danger");
      })

  }



  //START REFRESH
  useEffect(() => {
    if (localStorage.getItem("activeModule")) {
      setActiveModule((activeModule) => localStorage.getItem("activeModule"));
    }
    if (sessionStorage.getItem("token") && checkedToken === false) {
      axios.get("/check-token/" + sessionStorage.getItem("email"), config).then(
        (res) => {
          try {
            if (sessionStorage.getItem("token") === res.data[0].token) {
              validateUser(1, res.data[0].token, sessionStorage.getItem("email"), "token success");
            }
          } catch (error) {
            console.log("error: " + error);
            return false
          }
        }, (error) => {
          showAlert("That token request didn't work: " + error, "danger");
          logout();

        }

      )
    }
  });




  return (
    <React.Fragment>
      {alert !== "default" ?
        <div className={"alert alert-" + alertType + " animated fadeInDown"} role="alert">{alert}</div>
        : null}
      {isValidUser === false ?
        <Login setNewUser={setNewUser} newUser={newUser} login={login} createUser={createUser} />
        :
        <React.Fragment>
          <Nav setActiveModule={setActiveModule} activeModule={activeModule} userEmail={userEmail} />
          <div className="container my-5">
            {activeModule === "cms" ? <CMS showAlert={showAlert} config={config} items={items} setItems={setItems} /> : null}
            {activeModule === "cart" ? <Cart showAlert={showAlert} userEmail={userEmail} config={config} items={items} /> : null}
            {activeModule === "log" || activeModule === "analytics" ? <TimeSelector timeSearch={timeSearch} year={year} month={month} /> : null}
            {activeModule === "log" ? <PurchaseLog timeSelected={timeSelected} /> : null}
            {activeModule === "analytics" ? <PurchasingChart timeSelected={timeSelected} items={items} /> : null}
          </div>
          <footer className="footer mt-auto py-3 px-3 bg-dark text-muted">
            <div className="row">
              <div className="col-md-3">
                {infoMessage === "account-settings" ?
                  <a href="#settingsPanel" className="btn btn-secondary" onClick={() => setInfoMessage((infoMessage) => "")} >{userEmail} <i className="fas fa-cog"></i></a> :
                  <a href="#settingsPanel" className="btn btn-secondary" onClick={() => setInfoMessage((infoMessage) => "account-settings")} >{userEmail} <i className="fas fa-cog"></i></a>}
                {infoMessage === "account-settings" ?
                  <div id="settingsPanel" className="py-2">
                    <label>Settings: </label>
                    <ul className="list-unstyled">
                      <li>
                        <ChangePassword showAlert={showAlert} config={config} />
                      </li>
                      <li>
                        <DeleteUser validateUser={validateUser} config={config} userEmail={userEmail} logout={logout} showAlert={showAlert} infoMessage={infoMessage} />
                      </li>
                    </ul>
                  </div>
                  : null}
              </div>

              <div className="col-md-7"></div>


              <div className="col-md-2">
                <button className="btn btn-block btn-danger" onClick={() => logout()}>Logout</button>
              </div>
            </div>
          </footer>
        </React.Fragment>
      }
    </React.Fragment>
  );

}

export default App;
