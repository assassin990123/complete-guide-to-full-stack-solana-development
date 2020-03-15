const html = `<p>Libraries are similar to contracts, but you can&#39;t declare any state variable and
you can&#39;t send ether.</p>
<p>A library is embedded into the contract if all library functions are internal.</p>
<p>Otherwise the library must be deployed and then linked before the contract is deployed.</p>
<pre><code class="language-solidity">pragma solidity ^0.5.16;

library SafeMath {
    function add(uint x, uint y) internal pure returns (uint) {
        uint z = x + y;
        require(z &gt;= x, "uint overflow");

        return z;
    }
}

contract TestSafeMath {
    using SafeMath for uint;

    uint public MAX_UINT = 2 ** 256 - 1;

    function testAdd(uint x, uint y) public pure returns (uint) {
        return x.add(y);
    }
}

// Array function to delete element at index and re-organize the array
// so that their are no gaps between the elements.
library Array {
    function remove(uint[] storage arr, uint index) public {
        // Move the last element into the place to delete
        arr[index] = arr[arr.length - 1];
        arr.pop();
    }
}

contract TestArray {
    using Array for uint[];

    uint[] public arr;

    function testArrayRemove() public {
        for (uint i = 0; i &lt; 3; i++) {
            arr.push(i);
        }

        arr.remove(1);

        assert(arr.length == 2);
        assert(arr[0] == 0);
        assert(arr[1] == 2);
    }
}
</code></pre>
`

export default html
