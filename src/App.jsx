import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

// Constants
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
    if(inputValue.length > 0) {
      console.log('Gif link:', inputValue);
      setGifList([...gifList, inputValue]);
      setInputValue('');
    } else {
      console.log('Empty input. Try again.');
    }
  };

  const onInputChange = (event) => {
    const {value} = event.target;
    setInputValue(value);
  };

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
      >
      Connect to Wallet
      </button>
  );
  const renderConnectedContainer = () => (
    <div className="connected-container">
      <form
        onSubmit={(event) => {
            event.preventDefault();
            sendGif();
        }}
        >
        <input type="text" placeholder="Enter gif link!"
        value={inputValue}
        onChange={onInputChange} />
        <button type="submit" className="cta-button submit-gif-button">Submit</button>
      </form>
      <div className="gif-grid">
        {gifList.map(gif => (
          <div className="gif-item" key={gif}>
            <img src={gif} alt={gif} />
            </div>
        ))}
      </div>
    </div>
  );
  

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list');
      //Call solana program here.

      //Set State
      setGifList(TEST_GIFS);
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
