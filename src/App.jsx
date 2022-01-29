import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';

import kp from './keypair.json';

import idl from './idl.json';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed"
}






// Constants Here
const TWITTER_HANDLE = 'Professor_dread';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TEST_GIFS = [
  'https://media2.giphy.com/media/1F1p6zXsYyt8I/giphy.gif?cid=ecf05e47rr3u38pj5wnow0g27rmgc11cs8c1gfblhieyyt2k&rid=giphy.gif&ct=g', 
  'https://media3.giphy.com/media/nrAGuHZEMyqc0/200.webp?cid=ecf05e47s3s9aunkpx4vhra2zchzuuipcsoq31hotizu2qur&rid=200.webp&ct=g',
  'https://media2.giphy.com/media/NyMSZsWepPCQo/200.webp?cid=ecf05e47387maadeqg9v719a6ea3j7mudcld5xl9agyq3jri&rid=200.webp&ct=g',
  'https://media0.giphy.com/media/qCZi0IuY2Je8w/200.webp?cid=ecf05e47x7rkp77ehuc58qn1v7m5ekqac48ain4sk6c3i047&rid=200.webp&ct=g'
]

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [gifList, setGifList] = useState([]);
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom){
          console.log('Phantom wallet found!');
          const response = await solana.connect({ onlyIfTrusted: true});
          console.log('Connected with Public Key:', response.publicKey.toString());
          setWalletAddress(response.publicKey.toString());
        }
      } else{
        alert('Solana object not found! Get a Phantom Wallet');
      }
    } catch (error) {
      console.error(error);
    }
  };
  const connectWallet = async () => {
    const { solana } = window;

    if  (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
          setWalletAddress(response.publicKey.toString());
    }
  };

  const sendGif = async () => {
    if(inputValue.length === 0) {
      console.log("No gif link given!")
      return
    }
    setInputValue('');
    console.log('Gif link:', inputValue);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("GIF successfully sent to program", inputValue)
      
      await getGifList();
    } catch (error){
      console.log("Error sending GIF:", error)
    }
  };

  const onInputChange = (event) => {
    const {value} = event.target;
    setInputValue(value);
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }

  const createGifAccount = async () => {
  try {
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    console.log("ping")
    await program.rpc.startStuffOff({
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount]
    });
    console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
    await getGifList();

  } catch(error) {
    console.log("Error creating BaseAccount account:", error)
  }
}
 

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
      >
      Connect to Wallet
      </button>
  );
  const renderConnectedContainer = () => {
// If we hit this, it means the program account hasn't been initialized.
  if (gifList === null) {
    return (
      <div className="connected-container">
        <button className="cta-button submit-gif-button" onClick={createGifAccount}>
          Do One-Time Initialization For GIF Program Account
        </button>
      </div>
    )
  } 
	// Otherwise, we're good! Account exists. User can submit GIFs.
	else {
    return(
      <div className="connected-container">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendGif();
          }}
        >
          <input
            type="text"
            placeholder="Enter gif link!"
            value={inputValue}
            onChange={onInputChange}
          />
          <button type="submit" className="cta-button submit-gif-button">
            Submit
          </button>
        </form>
        <div className="gif-grid">
					{/* We use index as the key instead, also, the src is now item.gifLink */}
          {gifList.map((item, index) => (
            <div className="gif-item" key={index}>
              <img src={item.gifLink} />
              <p className="footer-text"> {item.userAddress.toString()}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }
}
  

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  const getGifList = async() => {
  try {
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    
    console.log("Got the account", account)
    setGifList(account.gifList)

  } catch (error) {
    console.log("Error in getGifList: ", error)
    setGifList(null);
  }
}

useEffect(() => {
  if (walletAddress) {
    console.log('Fetching GIF list...');
    getGifList()
  }
}, [walletAddress]);

  return (
    <div className="App">
    <div className={walletAddress ? 'authed-container': 'container'}>
      <div className="header-container">
          <p className="header">KOTH GIF Portal</p>
          <p className="sub-text">
            View the best King of the Hill GIF collection in the metaverse ✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>

        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`Find Me @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
