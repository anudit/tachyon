// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract TachyonMeta {
    struct EIP712Domain {
        string name;
        string version;
        uint256 chainId;
        address verifyingContract;
    }

    struct MetaTransaction {
        uint256 nonce;
        address from;
    }

    mapping(address => uint256) public nonces;
    bytes32 internal constant EIP712_DOMAIN_TYPEHASH = keccak256(bytes("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"));
    bytes32 internal constant META_TRANSACTION_TYPEHASH = keccak256(bytes("MetaTransaction(uint256 nonce,address from)"));
    bytes32 internal DOMAIN_SEPARATOR = keccak256(abi.encode(
        EIP712_DOMAIN_TYPEHASH,
    		keccak256(bytes("Tachyon")),
    		keccak256(bytes("1")),
    		80001,
    		address(this)
    ));
}

contract Tachyon is TachyonMeta {

    mapping (address => string[]) public files;
    mapping (address => mapping (address => bool)) public authorized;

    event newFile(address indexed user, string indexed fileHashRaw, string fileHash);
    event updateAccess(uint256 indexed userFrom, uint256 indexed userTo);

    constructor() {}

    function storeFile(string memory _fileHash)
        public
    {
        files[msg.sender].push(_fileHash);
        emit newFile(msg.sender, _fileHash, _fileHash);
    }

    function storeFileMeta(
        bytes32 r, bytes32 s, uint8 v, string memory _fileHash
    )
        public
    {
        MetaTransaction memory metaTx = MetaTransaction({
            nonce: nonces[msg.sender],
            from: msg.sender
        });

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(META_TRANSACTION_TYPEHASH, metaTx.nonce, metaTx.from))
            )
        );

        require(msg.sender != address(0), "invalid-address-0");

        address recoveredAddress = ecrecover(digest, v, r, s);

        files[recoveredAddress].push(_fileHash);
        emit newFile(recoveredAddress, _fileHash, _fileHash);
    }

    function toggleAccess(address from, address to)
        public
    {
        authorized[from][to] = !authorized[from][to];
    }

    function getFile(address user)
        public view
        returns(string[] memory)
    {
        require(authorized[user][msg.sender] == true, "Unauthorized");
        return files[user];
    }

    function getFileCnt(address user)
        public view
        returns(uint256)
    {
        return files[user].length;
    }

}
