# EVM Emit

Emit EVM all events

## Setup

`npm install`

```bash
cp .env.example .env
```

Update `.env` file

```
DATABASE_URL="mysql://johndoe:randompassword@localhost:5432/mydb?schema=public"
```

```bash
npm run dev
```

## Database

Create Table

```bash
npx prisma db push
```

Insert mock transaction

```sql
INSERT INTO Trigger (webhookUrl, chainId, address, lemonsqueezy) VALUES ('https://express-demo.leondo.repl.co?foo', 5, '0xdd4c825203f97984e7867f11eecc813a036089d1', '1emon');
```

Insert mock event

https://goerli.etherscan.io/address/0xeb3c1910d1556bf7eabcc1725ef24af28106c5b2#writeContract

```sql
INSERT INTO Trigger (
  webhookUrl,
  chainId,
  address,
  event,
  abi,
  lemonsqueezy
) VALUES (
    'https://express-demo.leondo.repl.co?bar',
    5,
    '0xeb3c1910d1556bf7eabcc1725ef24af28106c5b2',
    'Event1(address)',
    '[ { "inputs": [], "name": "emit1", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "emit2", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "emit3", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "emit4", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "_addressA", "type": "address" } ], "name": "Event1", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "_addressB", "type": "address" } ], "name": "Event2", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "_addressA", "type": "address" }, { "indexed": true, "internalType": "address", "name": "_addressB", "type": "address" } ], "name": "Event3", "type": "event" } ]',
    '1emon'
);
```
