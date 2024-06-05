import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "../Styles/TwitterLogin.css";
import Loading from "./loading";

const Withdraw = (data) => {
  const [Tip, setTip] = useState(null);
  const [signer, setSigner] = useState(null);
  const Username = data["data"]["Username"];
  const currentProvider = data["data"]["networkProvider"];
  const [loading, setLoading] = useState(false);
  const [TxHash, setTxHash] = useState("");
  const [Explorer, setExplorer] = useState("");
  const Key = process.env.REACT_APP_HASH;

  const networkParams = {
    "Meter Testnet": {
      chainId: "0x53",
      chain: "83",
      chainName: "Meter Testnet",
      rpcUrls: ["https://rpctest.meter.io/"],
      nativeCurrency: { name: "Meter", symbol: "MTR", decimals: 18 },
      blockExplorerUrls: ["https://scan-warringstakes.meter.io/tx/"],
      contractAddress: "0x25c1251aD34194938558F738611258c052E8ACb1",
    },
  };

  const ContractAdd = networkParams[currentProvider].contractAddress;

  const switchNetwork = async () => {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: networkParams[currentProvider].chainId }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [networkParams[currentProvider]],
          });
        } catch (addError) {
          console.error(addError);
        }
      } else {
        console.error(switchError);
      }
      if(switchError.message){
        alert("Something Went wrong, Please try again.");
        window.location.reload();
      }
    }
  };

  const paytip = async () => {
    try {
      switchNetwork();
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const sign = await provider.getSigner();
      setSigner(sign);
      const contractAddress = ContractAdd;
      const contractABI = [
        "function ammountOfTip(string memory username) public view returns (uint256)",
      ];

      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      setExplorer(networkParams[currentProvider].blockExplorerUrls);
      const tx = await contract.ammountOfTip(Username);
      setTip(tx.toString());
    } catch (err) {
      console.log(err);
      if(err.message.includes("User denied account authorization")){
        alert("Please connect your wallet first.");
        window.location.reload();
      }
    }
  };

  const withdraw = async () => {
    try{
    switchNetwork();
    const contractAddress = ContractAdd;
    const withdrawABI = ["function withdraw(string memory username, string memory Key) public"];
    const contract = new ethers.Contract(contractAddress, withdrawABI, signer);
    setLoading(true);
    const tx = await contract.withdraw(Username, Key);
    tx.wait().then((receipt) => {
      console.log("Withdrawn");
      console.log(receipt["hash"]);
      setLoading(false);
      console.log(loading);
      window.location.reload();
      setTxHash(tx.hash);
      handleRefresh();
    });
    // console.log(tx);
  } catch (err){
    console.log(err);
    if(err.message.includes("User denied transaction signature")){
      alert("Please confirm the transaction to withdraw the tips");
      window.location.reload();
    }
    
    if(err.message.includes("No tips available to withdraw")){
      alert("Sadly! You don't have any tips.");
      window.location.reload();
    }else if(err.message){
      alert("Something Went wrong, Please try again.");
      window.location.reload();
    }
  }
  };

  useEffect(() => {
    paytip();
  });

  useEffect(() => {
    setTimeout(() => {
      setTxHash(null);
    }, 10000);
  }, [TxHash]);

  const handleRefresh = () => {
    setTip(null);
    setLoading(true);
    setTimeout(() => {}, 10000);
    paytip();
  };

  const HashLink = (hash) => {
    if(Explorer && hash)
    var link = Explorer + hash;
    return link;
  }

  return (
    <div className="Withdraw">
      {Tip && !loading ? (
        <div className="withdraw-block">
          <div className="balance">
            {loading && <Loading />}
            <p>You have {ethers.formatEther(Tip.toString())} tips!</p>
            <button className="refresh" onClick={handleRefresh}>
              Refresh
            </button>
          </div>
        {TxHash && <span>Tip Sent Successfully: <a href={HashLink(TxHash)} target="blank">View On Explorer!</a></span>}
          <div className="withdraw-btns">
            <button onClick={withdraw} className="twitter-withdraw-btn">
              Withdraw
            </button>
          </div>
        </div>
      ) : (
        <div className="loading">
          <Loading />
        </div>
      )}
    </div>
  );
};

export default Withdraw;
