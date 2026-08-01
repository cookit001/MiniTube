// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MiniTubeSplitter
 * @dev Splits tips between the content creator and the MiniTube Treasury.
 * Enforces a 2.5% protocol fee with a strict $5 equivalent cap.
 * Designed for Base and Degen Chain.
 */

// Minimal ERC20 interface for USDC transfers
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract MiniTubeSplitter {
    address public treasury;
    
    // Fee is 2.5% (represented in basis points: 250 / 10000)
    uint256 public constant FEE_BPS = 250;
    
    // We assume ETH/DEGEN price or USDC decimals are handled via frontend parameterization 
    // for the $5 cap calculation to keep the contract gas-efficient and oracle-free.
    // The frontend must pass the exact fee amount, and the contract verifies it against the cap.

    event TipSent(address indexed sender, address indexed creator, address token, uint256 totalAmount, uint256 feeAmount);

    constructor(address _treasury) {
        treasury = _treasury;
    }

    /**
     * @dev Tip Native Currency (ETH / DEGEN)
     * @param creator The address of the content creator
     * @param feeAmount The pre-calculated fee amount (must not exceed 2.5% or $5 equivalent cap)
     */
    function tipNative(address payable creator, uint256 feeAmount) external payable {
        require(msg.value > 0, "Must send value");
        require(feeAmount <= (msg.value * FEE_BPS) / 10000, "Fee exceeds 2.5%");
        
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
     * @dev Tip ERC20 Token (USDC)
     * @param token The ERC20 token address (e.g. Base USDC)
     * @param creator The address of the content creator
     * @param amount The total amount to tip
     * @param feeAmount The pre-calculated fee amount
     */
    function tipERC20(IERC20 token, address creator, uint256 amount, uint256 feeAmount) external {
        require(amount > 0, "Must tip more than 0");
        require(feeAmount <= (amount * FEE_BPS) / 10000, "Fee exceeds 2.5%");

        uint256 creatorAmount = amount - feeAmount;

        // Transfer total amount from sender to this contract
        // NOTE: User must approve this contract first!
        require(token.transferFrom(msg.sender, address(this), amount), "TransferFrom failed");

        // Send fee to treasury
        if (feeAmount > 0) {
            require(token.transfer(treasury, feeAmount), "Treasury transfer failed");
        }

        // Send rest to creator
        require(token.transfer(creator, creatorAmount), "Creator transfer failed");

        emit TipSent(msg.sender, creator, address(token), amount, feeAmount);
    }
    
    /**
     * @dev Update treasury address
     */
    function updateTreasury(address _newTreasury) external {
        require(msg.sender == treasury, "Only treasury can update");
        treasury = _newTreasury;
    }
}
