// require("hardhat-deploy")
// require("hardhat-deploy-ethers")

// const { networkConfig } = require("../helper-hardhat-config")


// const private_key = network.config.accounts[0]
// const wallet = new ethers.Wallet(private_key, ethers.provider)

// module.exports = async ({ deployments }) => {
//     console.log("Wallet Ethereum Address:", wallet.address)
    
//     //deploy DealClient
//     const DealClient = await ethers.getContractFactory('DealClient', wallet);
//     console.log('Deploying DealClient...');
//     const dc = await DealClient.deploy();
//     await dc.deployed()
//     console.log('DealClient deployed to:', dc.address);
// }


require("hardhat-deploy")
require("hardhat-deploy-ethers")

const { networkConfig } = require("../helper-hardhat-config")


const private_key = network.config.accounts[0]
const wallet = new ethers.Wallet(private_key, ethers.provider)


const ROUTER_ADDRESS = "0xdd6E85bC17cF6851A9919A19E5f354Af0D312A6B";

module.exports = async ({ deployments }) => {
    console.log("Wallet Ethereum Address:", wallet.address)

    const Token = await ethers.getContractFactory("JoyGotchiToken");
    const token = await Token.deploy(ROUTER_ADDRESS);
    await token.deployed();
    console.log("JoyGotchiToken:", token.address);

    const ModeNFT = await ethers.getContractFactory("JoyGotchiV2");
    const modeNFT = await ModeNFT.deploy(
        "0xa0AD79D995DdeeB18a14eAef56A549A04e3Aa1Bd", //token.address,
        "0xa0AD79D995DdeeB18a14eAef56A549A04e3Aa1Bd" //airnode rrp on lightlink testnet
    );
    await modeNFT.deployed();
    console.log("JoyGotchi:", modeNFT.address);

    const GameManager = await ethers.getContractFactory("GameManagerV2");
    const gameManager = await GameManager.deploy(modeNFT.address);
    await gameManager.deployed();
    console.log("GameManager:", gameManager.address);

    const GenePool = await ethers.getContractFactory("GenePool");
    const genePool = await GenePool.deploy(modeNFT.address, 2, 2, 2);
    await genePool.deployed();
    console.log("GenePool:", genePool.address);

    const Faucet = await ethers.getContractFactory("JoyGotchiFaucet");
    const faucet = await Faucet.deploy(token.address);
    await faucet.deployed();
    console.log("Faucet:", faucet.address);

    console.log("Settings");
    await modeNFT.setGameManager(gameManager.address);

    await modeNFT.setGenePool(genePool.address);

    await modeNFT.createSpecies(
        [
            [
                "https://bafkreid32fvsd54vejrhsp26zebufsdqnx7jjgtg7j5odp6vyc3b4joecm.ipfs.nftstorage.link/",
                "1",
                20,
                1,
            ],
            [
                "https://bafkreiapb7ryik6hqe3hj2sd5fjfsexfvuumyxf7jhlzhv64zjmvdp456q.ipfs.nftstorage.link/",
                "2",
                25,
                2,
            ],
            [
                "https://bafkreig77ufvn7jmr4macehsuww7lz5xflwyb2e75esli6sz5ywfxzhsha.ipfs.nftstorage.link/",
                "3",
                30,
                3,
            ],
        ],
        50,
        true,
        0,
        {
            skinColor: 2,
            hornStyle: 2,
            wingStyle: 2
        }
    );

    await token.transfer(faucet.address, ethers.parseEther("1000000"));
    await token.enableTrading();

    await token.approve(modeNFT.address, ethers.parseEther("1000000"));
    await modeNFT.mint();

    // enable trading

    console.log("Done");
}