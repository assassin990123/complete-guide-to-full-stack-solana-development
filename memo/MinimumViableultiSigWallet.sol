pragma solidity ^0.5.11;
pragma experimental ABIEncoderV2;

// TODO copy paste ECDSA contract here?
import "github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v2.5.0/contracts/cryptography/ECDSA.sol";

contract MinimumViableMultiSigWallet {
    using ECDSA for bytes32;

    address[] public owners;
    mapping(bytes32 => bool) isExecuted;

    // NOTE: N / N multisig wallet (does not check if owners are unique)
    constructor(address[] memory _owners) public payable {
        require(owners.length > 0, "Owners required");
        owners = _owners;
    }

    function () external payable {}

    function getTransactionHash(
        address _to,
        uint _value,
        bytes memory _data
    )
        public
        view
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(
            address(this),
            owners,
            _to,
            _value,
            _data
        ));
    }

    // TODO example (send / withdraw ether and call other contract)
    function executeTransaction(
        address _to,
        uint _value,
        bytes memory _data,
        bytes[] memory _signatures
    )
        public
    {
        bytes32 transactionHash = getTransactionHash(_to, _value, _data);

        // NOTE: this guards against re-entrancy
        require(!isExecuted[transactionHash], "Transaction has already been executed");
        isExecuted[transactionHash] = true;

        for (uint i = 0; i < owners.length; i++) {
            require(
                owners[i] == transactionHash.recover(_signatures[i]),
                "Invalid signature"
            );
        }

        // NOTE: _to does not need to be payable even if we send Ether
        (bool success,) = _to.call.value(_value)(_data);
        require(success, "Transaction failed");
        // execute(_to, _value, _data);
    }

    function execute(address _to, uint _value, bytes memory _data) internal {
        bool success;

        /*
        call(g, a, v, in, insize, out, outsize)
        g - gas to forward
        a - address to be called
        v - amount of Ether to transfer (wei)
        in - memory position of insize bytes where call data is stored
        insize - size of bytes of calldata
        out - where return data will be stored
        outsize - size of return data

        call contract at address a with
        input mem[in…(in+insize))
        providing g gas and v wei
        and output area mem[out…(out+outsize))
        returning 0 on error (eg. out of gas) and 1 on success

        https://ethereum.stackexchange.com/questions/6354/how-do-i-construct-a-call-to-another-contract-using-inline-assembly
        */

        /*
        add(_data, 0x20)

        The first 32 bytes of the dynamically-sized byte array bytes contain the length of the bytes instance.
        So when we say add(data, 32), what we do is adding 32 to the pointer that points
        toward the memory address of our data variable. This essentially means: skip the first 32 bytes.

        // TODO add example
        */

        /*
        mload(_data)

        mload(0x40)  Allocate memory for output (0x40 is where "free memory" pointer is stored by convention)
        mload(_data) loads the length (first 32 bytes)

        https://ethereum.stackexchange.com/questions/9603/understanding-mload-assembly-function

        TODO: mload example
        */

        // NOTE: equivalent to _to.call.value(_value)(_data)
        assembly {
            success := call(gas, _to, _value, add(_data, 0x20), mload(_data), mload(0x40), 0)
        }

        require(success, "Transaction failed");
    }
}
