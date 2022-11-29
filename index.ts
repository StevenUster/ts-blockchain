import * as crypto from "crypto";
import express from "express";
import cors from "cors";

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

  genesisWallet: string =
    "-----BEGIN PUBLIC KEY----- MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAOKhfNgutjusqZyTkqGuooUbW9Era82i 9sOciIeJ2dx/PUR4SrPisfLPRxKSKaTg8DIE5wYftkQtCKiqzOvVnxcCAwEAAQ== -----END PUBLIC KEY-----";

  chain: Block[];

  constructor() {
    console.log("\x1b[2J\x1b[0f");
    this.chain = [
      // Genesis block
      new Block("", new Transaction(10000, "genesis", this.genesisWallet)),
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
    let balance = 0;

    for (const block of this.chain) {
      const transaction = block.data;
      if (transaction.payer === address) {
        balance -= transaction.amount;
      }

      if (transaction.payee === address) {
        balance += transaction.amount;
      }
    }

    return balance;
  }
}

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

// -----------------------------------------------

const app = express();
const port = 3000;

app.get("/new_wallet", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  const wallet = new Wallet();
  console.log("\x1b[0m", "");
  console.log("\x1b[32m%s\x1b[0m", "💰 Neue Wallet erstellt");
  console.log("\x1b[0m", "");
  console.log(wallet.publicKey);
  console.log("Genesis: " + Chain.instance.getBalance(Chain.instance.genesisWallet));
  res.send(wallet);
});

app.get("/send", (req: any, res: any) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  const wallet = new Wallet();
  wallet.sendMoney(
    32,
    "-----BEGIN PUBLIC KEY----- MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAOKhfNgutjusqZyTkqGuooUbW9Era82i 9sOciIeJ2dx/PUR4SrPisfLPRxKSKaTg8DIE5wYftkQtCKiqzOvVnxcCAwEAAQ== -----END PUBLIC KEY-----"
  );
  console.log("\x1b[0m", "");
  console.log(Chain.instance);
  console.log("\x1b[0m", "");
  res.send(
    `Es wurden ${req.query.amount} CheeseCoin🧀 an ${req.query.payeePublicKey} gesendet`
  );
});

app.use(cors({ credentials: true, origin: true }));

app.listen(port, () => {
  console.log(`#### CheeseCoin🧀 Blockchain online ####`);
});

// http://localhost:3000/send?publicKey="-----BEGIN PUBLIC KEY----- MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAOKhfNgutjusqZyTkqGuooUbW9Era82i 9sOciIeJ2dx/PUR4SrPisfLPRxKSKaTg8DIE5wYftkQtCKiqzOvVnxcCAwEAAQ== -----END PUBLIC KEY-----"&privateKey="-----BEGIN PRIVATE KEY----- MIIBVQIBADANBgkqhkiG9w0BAQEFAASCAT8wggE7AgEAAkEA4qF82C62O6ypnJOS oa6ihRtb0StrzaL2w5yIh4nZ3H89RHhKs+Kx8s9HEpIppODwMgTnBh+2RC0IqKrM 69WfFwIDAQABAkEAwAMeaXM6RtkFY3nM1FvHqosBgfkN/05BUH6BVoS/Jwa2jsni mSBL649xJR57Zkc/JyzBwRjDjsvQkQOAGRT7oQIhAPnPu4po3KGEgl3dbyygBRSi iZMDJrDYrNI7HdIHjJ8fAiEA6D6/MpAmEKvX/JP+bNGm82Kmbn6mfbVrIvVytrpm GQkCIEmqhoVUUuuWZdNEP0qLjbP+Ek+1+CziWGROZobPDxrFAiBpTxJ5hf2Mr69H e3/xrfsq/3+COPGbrOjAuFVk4A6tqQIhALHQ/htkS/55jVVOv/JTyhd2KH+0b5pr OhfYfWZDpFOW -----END PRIVATE KEY-----"&amount=10&payeePublicKey="-----BEGIN PUBLIC KEY----- MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAOKhfNgutjusqZyTkqGuooUbW9Era82i 9sOciIeJ2dx/PUR4SrPisfLPRxKSKaTg8DIE5wYftkQtCKiqzOvVnxcCAwEAAQ== -----END PUBLIC KEY-----"
