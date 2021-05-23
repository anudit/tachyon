const { expect } = require("chai");
const hre = require("hardhat");

describe("Tachyon", accounts => {

    let Tachyon;
    let owner, alice, bob, addrs;

    beforeEach(async function () {
        [owner, alice, bob, ...addrs] = await ethers.getSigners();

        const TachyonFactory = await ethers.getContractFactory("Tachyon");
        Tachyon = await TachyonFactory.deploy();

    });


    describe("Tachyon Tests", accounts => {

        it("Should deploy contracts", async function () {
            expect(true).to.equal(true);
        });

        it("Should store File", async () => {
            expect(await Tachyon.getFileCnt(owner.address)).to.equal('0');
            await Tachyon.storeFile('QmdEtRcb1rUvmQsbFcByo3orf9pMxC2sp3ejUX9mTnVYws');
            expect(await Tachyon.getFileCnt(owner.address)).to.equal('1');
        });

        it("Should share File from Sender", async () => {
            await Tachyon.storeFile('QmdEtRcb1rUvmQsbFcByo3orf9pMxC2sp3ejUX9mTnVYws');

            expect(await Tachyon.authorized(owner.address, alice.address)).to.equal(false);
            await Tachyon.toggleAccess(owner.address, alice.address);
            expect(await Tachyon.authorized(owner.address, alice.address)).to.equal(true);
        });

        it("Should get File from Receiver", async () => {
            await Tachyon.storeFile('QmdEtRcb1rUvmQsbFcByo3orf9pMxC2sp3ejUX9mTnVYws');

            expect(await Tachyon.authorized(owner.address, alice.address)).to.equal(false);
            await Tachyon.toggleAccess(owner.address, alice.address);
            expect(await Tachyon.authorized(owner.address, alice.address)).to.equal(true);

            await Tachyon.connect(alice.address).getFile(owner.address);
        });

        it("Should get File Count", async () => {
            await Tachyon.storeFile('QmdEtRcb1rUvmQsbFcByo3orf9pMxC2sp3ejUX9mTnVYws');
            expect(await Tachyon.getFileCnt(owner.address)).to.equal('1');
        });
    });

});
