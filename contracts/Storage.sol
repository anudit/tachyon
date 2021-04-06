// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import '@openzeppelin/contracts/access/Ownable.sol'

contract Storage is Ownable {

    struct DocumentData{
        bytes32 filename;
        bytes32 file_hash;
        uint256 dateAdded;
        address user;
    }

    struct UserData{
        address user_addr;
    }

    mapping(address=>DocumentData) public documents;
    address[] public documentsArray;
    uint256 public document_length;

    function add() public {

    }


}
