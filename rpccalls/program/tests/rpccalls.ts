import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Rpccalls } from "../target/types/rpccalls";

describe("rpccalls", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Rpccalls as Program<Rpccalls>;
  const payer = provider.wallet as anchor.Wallet;
  const gameDataSeed = "gameData";

  const [playerPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("player"), payer.publicKey.toBuffer()],
    program.programId
  );

  console.log("Player PDA", playerPDA.toBase58());

  const [gameDataPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(gameDataSeed)],
    program.programId
  );

  it("testConfirmTransaction", async () => {
    console.log("Local address", payer.publicKey.toBase58());

    try {
      let tx = await program.methods
        .initPlayer(gameDataSeed)
        .accountsStrict({
          player: playerPDA,
          signer: payer.publicKey,
          gameData: gameDataPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc({ skipPreflight: true });
      console.log("Init transaction", tx);

      // You can still use "confirmTransaction" in Web3.JS you just now need to pass in a confirmation strategy and in the back it will not call the
      // "confirmTransaction" RPC method from the connection but internally use different strategies for confirm the transaction.
      // It will call getBlockheight in a loop with a delay for lastValidBlockHeight strategy for example.
      // You can find the code here: https://github.com/solana-labs/solana-web3.js/blob/2d5916986ebc7b1a41f3b3c44227131a638e3a07/src/connection.ts#L3824
      // The default strategy calls getSignatureStatuses in a loop.
      await anchor.getProvider().connection.confirmTransaction(tx, "confirmed");

      const blockhashInfo = await anchor
        .getProvider()
        .connection.getLatestBlockhash();

      let confirmTransactionResult = await anchor
        .getProvider()
        .connection.confirmTransaction(
          {
            blockhash: blockhashInfo.blockhash,
            lastValidBlockHeight: blockhashInfo.lastValidBlockHeight,
            signature: tx,
          },
          "confirmed"
        );

      console.log("ConfirmTransactionResult", confirmTransactionResult);

      var res = await anchor
        .getProvider()
        .connection.getSignatureStatuses([tx]);

      console.log(JSON.stringify(res));

      console.log("Confirmed", tx);
    } catch (e) {
      console.log("Player already exists: ", e);
    }
  });

  it("deprecated calls and replacements", async () => {
    let tx = await program.methods
      .chopTree(gameDataSeed, 0)
      .accountsStrict({
        player: playerPDA,
        sessionToken: null,
        signer: payer.publicKey,
        gameData: gameDataPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
    console.log("Chop instruction", tx);

    await anchor.getProvider().connection.confirmTransaction(tx, "confirmed");

    // This one calls internally getSignatureStatuses, so no problem in Web3.JS
    var signatureResult = await anchor
      .getProvider()
      .connection.getSignatureStatus(tx);

    // This one should be replaced by getSignatureStatuses
    // var getConfirmedSignaturesForAddress = await anchor
    //   .getProvider()
    //   .connection.getConfirmedSignaturesForAddress(payer.publicKey, 0, 100);

    var getSignatureStatuses = await anchor
      .getProvider()
      .connection.getSignatureStatuses([tx]);

    // getConfirmedBlock should be replaced by getBlock with a GetVersionedBlockConfig
    var getConfirmedBlock = await anchor
      .getProvider()
      .connection.getConfirmedBlock(0, "confirmed");

    var getBlock = await anchor.getProvider().connection.getBlock(0, {
      commitment: "confirmed",
      rewards: true,
      transactionDetails: "full",
      maxSupportedTransactionVersion: 2,
    });

    // getConfirmedBlock and getConfirmedBlocks should be relpaced by getBlocks setting the commitment level to confirmed
    var getBlocks = await anchor
      .getProvider()
      .connection.getBlocks(0, 100, "confirmed");

    // getConfirmedBlocksWithLimit does not exist in the Web3.JS API
    // var getBlocksWithLimit = await anchor.getProvider().connection.getConfirmedBlocksWithLimit(

    var getConfirmedTransaction = await anchor
      .getProvider()
      .connection.getConfirmedTransaction(tx as string, "confirmed");

    // getConfirmedTransaction should be replaced by getTransaction setting the maxSupportedTransactionVersion
    var getTransaction = await anchor
      .getProvider()
      .connection.getTransaction(tx, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 2,
      });

    // getConfirmedSignaturesForAddress2 should be replaced by getSignaturesForAddress
    var getConfirmedSignaturesForAddress2 = await anchor
      .getProvider()
      .connection.getConfirmedSignaturesForAddress2(
        payer.publicKey,
        {
          before: tx,
          until: tx,
          limit: 100,
        },
        "confirmed"
      );

    // replacement:
    var getSignaturesForAddress = await anchor
      .getProvider()
      .connection.getSignaturesForAddress(
        payer.publicKey,
        {
          before: tx,
          until: tx,
          limit: 100,
        },
        "confirmed"
      );

    // getRecentBlockhash should be replaced by getLatestBlockhash
    var getRecentBlockhash = await anchor
      .getProvider()
      .connection.getRecentBlockhash("confirmed");

    var getLatestBlockhash = await anchor
      .getProvider()
      .connection.getLatestBlockhash("confirmed");

    // getFees should not be used anymore. It does not exist in the Web3.JS API
    // var getFees = await anchor.getProvider().connection.getFees("confirmed");

    // getFeeCalculatorForBlockhash should be replaced by getFeeForMessage
    var getFeeCalculatorForBlockhash = await anchor
      .getProvider()
      .connection.getFeeCalculatorForBlockhash(
        (
          await anchor.getProvider().connection.getLatestBlockhash()
        ).blockhash,
        "confirmed"
      );

    // To use getFeeForMessage you need to create a message first. Basically the get the transaction message
    let message = await program.methods
      .chopTree(gameDataSeed, 0)
      .accountsStrict({
        player: playerPDA,
        sessionToken: null,
        signer: payer.publicKey,
        gameData: gameDataPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .transaction();

    message.recentBlockhash = (
      await anchor.getProvider().connection.getLatestBlockhash()
    ).blockhash;
    message.feePayer = payer.publicKey;
    message.sign(payer.payer);
    const transaction = new anchor.web3.TransactionMessage(message);
    transaction.payerKey = payer.publicKey;

    // Then you can get the fees for that message compiling it to legacy or V0 (including address lookup tables)
    var getFeeForMessage = await anchor
      .getProvider()
      .connection.getFeeForMessage(transaction.compileToV0Message());

    console.log("Fee for message", getFeeForMessage);
    // Fee for message { context: { apiVersion: '1.18.22', slot: 3 }, value: 5000 } so 5000 lamports = 0.000005 SOL

    // getFeeRateGovernor should not be used anymore and does not exist in the Web3.JS API
    // var getFeeRateGovernor = await anchor.getProvider().connection.getFeeRateGovernor();

    // getFeeRateGovernor should not be used anymore and does not exist in the Web3.JS API
    // var getSnapshotSlot = await anchor.getProvider().connection.getSnapshotSlot("confirmed");

    // getStakeActivation will not exist anymore and there is only client side replacement which you can find here:
    // https://github.com/solana-developers/solana-rpc-get-stake-activation
  });
});
