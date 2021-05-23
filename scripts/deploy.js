const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {

    const [owner] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", owner.address);
    console.log(`Owner [${owner.address}] Balance:`, ethers.utils.formatEther(await owner.getBalance()).toString());

    const TachyonFactory = await ethers.getContractFactory("Tachyon");
    const Tachyon = await TachyonFactory.deploy();

    await Tachyon.storeFile('QmdEtRcb1rUvmQsbFcByo3orf9pMxC2sp3ejUX9mTnVYws');

    let net = hre.network.config.chainId.toString();

    console.log(JSON.stringify({
        [net]: {
            "Tachyon": Tachyon.address,
        }
    }, null, 2));

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
