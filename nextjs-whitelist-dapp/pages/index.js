import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [numOfWhitelisted, setNumOfWhitelisted] = useState(0);
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  const [loading, setLoading] = useState(false);
  const web3ModalRef = useRef();

  const getProviderOrSigner = async (needSigner = false) => {
    try {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      const { chainId } = await web3Provider.getNetwork();
      if (chainId !== 5) {
        window.alert("Change the network to Goerli");
        throw new Error("Change the network to Goerli");
      }
      if (needSigner) {
        const signer = await web3Provider.getSigner();
        return signer;
      }
      return web3Provider;
    } catch (error) {
      console.error(error);
    }
  };

  const addAddressToWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true);
      await tx.wait(1);
      setLoading(false);
      setJoinedWhitelist(true);
    } catch (error) {
      console.error(error);
    }
  };

  const checkIfAddressIsWhitelisted = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );

      const address = await signer.getAddress();
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
        address
      );
      setJoinedWhitelist(_joinedWhitelist);
    } catch (error) {
      console.error(error);
    }
  };

  const getNumberOfWhitelisted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const _numWhitelisted = await whitelistContract.numAddressesWhitelisted();
      setNumOfWhitelisted(_numWhitelisted);
    } catch (error) {
      console.error(error);
    }
  };

  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className={styles.description}>
            Thanks for joining the Whitelist!
          </div>
        );
      } else {
        return (
          <div>
            <button onClick={addAddressToWhitelist} className={styles.button}>
              Join the Whitelist
            </button>
          </div>
        );
      }
    } else if (loading) {
      return <button className={styles.button}>Loading...</button>;
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
      checkIfAddressIsWhitelisted();
      getNumberOfWhitelisted();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title> Whitelist dApp </title>
        <meta name="desciption" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}> Welcome to Crypto Devs! </h1>
          <div className={styles.description}>
            {numOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>

      <footer className={styles.footer}>Made with ❤️ by Crypto Devs</footer>
    </div>
  );
}
