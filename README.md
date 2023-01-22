# EVM Emit

Emit EVM all events

## Setup

`npm install`

`cp .env.example .env`

Update `.env` file

```
ADMIN_KEY=321
```

`npm run dev`

Emmited event:

```json
{
   "hash":"0x85eff29f7fdddb546791e1069acb234a8ef34f6074a176cf1dc4ad7049ce0f26",
   "type":0,
   "accessList":null,
   "blockHash":"0x3ab2920f7090f92f16bdeb16eb7ad71e8460e4811ef9e950429f6273f8fc74b9",
   "blockNumber":8358204,
   "transactionIndex":2,
   "confirmations":1,
   "from":"0x0Ec623C5cF267ec67F5a86F80E6e9f48C2eA08E1",
   "gasPrice":"BigNumber"{
      "_hex":"0x0342770c00",
      "_isBigNumber":true
   },
   "gasLimit":"BigNumber"{
      "_hex":"0x018705",
      "_isBigNumber":true
   },
   "to":"0x3a034FE373B6304f98b7A24A3F21C958946d4075",
   "value":"BigNumber"{
      "_hex":"0x00",
      "_isBigNumber":true
   },
   "nonce":38,
   "data":"0x095ea7b3000000000000000000000000be22a9285216264effa69e9207921b19589b9b63ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
   "r":"0xd0dc6ea619302bb10cf6f895853ba948c504c4f8cd029ee6c77164400a47b6a7",
   "s":"0x503ad86ce6eb889ec90fd21aacc27e486b1af95514fcbab9f6c6776b43fde951",
   "v":46,
   "creates":null,
   "chainId":5,
   "wait":[
      "Function (anonymous)"
   ],
   "contractAddress":null,
   "gasUsed":"BigNumber"{
      "_hex":"0x6844",
      "_isBigNumber":true
   },
   "logsBloom":"0x00000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000400000400000200000000000000000000000000000000000000000000040000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000001000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000040000000000000000010000000000000000000000000000000000000000000000000000000000000",
   "transactionHash":"0x85eff29f7fdddb546791e1069acb234a8ef34f6074a176cf1dc4ad7049ce0f26",
   "logs":[
      {
         "transactionIndex":2,
         "blockNumber":8358204,
         "transactionHash":"0x85eff29f7fdddb546791e1069acb234a8ef34f6074a176cf1dc4ad7049ce0f26",
         "address":"0x3a034FE373B6304f98b7A24A3F21C958946d4075",
         "topics":[
            "Array"
         ],
         "data":"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
         "logIndex":2,
         "blockHash":"0x3ab2920f7090f92f16bdeb16eb7ad71e8460e4811ef9e950429f6273f8fc74b9"
      }
   ],
   "cumulativeGasUsed":"BigNumber"{
      "_hex":"0x01acca",
      "_isBigNumber":true
   },
   "effectiveGasPrice":"BigNumber"{
      "_hex":"0x0342770c00",
      "_isBigNumber":true
   },
   "status":1,
   "byzantium":true
}
```
