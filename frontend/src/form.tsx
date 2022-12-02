import { useEffect, useState } from "react";
import InputField from "./components/form/InputField";
import axios from "axios";

export default function Form() {
  const [walletOne, setWalletOne]: any = useState("");
  const [walletTwo, setWalletTwo]: any = useState("");
  const [balanceOne, setBalanceOne]: any = useState(0);
  const [balanceTwo, setBalanceTwo]: any = useState(0);
  const [walletOnePublicKey, setWalletOnePublicKey]: any = useState("");
  const [walletTwoPublicKey, setWalletTwoPublicKey]: any = useState("");
  const [showWalletOneKeys, setShowWalletOneKeys]: any = useState(false);
  const [showWalletTwoKeys, setShowWalletTwoKeys]: any = useState(false);

  const handleForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const wallet = await axios.get("http://167.235.235.198:3000/new_wallet");
    setWalletOne(wallet.data);
    setWalletOnePublicKey(wallet.data.publicKey);

    setBalanceOne(await getBalance(wallet.data));
  };

  const handleFormTwo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const wallet = await axios.get("http://167.235.235.198:3000/new_wallet");
    setWalletTwo(wallet.data);
    setWalletTwoPublicKey(wallet.data.publicKey);

    setBalanceTwo(await getBalance(wallet.data));
  };

  const sendOne = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values: any = e.target;
    await fetch("http://167.235.235.198:3000/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payer: walletOne,
        payee: values.payee.value,
        amount: values.amount.value,
      }),
    });

    setBalanceOne(await getBalance(walletOne));
    setBalanceTwo(await getBalance(walletTwo));
  };

  const sendTwo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values: any = e.target;
    await fetch("http://167.235.235.198:3000/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payer: walletTwo,
        payee: values.payee.value,
        amount: values.amount.value,
      }),
    });

    setBalanceOne(await getBalance(walletOne));
    setBalanceTwo(await getBalance(walletTwo));
  };

  const getBalance = async (wallet: any) => {
    const balance = await fetch("http://167.235.235.198:3000/balance", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        wallet: JSON.stringify(wallet),
      },
    });
    return await balance.text();
  };

  return (
    <div className="w-[60%] text-center">

      <form onSubmit={handleForm} className="grid place-items-center">
        <button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          {walletOne ? "Neue Wallet 1 erstellen" : "Wallet 1 erstellen"}
        </button>
      </form>

      {walletOne && (
        <>
          {/* show key if a button is pressed */}
          <button
            className="my-8 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => setShowWalletOneKeys(!showWalletOneKeys)}
          >
            Keys zeigen
          </button>
          {showWalletOneKeys && (
            <div className="grid place-items-center text-center mb-5">
              <p className="text-sm my-2">Public Key:</p>
              <pre className="text-sm">{walletOne.publicKey}</pre>
              <p className="text-sm my-2">Private Key:</p>
              <pre className="text-sm">{walletOne.privateKey}</pre>
            </div>
          )}

          <p>Wallet Coins: {balanceOne}</p>

          <h2 className="mt-12">Coins versenden</h2>
          <form
            onSubmit={sendOne}
            className="grid place-items-center mt-8 mb-20"
          >
            <label
              className={`block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300`}
            >
              <p>Payee Public Key</p>
              <textarea
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                rows={4}
                cols={50}
                id="payee"
                required
                value={walletTwoPublicKey}
                onChange={(e) => setWalletTwoPublicKey(e.target.value)}
              />
            </label>
            <label
              className={`block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300`}
            >
              <p>Menge</p>
              <input
                type="number"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                id="amount"
                required
              />
            </label>
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Versenden
            </button>
          </form>
        </>
      )}

      <form onSubmit={handleFormTwo} className="grid place-items-center mt-8">
        <button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          {walletTwo ? "Neue Wallet 2 erstellen" : "Wallet 2 erstellen"}
        </button>
      </form>

      {walletTwo && (
        <>
          {/* show key if a button is pressed */}
          <button
            className="my-8 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => setShowWalletTwoKeys(!showWalletTwoKeys)}
          >
            Keys zeigen
          </button>
          {showWalletTwoKeys && (
            <div className="grid place-items-center text-center mb-5">
              <p className="text-sm my-2">Public Key:</p>
              <pre className="text-sm">{walletTwo.publicKey}</pre>
              <p className="text-sm my-2">Private Key:</p>
              <pre className="text-sm">{walletTwo.privateKey}</pre>
            </div>
          )}

          <p>Coins: {balanceTwo}</p>

          <h2 className="mt-12">Coins versenden</h2>
          <form
            onSubmit={sendTwo}
            className="grid place-items-center mt-8 mb-20"
          >
            <label
              className={`block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300`}
            >
              <p>Payee Public Key</p>
              <textarea
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                rows={4}
                cols={50}
                id="payee"
                required
                value={walletOnePublicKey}
                onChange={(e) => setWalletOnePublicKey(e.target.value)}
              />
            </label>
            <label
              className={`block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300`}
            >
              <p>Menge</p>
              <input
                type="number"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                id="amount"
                required
              />
            </label>
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Versenden
            </button>
          </form>
        </>
      )}
    </div>
  );
}
