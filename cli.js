#!/usr/bin/env node

const { ArgumentParser } = require('argparse');
const { version } = require('./package.json');
const ethers = require('ethers');
const { create } = require('ipfs-http-client')
const fs = require('fs');
const path = require('path');
require('dotenv').config()

// Constants
const mnemonic = process.env.MNEMONIC;
const tachyon_abi = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "string",
          "name": "fileHashRaw",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "fileHash",
          "type": "string"
        }
      ],
      "name": "newFile",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "userFrom",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "userTo",
          "type": "uint256"
        }
      ],
      "name": "updateAccess",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "authorized",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "files",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getFile",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getFileCnt",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "nonces",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_fileHash",
          "type": "string"
        }
      ],
      "name": "storeFile",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "r",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "s",
          "type": "bytes32"
        },
        {
          "internalType": "uint8",
          "name": "v",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "_fileHash",
          "type": "string"
        }
      ],
      "name": "storeFileMeta",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        }
      ],
      "name": "toggleAccess",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
];

const tachyon_address = "0x4e6FE7f1A372B94B3Fcb6a02C524C2f8eecF796c";
let wallet  = ethers.Wallet.fromMnemonic(mnemonic);
let provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com/v1/36aed576f085dcef42748c474a02b1c51db45c86");
let signer = wallet.connect(provider);
let Tachyon = new ethers.Contract(tachyon_address, tachyon_abi, signer);
let address = signer.getAddress();


// Parse Arguments
const parser = new ArgumentParser({
  description: 'Tachyon',
  add_help: true
});

parser.add_argument('-v', '--version', { help: 'Print Version of Tachyon', action: 'version', version });
parser.add_argument('-c', '--count', { help: 'Get the number of files you have on Tachyon',  action: 'store_true' });
parser.add_argument('-l', '--list', { help: 'List the files you have on Tachyon',  action: 'store_true' });
parser.add_argument('-s', '--store', { help: 'Store a file on Tachyon'});
parser.add_argument('-a', '--auth', { help: 'Authorize an address to acess your files on Tachyon'});

const args = parser.parse_args();

// Check Which function to run

if (args['count'] === true){

  async function fileCount(){

    let count = await Tachyon.getFileCnt(address);
    console.log(`📂 You have ${count} Files stored on Tachyon.`);
  }

  fileCount()
      .then(() => process.exit(0))
      .catch(error => {
          console.error("🚨 Looks Like we ran into an Error");
          console.error(error);
          process.exit(1);
      });

}
else if (args['list'] === true){

  async function listFiles(){

    let cnt = await Tachyon.getFileCnt(address);

    for (let index = 0; index < cnt; index++) {
      let file = await Tachyon.files(address, index);
      console.log(`📦 https://gateway.ipfs.io/ipfs/${file}`);
    }
  }

  listFiles()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("🚨 Looks Like we ran into an Error");
        console.error(error);
        process.exit(1);
    });

}
else if (Boolean(args['store']) === true){

  async function uploadFile(ipfsInstance, file) {
    return new Promise((resolve, reject) => {
      fs.readFile(file, 'utf8', function(err, data){
        if (!err){
          const buffer = Buffer.from(data);
          ipfsInstance.add(buffer)
          .then(files => {
            resolve(files)
          })
          .catch(error => reject(error))
        }
        else {
          reject(data);
        }
      });
    })
  }

  async function storeFile(){

    console.log(`🌐 Connecting to an IPFS node.`);
    const ipfs = create('https://ipfs.infura.io:5001');

    console.log(`⬆️  Uploading File.`);
    const { path } = await uploadFile(ipfs, args['store']);

    console.log(`🔗 Storing on the Blockchain`);
    let res = await Tachyon.storeFile(path);

    console.log(`✅ Your file is on it's way! https://explorer-mumbai.maticvigil.com/tx/${res['hash']}`);
    console.log(`✅ All done, https://gateway.ipfs.io/ipfs/${path}`);

  }

  storeFile()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("🚨 Looks Like we ran into an Error");
        console.error(error);
        process.exit(1);
    });

}
else if (Boolean(args['auth']) === true){

  async function authUser(){

    console.log(`🔗 Authorizing the address on the Blockchain`);

    if (ethers.utils.isAddress(args['auth']) === true) {
      let res = await Tachyon.toggleAccess(address, alice.address);
      console.log(`✅ All done, https://explorer-mumbai.maticvigil.com/tx/${res['hash']}`);
    }
    else {
      console.log(`⚠️ Whoops, that's an Invalid Ethereum Address`);
    }

  }

  authUser()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("🚨 Looks Like we ran into an Error");
        console.error(error);
        process.exit(1);
    });

}
