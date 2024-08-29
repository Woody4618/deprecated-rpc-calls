There are bunch of RPC calls that are deprecated and will be removed very soon.
You can find the deprecated calls here:
https://github.com/anza-xyz/agave/wiki/Agave-v2.0-Transition-Guide

In the tests file of the program in this repository you can find all the deprecated calls and their replacements.

Here you can find a replacement implementation for getStakeActivation rust and JS client side here:
https://github.com/solana-developers/solana-rpc-get-stake-activation

These are the deprecated calls and their current usages to help you identify which ones you may still have in use:

```
no usage     - confirmTransaction
no usage     - getSignatureStatus
no usage     - getSignatureConfirmation
no usage     - getTotalSupply
no usage     - getConfirmedSignaturesForAddress
no usage     - getConfirmedBlock
avg usage    - getConfirmedBlocks
popular      - getConfirmedBlocksWithLimit
popular      - getConfirmedTransaction
very popular - getConfirmedSignaturesForAddress2
very popular - getRecentBlockhash
avg usage    - getFees
popular      - getFeeCalculatorForBlockhash
avg usage    - getFeeRateGovernor
no usage     - getSnapshotSlot
popular      - getStakeActivation

```

Where

- no usage - 0 rps
- avg usage - less than 1 rps
- popular - more than 1 rps
- very popular - hundreds of rps

Replacement for getStakeActivation: https://github.com/solana-developers/solana-rpc-get-stake-activation
