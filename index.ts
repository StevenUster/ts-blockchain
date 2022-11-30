import * as crypto from "crypto";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

// Wallet gives a user a public/private keypair
class Wallet {
  public publicKey: string;
  public privateKey: string;

  constructor(publicKey = "", privateKey = "") {
    if (!publicKey && !privateKey) {
      const keypair = crypto.generateKeyPairSync("rsa", {
        modulusLength: 512,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
      });
      this.privateKey = keypair.privateKey;
      this.publicKey = keypair.publicKey;
    } else {
      this.publicKey = publicKey;
      this.privateKey = privateKey;
    }
  }

  sendMoney(amount: number, payeePublicKey: string) {
    if (amount > Chain.instance.getBalance(this.publicKey)) {
      console.log("\x1b[0m", "");
      console.log("\x1b[31m", "💩 Transaktionabgelehnt:");
      console.log("Menge überschreitet dein Guthaben");
      console.log("\x1b[0m", "");
      return false;
    }
    const transaction = new Transaction(amount, this.publicKey, payeePublicKey);

    const sign = crypto.createSign("SHA256");
    sign.update(transaction.toString()).end();

    const signature = sign.sign(this.privateKey);
    Chain.instance.addBlock(transaction, this.publicKey, signature);

    console.log("\x1b[0m", "");
    console.log("💸 CheeseCoin🧀 gesendet");
    console.log("\x1b[0m", "");
  }
}

// Transfer of funds between two wallets
class Transaction {
  constructor(
    public amount: number,
    public payer: string, // public key
    public payee: string // public key
  ) {
    console.log("\x1b[0m", "");
    console.log(this);
    console.log("\x1b[0m", "");
  }

  toString() {
    return JSON.stringify(this);
  }
}

// Individual block on the chain
class Block {
  public nonce = Math.round(Math.random() * 999999999);
  public currentHash: string = this.hash;

  constructor(
    public prevHash: string,
    public data: Transaction,
    public timestamp = new Date(Date.now()).toString()
  ) {}

  get hash() {
    if (this.currentHash) {
      return this.currentHash;
    }
    const str = JSON.stringify(this);
    const hash = crypto.createHash("SHA256");
    hash.update(str).end();
    this.currentHash = hash.digest("hex");
    return this.currentHash;
  }
}

// The blockchain
class Chain {
  // Singleton instance
  public static instance = new Chain();

  genesisWallet: Wallet = new Wallet();

  chain: Block[];

  constructor() {
    console.log("\x1b[2J\x1b[0f");
    this.chain = [
      // Genesis block
      new Block(
        "",
        new Transaction(1000000, "genesis", this.genesisWallet.publicKey)
      ),
    ];
  }

  // Most recent block
  get lastBlock() {
    return this.chain[this.chain.length - 1];
  }

  // Proof of work system
  mine(nonce: number) {
    let solution = 1;
    console.log("⛏️  mining...");

    while (true) {
      const hash = crypto.createHash("MD5");
      hash.update((nonce + solution).toString()).end();

      const attempt = hash.digest("hex");

      if (attempt.substr(0, 4) === "0000") {
        console.log(`Solved: ${solution}`);
        return solution;
      }

      solution += 1;
    }
  }

  // Add a new block to the chain if valid signature & proof of work is complete
  addBlock(data: Transaction, senderPublicKey: string, signature: Buffer) {
    const verify = crypto.createVerify("SHA256");
    verify.update(data.toString());

    const isValid = verify.verify(senderPublicKey, signature);

    if (isValid) {
      const newBlock = new Block(this.lastBlock.hash, data);
      this.mine(newBlock.nonce);
      this.chain.push(newBlock);
    }
  }

  getBalance(address: string) {
    let balance: number = 0;

    for (const block of this.chain) {
      const transaction = block.data;
      if (transaction.payer === address) {
        balance -= +transaction.amount;
      }

      if (transaction.payee === address) {
        balance += +transaction.amount;
      }
    }

    return balance;
  }

  printChain() {
    console.log("\x1b[0m", "");
    console.log("\x1b[32m", "🔗 Chain");
    console.log("\x1b[0m", "");
    console.log(this.chain);
  }
}





















// -----------------------------------------------

const app = express();
const port = 3000;
const jsonParser = bodyParser.json();

app.get("/chain", (req, res) => {
  console.log("\x1b[2J\x1b[0f");
  Chain.instance.printChain();
  res.send(Chain.instance);
});

app.get("/new_wallet", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  const wallet = new Wallet();
  console.log("\x1b[0m", "");
  console.log("\x1b[32m%s\x1b[0m", "💰 Neue Wallet erstellt");
  console.log("\x1b[0m", "");
  console.log(wallet.publicKey);
  Chain.instance.genesisWallet.sendMoney(100, wallet.publicKey);
  res.send(wallet);
});

app.post("/send", jsonParser, (req: any, res: any) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  const wallet = new Wallet(
    req.body.payer.publicKey,
    req.body.payer.privateKey
  );
  wallet.sendMoney(req.body.amount, req.body.payee);

  res.send(`Es wurden ${req.body.amount} CheeseCoin🧀 an eine Wallet gesendet`);
});

app.get("/balance", jsonParser, (req: any, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");

  const keys = JSON.parse(req.headers.wallet);
  const wallet = new Wallet(keys.publicKey, keys.privateKey);
  const balance = Chain.instance.getBalance(wallet.publicKey);

  res.send(balance.toString());
});

app.use(cors({ credentials: true, origin: true }));

app.listen(port, () => {
  console.log(`#### CheeseCoin🧀 Blockchain online ####`);
  console.log("\x1b[0m", "");
  Chain.instance.printChain();
});
