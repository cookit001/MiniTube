// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MiniTubeSplitter
 * @dev Splits tips between the content creator and the MiniTube Treasury.
 * Enforces a strict mathematical 2.5% protocol fee on-chain.
 * Secure against reentrancy, fee-on-transfer tokens, and non-standard ERC20s.
 */

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

// Simple Reentrancy Guard
abstract contract ReentrancyGuard {
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != ENTERED, "ReentrancyGuard: reentrant call");
        _status = ENTERED;
        _;
        _status = NOT_ENTERED;
    }
}

contract MiniTubeSplitter is ReentrancyGuard {
    address public treasury;
    address public pendingTreasury;
    
    // Fee is 2.5% (represented in basis points: 250 / 10000)
    uint256 public constant FEE_BPS = 250;
    
    event TipSent(address indexed sender, address indexed creator, address token, uint256 totalAmount, uint256 feeAmount);
    event TreasuryTransferStarted(address indexed previousTreasury, address indexed newTreasury);
    event TreasuryTransferCompleted(address indexed previousTreasury, address indexed newTreasury);

    constructor(address _treasury) {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
    }

    /**
     * @dev Tip Native Currency (ETH / DEGEN)
     * @param creator The address of the content creator
     */
    function tipNative(address payable creator) external payable nonReentrant {
        require(msg.value > 0, "Must send value");
        require(creator != address(0), "Invalid creator address");
        
        // Mathematically enforce the 2.5% fee on-chain
        uint256 feeAmount = (msg.value * FEE_BPS) / 10000;
        uint256 creatorAmount = msg.value - feeAmount;

        // Send fee to treasury
        if (feeAmount > 0) {
            (bool feeSuccess, ) = treasury.call{value: feeAmount}("");
            require(feeSuccess, "Treasury transfer failed");
        }

        // Send rest to creator
        (bool creatorSuccess, ) = creator.call{value: creatorAmount}("");
        require(creatorSuccess, "Creator transfer failed");

        emit TipSent(msg.sender, creator, address(0), msg.value, feeAmount);
    }

    /**
     * @dev Tip ERC20 Token (USDC, DEGEN, USDT, etc.)
     * @param token The ERC20 token address
     * @param creator The address of the content creator
     * @param amount The total amount to tip
     */
    function tipERC20(IERC20 token, address creator, uint256 amount) external nonReentrant {
        require(amount > 0, "Must tip more than 0");
        require(creator != address(0), "Invalid creator address");

        // Measure actual tokens received (protects against fee-on-transfer tokens)
        uint256 balanceBefore = token.balanceOf(address(this));
        _safeTransferFrom(token, msg.sender, address(this), amount);
        uint256 actualReceived = token.balanceOf(address(this)) - balanceBefore;
        
        require(actualReceived > 0, "No tokens received");

        // Mathematically enforce the 2.5% fee on-chain
        uint256 feeAmount = (actualReceived * FEE_BPS) / 10000;
        uint256 creatorAmount = actualReceived - feeAmount;

        // Send fee to treasury
        if (feeAmount > 0) {
            _safeTransfer(token, treasury, feeAmount);
        }

        // Send rest to creator
        if (creatorAmount > 0) {
            _safeTransfer(token, creator, creatorAmount);
        }

        emit TipSent(msg.sender, creator, address(token), actualReceived, feeAmount);
    }

    // --- SafeERC20 Internal Helpers ---
    function _safeTransfer(IERC20 token, address to, uint256 value) internal {
        (bool success, bytes memory data) = address(token).call(abi.encodeWithSignature("transfer(address,uint256)", to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "SafeERC20: transfer failed");
    }

    function _safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        (bool success, bytes memory data) = address(token).call(abi.encodeWithSignature("transferFrom(address,address,uint256)", from, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "SafeERC20: transferFrom failed");
    }
    
    // --- Two-Step Treasury Ownership ---
    modifier onlyTreasury() {
        require(msg.sender == treasury, "Only treasury can call");
        _;
    }

    /**
     * @dev Step 1: Initiate treasury transfer
     */
    function transferTreasury(address _newTreasury) external onlyTreasury {
        require(_newTreasury != address(0), "Invalid new treasury");
        pendingTreasury = _newTreasury;
        emit TreasuryTransferStarted(treasury, _newTreasury);
    }

    /**
     * @dev Step 2: Accept treasury transfer
     */
    function acceptTreasury() external {
        require(msg.sender == pendingTreasury, "Only pending treasury can accept");
        address oldTreasury = treasury;
        treasury = pendingTreasury;
        pendingTreasury = address(0);
        emit TreasuryTransferCompleted(oldTreasury, treasury);
    }
}
